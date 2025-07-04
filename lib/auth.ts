import { supabase } from "./supabase"
import { validateReferralCode } from "./referrals"

export const signUp = async (email: string, password: string, userData: any) => {
  try {
    // Validate referral code if provided
    let referralValidation = null
    if (userData.referralCode) {
      referralValidation = await validateReferralCode(userData.referralCode)
      if (!referralValidation.isValid) {
        throw new Error(`Invalid referral code: ${referralValidation.message}`)
      }
    }

    // Include referral code in user metadata for the trigger to process
    const userMetadata = {
      name: userData.name,
      referral_code: userData.referralCode || null,
      referrer_id: referralValidation?.referrerId || null,
    }

    // Sign up the user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userMetadata,
      },
    })

    if (error) {
      console.error("Signup error:", error)
      throw error
    }

    if (!data.user) {
      throw new Error("User creation failed")
    }

    // Wait a moment for the auth context to be established
    await new Promise((resolve) => setTimeout(resolve, 300))

    // Create user profile using the new JSON-based function
    try {
      const profileData = {
        user_id: data.user.id,
        name: userData.name,
        email: userData.email,
        dream_frequency: userData.dreamFrequency,
        journal_experience: userData.journalExperience,
        goals: userData.goals,
        notification_time: userData.notificationTime[0],
        privacy_level: userData.privacyLevel,
      }

      const { data: profileResult, error: profileError } = await supabase.rpc("create_user_profile_json", {
        profile_data: profileData,
      })

      if (profileError) {
        console.error("Profile creation RPC error:", profileError)
        // Try fallback method
        await createProfileFallback(data.user.id, userData)
      } else if (profileResult && !profileResult.success) {
        console.error("Profile creation failed:", profileResult.message)
        // Try fallback method
        await createProfileFallback(data.user.id, userData)
      }
    } catch (profileError) {
      console.error("Profile creation failed:", profileError)
      // Try fallback method
      await createProfileFallback(data.user.id, userData)
    }

    // Handle referral bonus if applicable
    if (userData.referralCode && referralValidation?.isValid) {
      try {
        // Add welcome bonus for using referral code
        const { error: bonusError } = await supabase.from("user_rewards").upsert({
          user_id: data.user.id,
          total_points: 10, // Welcome bonus
          current_tier: "Dream Starter",
          total_referrals: 0,
          successful_referrals: 0,
          updated_at: new Date().toISOString(),
        })

        if (bonusError) {
          console.error("Failed to add referral bonus:", bonusError)
        }
      } catch (bonusError) {
        console.error("Referral bonus error:", bonusError)
      }
    }

    return data
  } catch (error) {
    console.error("SignUp process error:", error)
    throw error
  }
}

// Fallback method for profile creation using direct table operations
const createProfileFallback = async (userId: string, userData: any) => {
  try {
    console.log("Attempting fallback profile creation...")

    // Try direct insertion with upsert
    const { error: profileError } = await supabase.from("user_profiles").upsert(
      {
        id: userId,
        name: userData.name,
        email: userData.email,
        dream_frequency: userData.dreamFrequency,
        journal_experience: userData.journalExperience,
        goals: userData.goals,
        notification_time: userData.notificationTime[0],
        privacy_level: userData.privacyLevel,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "id",
      },
    )

    if (profileError) {
      console.error("Fallback profile creation failed:", profileError)
    } else {
      console.log("Fallback profile creation succeeded")
    }

    // Try to initialize rewards
    const { error: rewardsError } = await supabase.from("user_rewards").upsert(
      {
        user_id: userId,
        total_points: 0,
        current_tier: "Dream Starter",
        total_referrals: 0,
        successful_referrals: 0,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id",
      },
    )

    if (rewardsError) {
      console.error("Fallback rewards initialization failed:", rewardsError)
    } else {
      console.log("Fallback rewards initialization succeeded")
    }
  } catch (error) {
    console.error("Complete fallback failed:", error)
  }
}

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) throw error
  return data
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export const getCurrentUser = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

// Helper function to ensure user profile exists with better error handling
export const ensureUserProfile = async (user: any) => {
  if (!user?.id) return null

  try {
    // First try the get_or_create function
    const { data: profiles, error: getError } = await supabase.rpc("get_or_create_user_profile", {
      user_id_param: user.id,
    })

    if (getError) {
      console.error("Get or create profile function failed:", getError)
      // Fallback to direct query
      return await getProfileDirectly(user.id)
    }

    if (profiles && profiles.length > 0) {
      return profiles[0]
    }

    // If no profile returned, try direct query
    return await getProfileDirectly(user.id)
  } catch (error) {
    console.error("Error ensuring user profile:", error)
    return await getProfileDirectly(user.id)
  }
}

// Direct profile query as final fallback
const getProfileDirectly = async (userId: string) => {
  try {
    const { data: profile, error: profileError } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", userId)
      .single()

    if (profileError && profileError.code === "PGRST116") {
      // Profile doesn't exist, create minimal one
      const { error: createError } = await supabase.from("user_profiles").insert({
        id: userId,
        name: "User",
        email: "",
        dream_frequency: "sometimes",
        journal_experience: "beginner",
        goals: ["Better understand my dreams"],
        notification_time: 21,
        privacy_level: "high",
      })

      if (createError) {
        console.error("Failed to create minimal profile:", createError)
        return null
      }

      // Return the newly created profile
      const { data: newProfile } = await supabase.from("user_profiles").select("*").eq("id", userId).single()

      return newProfile
    }

    if (profileError) {
      console.error("Failed to fetch profile directly:", profileError)
      return null
    }

    return profile
  } catch (error) {
    console.error("Direct profile query failed:", error)
    return null
  }
}
