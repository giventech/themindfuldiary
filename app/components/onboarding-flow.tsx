"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, ArrowRight, User, Settings, Target, Gift, Check, X, Loader2, AlertCircle } from "lucide-react"
import { validateReferralCode } from "@/lib/referrals"
import { signUp } from "@/lib/auth"

interface OnboardingFlowProps {
  onComplete: (userData: any) => void
}

export default function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    password: "",
    referralCode: "",
    dreamFrequency: "sometimes",
    journalExperience: "beginner",
    goals: [] as string[],
    notificationTime: [21], // 9 PM
    privacyLevel: "high",
  })

  const [referralValidation, setReferralValidation] = useState({
    isValidating: false,
    isValid: null as boolean | null,
    referrerName: "",
    message: "",
  })

  const totalSteps = 4

  const handleNext = async () => {
    if (step < totalSteps) {
      setStep(step + 1)
      setError("")
    } else {
      // Final step - create account
      setIsSubmitting(true)
      setError("")

      try {
        console.log("Starting signup process...")
        const result = await signUp(userData.email, userData.password, userData)

        if (result.user) {
          console.log("Signup successful, completing onboarding...")
          // Add user metadata to the user object for the main app
          const userWithProfile = {
            ...result.user,
            name: userData.name,
            goals: userData.goals,
          }
          onComplete(userWithProfile)
        } else {
          throw new Error("Account creation failed - no user returned")
        }
      } catch (error: any) {
        console.error("Signup error:", error)
        let errorMessage = "Failed to create account. Please try again."

        // Provide more specific error messages
        if (error.message?.includes("User already registered")) {
          errorMessage = "An account with this email already exists. Please try signing in instead."
        } else if (error.message?.includes("Invalid email")) {
          errorMessage = "Please enter a valid email address."
        } else if (error.message?.includes("Password")) {
          errorMessage = "Password must be at least 6 characters long."
        } else if (error.message?.includes("referral")) {
          errorMessage = error.message
        }

        setError(errorMessage)
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
      setError("")
    }
  }

  const updateUserData = (field: string, value: any) => {
    setUserData((prev) => ({ ...prev, [field]: value }))
  }

  const validateReferralCodeInput = async (code: string) => {
    if (!code.trim()) {
      setReferralValidation({
        isValidating: false,
        isValid: null,
        referrerName: "",
        message: "",
      })
      return
    }

    setReferralValidation((prev) => ({ ...prev, isValidating: true }))

    try {
      const result = await validateReferralCode(code)

      setReferralValidation({
        isValidating: false,
        isValid: result.isValid,
        referrerName: result.referrerName || "",
        message: result.message,
      })
    } catch (error) {
      console.error("Referral validation error:", error)
      setReferralValidation({
        isValidating: false,
        isValid: false,
        referrerName: "",
        message: "Unable to validate referral code. Please try again later.",
      })
    }
  }

  const handleReferralCodeChange = (value: string) => {
    updateUserData("referralCode", value)

    // Debounce validation
    const timeoutId = setTimeout(() => {
      validateReferralCodeInput(value)
    }, 500)

    return () => clearTimeout(timeoutId)
  }

  const toggleGoal = (goal: string) => {
    const currentGoals = userData.goals
    if (currentGoals.includes(goal)) {
      updateUserData(
        "goals",
        currentGoals.filter((g) => g !== goal),
      )
    } else {
      updateUserData("goals", [...currentGoals, goal])
    }
  }

  const getValidationIcon = () => {
    if (referralValidation.isValidating) {
      return <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
    }
    if (referralValidation.isValid === true) {
      return <Check className="h-4 w-4 text-green-600" />
    }
    if (referralValidation.isValid === false) {
      return <X className="h-4 w-4 text-red-600" />
    }
    return null
  }

  const getValidationBorder = () => {
    if (referralValidation.isValid === true) {
      return "border-green-500 focus:border-green-500 focus:ring-green-500"
    }
    if (referralValidation.isValid === false) {
      return "border-red-500 focus:border-red-500 focus:ring-red-500"
    }
    return ""
  }

  const isStepValid = () => {
    switch (step) {
      case 1:
        return (
          userData.name.trim() &&
          userData.email.trim() &&
          userData.password.length >= 6 &&
          !referralValidation.isValidating
        )
      case 2:
        return true
      case 3:
        return userData.goals.length > 0
      case 4:
        return true
      default:
        return false
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Step {step} of {totalSteps}
          </span>
          <span className="text-sm text-gray-600 dark:text-gray-400">{Math.round((step / totalSteps) * 100)}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-center gap-2 text-red-800 dark:text-red-200">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">{error}</span>
          </div>
        </div>
      )}

      <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-purple-200 dark:border-purple-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {step === 1 && <User className="h-5 w-5 text-purple-600" />}
            {step === 2 && <Settings className="h-5 w-5 text-blue-600" />}
            {step === 3 && <Target className="h-5 w-5 text-green-600" />}
            {step === 4 && <Settings className="h-5 w-5 text-orange-600" />}
            {step === 1 && "Welcome to DreamWise"}
            {step === 2 && "Tell us about yourself"}
            {step === 3 && "What are your goals?"}
            {step === 4 && "Customize your experience"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1: Basic Info + Referral Code */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Your Name *</Label>
                <Input
                  id="name"
                  value={userData.name}
                  onChange={(e) => updateUserData("name", e.target.value)}
                  placeholder="Enter your name"
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={userData.email}
                  onChange={(e) => updateUserData("email", e.target.value)}
                  placeholder="Enter your email"
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="password">Create Password *</Label>
                <Input
                  id="password"
                  type="password"
                  value={userData.password}
                  onChange={(e) => updateUserData("password", e.target.value)}
                  placeholder="Create a secure password (min 6 characters)"
                  className="mt-1"
                  required
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Password must be at least 6 characters long
                </p>
              </div>

              {/* Referral Code Section */}
              <div className="border-t pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <Gift className="h-4 w-4 text-purple-600" />
                  <Label htmlFor="referralCode" className="text-base font-medium">
                    Referral Code (Optional)
                  </Label>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Have a referral code from a friend? Enter it here to unlock special benefits!
                </p>
                <div className="relative">
                  <Input
                    id="referralCode"
                    value={userData.referralCode}
                    onChange={(e) => handleReferralCodeChange(e.target.value.toUpperCase())}
                    placeholder="Enter referral code (e.g., DREAMJOH8X2K4)"
                    className={`mt-1 pr-10 ${getValidationBorder()}`}
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">{getValidationIcon()}</div>
                </div>

                {/* Validation Message */}
                {referralValidation.message && (
                  <div
                    className={`mt-2 p-3 rounded-lg text-sm ${
                      referralValidation.isValid === true
                        ? "bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800"
                        : referralValidation.isValid === false
                          ? "bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800"
                          : "bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-800"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {referralValidation.isValid === true && <Check className="h-4 w-4 mt-0.5 flex-shrink-0" />}
                      {referralValidation.isValid === false && <X className="h-4 w-4 mt-0.5 flex-shrink-0" />}
                      <span>{referralValidation.message}</span>
                    </div>
                  </div>
                )}

                {/* Benefits Preview */}
                {referralValidation.isValid === true && (
                  <div className="mt-3 p-3 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
                    <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">🎉 Referral Benefits</h4>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <li>• Welcome bonus: 10 points</li>
                      <li>• Premium insights for your first month</li>
                      <li>• Exclusive dream analysis features</li>
                      <li>• Priority customer support</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Experience Level */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <Label className="text-base font-medium">How often do you remember your dreams?</Label>
                <RadioGroup
                  value={userData.dreamFrequency}
                  onValueChange={(value) => updateUserData("dreamFrequency", value)}
                  className="mt-3"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="rarely" id="rarely" />
                    <Label htmlFor="rarely">Rarely or never</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="sometimes" id="sometimes" />
                    <Label htmlFor="sometimes">Sometimes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="often" id="often" />
                    <Label htmlFor="often">Often</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="always" id="always" />
                    <Label htmlFor="always">Almost every night</Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label className="text-base font-medium">Your journaling experience</Label>
                <RadioGroup
                  value={userData.journalExperience}
                  onValueChange={(value) => updateUserData("journalExperience", value)}
                  className="mt-3"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="beginner" id="beginner" />
                    <Label htmlFor="beginner">New to journaling</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="intermediate" id="intermediate" />
                    <Label htmlFor="intermediate">Some experience</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="advanced" id="advanced" />
                    <Label htmlFor="advanced">Regular journaler</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          )}

          {/* Step 3: Goals */}
          {step === 3 && (
            <div className="space-y-4">
              <Label className="text-base font-medium">What would you like to achieve? (Select all that apply)</Label>
              <div className="grid grid-cols-1 gap-3">
                {[
                  "Better understand my dreams",
                  "Improve emotional awareness",
                  "Reduce stress and anxiety",
                  "Develop better sleep habits",
                  "Increase self-reflection",
                  "Build gratitude practice",
                  "Set and achieve personal goals",
                  "Track mood patterns",
                ].map((goal) => (
                  <div key={goal} className="flex items-center space-x-2">
                    <Checkbox
                      id={goal}
                      checked={userData.goals.includes(goal)}
                      onCheckedChange={() => toggleGoal(goal)}
                    />
                    <Label htmlFor={goal} className="text-sm">
                      {goal}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Preferences */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <Label className="text-base font-medium">Preferred reminder time</Label>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  When would you like to be reminded to journal? Currently: {userData.notificationTime[0]}:00
                </p>
                <Slider
                  value={userData.notificationTime}
                  onValueChange={(value) => updateUserData("notificationTime", value)}
                  max={23}
                  min={6}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>6 AM</span>
                  <span>11 PM</span>
                </div>
              </div>

              <div>
                <Label className="text-base font-medium">Privacy Level</Label>
                <RadioGroup
                  value={userData.privacyLevel}
                  onValueChange={(value) => updateUserData("privacyLevel", value)}
                  className="mt-3"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="high" id="high" />
                    <Label htmlFor="high">High - Local storage only</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="medium" id="medium" />
                    <Label htmlFor="medium">Medium - Encrypted cloud sync</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="low" id="low" />
                    <Label htmlFor="low">Low - Anonymous insights sharing</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Referral Summary */}
              {userData.referralCode && referralValidation.isValid && (
                <div className="border-t pt-4">
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 p-4 rounded-lg border border-green-200 dark:border-green-700">
                    <div className="flex items-center gap-2 mb-2">
                      <Gift className="h-4 w-4 text-green-600" />
                      <span className="font-medium text-gray-800 dark:text-gray-200">Referral Applied!</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      You're joining through {referralValidation.referrerName}'s referral. You'll both receive special
                      benefits once you complete your first week!
                    </p>
                    <Badge variant="outline" className="mt-2 text-green-600 border-green-600">
                      Code: {userData.referralCode}
                    </Badge>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={step === 1 || isSubmitting}
              className="flex items-center gap-2 bg-transparent"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <Button
              onClick={handleNext}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              disabled={!isStepValid() || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  {step === totalSteps ? "Complete Setup" : "Next"}
                  {step < totalSteps && <ArrowRight className="h-4 w-4" />}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
