import { supabase } from "./supabase"

export interface ReferralData {
  totalReferrals: number
  successfulReferrals: number
  pendingReferrals: number
  rewardsEarned: number
  currentTier: string
  nextTier: string
  pointsToNextTier: number
  referralHistory: Array<{
    name: string
    status: string
    joinDate: string
    reward: number
  }>
}

export interface ReferralValidationResult {
  isValid: boolean
  referrerName?: string
  referrerId?: string
  message: string
}

export const generateReferralCode = async (userId: string, userName: string): Promise<string> => {
  try {
    const { data, error } = await supabase.rpc("generate_referral_code", {
      user_name: userName,
    })

    if (error) throw error

    // Insert the generated code
    const { error: insertError } = await supabase.from("referral_codes").insert({
      user_id: userId,
      code: data,
    })

    if (insertError) throw insertError

    return data
  } catch (error) {
    console.error("Error generating referral code:", error)
    throw new Error("Failed to generate referral code")
  }
}

export const getUserReferralCode = async (userId: string): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from("referral_codes")
      .select("code")
      .eq("user_id", userId)
      .eq("is_active", true)
      .single()

    if (error && error.code !== "PGRST116") throw error
    return data?.code || null
  } catch (error) {
    console.error("Error getting user referral code:", error)
    return null
  }
}

export const validateReferralCode = async (code: string): Promise<ReferralValidationResult> => {
  if (!code || code.trim().length === 0) {
    return {
      isValid: false,
      message: "Please enter a referral code",
    }
  }

  try {
    // Use the public validation function
    const { data, error } = await supabase.rpc("validate_referral_code_public", {
      code_input: code.toUpperCase(),
    })

    if (error) {
      console.error("Referral validation error:", error)
      return {
        isValid: false,
        message: "Unable to validate referral code. Please try again later.",
      }
    }

    if (data && data.length > 0) {
      const result = data[0]
      return {
        isValid: result.is_valid,
        referrerName: result.referrer_name,
        message: result.message,
      }
    }

    return {
      isValid: false,
      message: "Invalid referral code format",
    }
  } catch (error) {
    console.error("Error validating referral code:", error)
    return {
      isValid: false,
      message: "Unable to validate referral code. Please try again later.",
    }
  }
}

export const getReferralData = async (userId: string): Promise<ReferralData> => {
  try {
    // Get user rewards
    const { data: userRewards, error: rewardsError } = await supabase
      .from("user_rewards")
      .select("*")
      .eq("user_id", userId)
      .single()

    if (rewardsError && rewardsError.code !== "PGRST116") {
      console.error("Error fetching user rewards:", rewardsError)
    }

    // Get referral history
    const { data: referrals, error: referralsError } = await supabase
      .from("referrals")
      .select(`
        *,
        user_profiles!referrals_referred_id_fkey (
          name
        )
      `)
      .eq("referrer_id", userId)
      .order("created_at", { ascending: false })

    if (referralsError) {
      console.error("Error fetching referrals:", referralsError)
    }

    // Get reward tiers
    const { data: tiers, error: tiersError } = await supabase
      .from("reward_tiers")
      .select("*")
      .order("min_referrals", { ascending: true })

    if (tiersError) {
      console.error("Error fetching reward tiers:", tiersError)
    }

    const successfulReferrals = userRewards?.successful_referrals || 0
    const totalReferrals = userRewards?.total_referrals || 0
    const rewardsEarned = userRewards?.total_points || 0

    // Determine current and next tier
    let currentTier = "Dream Starter"
    let nextTier = "Dream Advocate"
    let pointsToNextTier = 90 // 3 referrals * 30 points

    if (tiers && tiers.length > 0) {
      for (let i = 0; i < tiers.length; i++) {
        if (successfulReferrals >= tiers[i].min_referrals) {
          currentTier = tiers[i].name
          if (i < tiers.length - 1) {
            nextTier = tiers[i + 1].name
            pointsToNextTier = (tiers[i + 1].min_referrals - successfulReferrals) * 30 // 30 points per referral
          } else {
            nextTier = "Max Tier Reached"
            pointsToNextTier = 0
          }
        }
      }
    }

    const referralHistory =
      referrals?.map((referral) => ({
        name: referral.user_profiles?.name || "Anonymous User",
        status: referral.status,
        joinDate: new Date(referral.created_at).toLocaleDateString(),
        reward: referral.reward_points,
      })) || []

    return {
      totalReferrals,
      successfulReferrals,
      pendingReferrals: totalReferrals - successfulReferrals,
      rewardsEarned,
      currentTier,
      nextTier,
      pointsToNextTier,
      referralHistory,
    }
  } catch (error) {
    console.error("Error getting referral data:", error)
    // Return default data on error
    return {
      totalReferrals: 0,
      successfulReferrals: 0,
      pendingReferrals: 0,
      rewardsEarned: 0,
      currentTier: "Dream Starter",
      nextTier: "Dream Advocate",
      pointsToNextTier: 90,
      referralHistory: [],
    }
  }
}

// Check if a referral code is valid without revealing sensitive information
export const checkReferralCodeExists = async (code: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from("referral_codes")
      .select("code")
      .eq("code", code.toUpperCase())
      .eq("is_active", true)
      .single()

    return !error && !!data
  } catch (error) {
    console.error("Error checking referral code:", error)
    return false
  }
}

// Initialize referral code for new user
export const initializeUserReferralCode = async (userId: string, userName: string): Promise<string | null> => {
  try {
    // Check if user already has a referral code
    const existingCode = await getUserReferralCode(userId)
    if (existingCode) {
      return existingCode
    }

    // Generate new referral code
    const newCode = await generateReferralCode(userId, userName)
    return newCode
  } catch (error) {
    console.error("Error initializing referral code:", error)
    return null
  }
}
