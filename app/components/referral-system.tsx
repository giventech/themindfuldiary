"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Share2, Copy, Mail, MessageCircle, Check, Heart, Loader2, Trophy, Users, Gift } from "lucide-react"
import { getUserReferralCode, initializeUserReferralCode, getReferralData, type ReferralData } from "@/lib/referrals"

interface ReferralSystemProps {
  user: any
}

export default function ReferralSystem({ user }: ReferralSystemProps) {
  const [referralCode, setReferralCode] = useState("")
  const [customMessage, setCustomMessage] = useState("")
  const [copiedCode, setCopiedCode] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [referralData, setReferralData] = useState<ReferralData | null>(null)

  useEffect(() => {
    initializeReferralSystem()
  }, [user])

  const initializeReferralSystem = async () => {
    if (!user?.id) return

    setIsLoading(true)
    try {
      // Get or create referral code
      let code = await getUserReferralCode(user.id)
      if (!code) {
        code = await initializeUserReferralCode(user.id, user.name || "User")
      }

      if (code) {
        setReferralCode(code)
      }

      // Get referral data
      const data = await getReferralData(user.id)
      setReferralData(data)

      // Set default personalized message
      setCustomMessage(
        `Hi! I've been using DreamWise to explore my dreams and practice mindful reflection. It's been amazing for my personal growth! Join me on this journey of self-discovery. 🌙✨`,
      )
    } catch (error) {
      console.error("Error initializing referral system:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const referralLink = `${window.location.origin}/join?ref=${referralCode}`

  const copyToClipboard = async (text: string, type: "code" | "link") => {
    try {
      await navigator.clipboard.writeText(text)
      if (type === "code") {
        setCopiedCode(true)
        setTimeout(() => setCopiedCode(false), 2000)
      } else {
        setCopiedLink(true)
        setTimeout(() => setCopiedLink(false), 2000)
      }
    } catch (err) {
      console.error("Failed to copy: ", err)
    }
  }

  const shareViaEmail = () => {
    const subject = encodeURIComponent("Join me on DreamWise - Your Personal Growth Journey")
    const body = encodeURIComponent(`${customMessage}\n\nUse my referral link: ${referralLink}`)
    window.open(`mailto:?subject=${subject}&body=${body}`)
  }

  const shareViaSMS = () => {
    const message = encodeURIComponent(`${customMessage}\n\nJoin here: ${referralLink}`)
    window.open(`sms:?body=${message}`)
  }

  const shareViaWhatsApp = () => {
    const message = encodeURIComponent(`${customMessage}\n\nJoin here: ${referralLink}`)
    window.open(`https://wa.me/?text=${message}`)
  }

  const shareViaNative = () => {
    if (navigator.share) {
      navigator.share({
        title: "Join me on DreamWise",
        text: customMessage,
        url: referralLink,
      })
    } else {
      // Fallback to copying link
      copyToClipboard(referralLink, "link")
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
            <Share2 className="h-6 w-6 text-indigo-600" />
            Share DreamWise
          </h2>
          <p className="text-gray-600 dark:text-gray-400">Invite friends to join your mindful journey</p>
        </div>
      </div>

      {/* Referral Stats */}
      {referralData && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700">
            <CardContent className="p-4 text-center">
              <Users className="h-8 w-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">{referralData.totalReferrals}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Referrals</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-700">
            <CardContent className="p-4 text-center">
              <Check className="h-8 w-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                {referralData.successfulReferrals}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Successful</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-700">
            <CardContent className="p-4 text-center">
              <Gift className="h-8 w-8 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">{referralData.rewardsEarned}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Points Earned</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-700">
            <CardContent className="p-4 text-center">
              <Trophy className="h-8 w-8 text-orange-600 dark:text-orange-400 mx-auto mb-2" />
              <div className="text-lg font-bold text-gray-800 dark:text-gray-200">{referralData.currentTier}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Current Tier</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Share Your Code */}
      <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-pink-600" />
            Invite Friends & Family
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Referral Code */}
          <div>
            <Label htmlFor="referral-code">Your Referral Code</Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="referral-code"
                value={referralCode}
                readOnly
                className="font-mono text-lg font-bold text-center"
              />
              <Button
                variant="outline"
                onClick={() => copyToClipboard(referralCode, "code")}
                className="flex items-center gap-2"
              >
                {copiedCode ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copiedCode ? "Copied!" : "Copy"}
              </Button>
            </div>
          </div>

          {/* Referral Link */}
          <div>
            <Label htmlFor="referral-link">Your Referral Link</Label>
            <div className="flex gap-2 mt-1">
              <Input id="referral-link" value={referralLink} readOnly className="text-sm" />
              <Button
                variant="outline"
                onClick={() => copyToClipboard(referralLink, "link")}
                className="flex items-center gap-2"
              >
                {copiedLink ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copiedLink ? "Copied!" : "Copy"}
              </Button>
            </div>
          </div>

          {/* Custom Message */}
          <div>
            <Label htmlFor="custom-message">Personalize Your Message</Label>
            <Textarea
              id="custom-message"
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              className="mt-1 min-h-24"
              placeholder="Add a personal touch to your referral message..."
            />
          </div>

          {/* Share Buttons */}
          <div>
            <Label className="text-base font-medium">Share Via</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
              <Button variant="outline" onClick={shareViaEmail} className="flex items-center gap-2 h-12 bg-transparent">
                <Mail className="h-4 w-4" />
                Email
              </Button>
              <Button variant="outline" onClick={shareViaSMS} className="flex items-center gap-2 h-12 bg-transparent">
                <MessageCircle className="h-4 w-4" />
                SMS
              </Button>
              <Button
                variant="outline"
                onClick={shareViaWhatsApp}
                className="flex items-center gap-2 h-12 bg-transparent"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </Button>
              <Button
                variant="outline"
                onClick={shareViaNative}
                className="flex items-center gap-2 h-12 bg-transparent"
              >
                <Share2 className="h-4 w-4" />
                Share
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress to Next Tier */}
      {referralData && referralData.nextTier !== "Max Tier Reached" && (
        <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-200 dark:border-purple-700">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="h-5 w-5 text-purple-600" />
              <h3 className="font-semibold text-gray-800 dark:text-gray-200">Progress to {referralData.nextTier}</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">{referralData.pointsToNextTier} points needed</span>
                <span className="text-gray-600 dark:text-gray-400">
                  {Math.ceil(referralData.pointsToNextTier / 30)} more referrals
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.max(10, (referralData.rewardsEarned / (referralData.rewardsEarned + referralData.pointsToNextTier)) * 100)}%`,
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Referral History */}
      {referralData && referralData.referralHistory.length > 0 && (
        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              Referral History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {referralData.referralHistory.map((referral, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-800 dark:text-gray-200">{referral.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Joined {referral.joinDate}</p>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant={referral.status === "active" ? "default" : "outline"}
                      className={referral.status === "active" ? "bg-green-600" : ""}
                    >
                      {referral.status}
                    </Badge>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">+{referral.reward} points</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* How It Works */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-200 dark:border-purple-700">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Share2 className="h-5 w-5 text-purple-600" />
            <h3 className="font-semibold text-gray-800 dark:text-gray-200">How Sharing Works</h3>
          </div>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-full w-fit mx-auto mb-2">
                <Share2 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-1">1. Share</h4>
              <p className="text-gray-600 dark:text-gray-400">Share your unique code or link with friends and family</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full w-fit mx-auto mb-2">
                <Heart className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-1">2. They Join</h4>
              <p className="text-gray-600 dark:text-gray-400">
                When they sign up using your link, they join the DreamWise community
              </p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full w-fit mx-auto mb-2">
                <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-1">3. Earn Rewards</h4>
              <p className="text-gray-600 dark:text-gray-400">
                Both you and your friend receive points and unlock special features
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
