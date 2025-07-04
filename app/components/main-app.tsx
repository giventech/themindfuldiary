"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Home, Moon, Brain, Heart, Sparkles, BarChart3, Settings, Share2, Loader2 } from "lucide-react"
import DreamLogger from "./dream-logger"
import SituationAnalysis from "./situation-analysis"
import SelfSoothing from "./self-soothing"
import GratitudeJournal from "./gratitude-journal"
import Dashboard from "./dashboard"
import ReferralSystem from "./referral-system"
import { ensureUserProfile } from "@/lib/auth"

interface MainAppProps {
  user: any
}

export default function MainApp({ user }: MainAppProps) {
  const [activeTab, setActiveTab] = useState("home")
  const [currentTime, setCurrentTime] = useState(new Date())
  const [userProfile, setUserProfile] = useState(null)
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000) // Update every minute

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    // Ensure user profile exists
    const initializeProfile = async () => {
      if (user?.id) {
        setIsLoadingProfile(true)
        try {
          const profile = await ensureUserProfile(user)
          setUserProfile(profile)
        } catch (error) {
          console.error("Failed to initialize profile:", error)
        } finally {
          setIsLoadingProfile(false)
        }
      }
    }

    initializeProfile()
  }, [user])

  const tabs = [
    { id: "home", label: "Home", icon: Home },
    { id: "dreams", label: "Dreams", icon: Moon },
    { id: "analysis", label: "Analysis", icon: Brain },
    { id: "soothing", label: "Soothing", icon: Heart },
    { id: "gratitude", label: "Gratitude", icon: Sparkles },
    { id: "dashboard", label: "Insights", icon: BarChart3 },
    { id: "referrals", label: "Share", icon: Share2 },
  ]

  const handleQuickAction = (actionId: string) => {
    switch (actionId) {
      case "dream":
        setActiveTab("dreams")
        break
      case "situation":
        setActiveTab("analysis")
        break
      case "gratitude":
        setActiveTab("gratitude")
        break
      case "soothe":
        setActiveTab("soothing")
        break
      case "dashboard":
        setActiveTab("dashboard")
        break
      case "referrals":
        setActiveTab("referrals")
        break
    }
  }

  const renderContent = () => {
    if (isLoadingProfile) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Setting up your profile...</p>
          </div>
        </div>
      )
    }

    const userWithProfile = { ...user, ...userProfile }

    switch (activeTab) {
      case "dreams":
        return <DreamLogger />
      case "analysis":
        return <SituationAnalysis />
      case "soothing":
        return <SelfSoothing />
      case "gratitude":
        return <GratitudeJournal />
      case "dashboard":
        return <Dashboard />
      case "referrals":
        return <ReferralSystem user={userWithProfile} />
      default:
        return <HomeScreen user={userWithProfile} onQuickAction={handleQuickAction} currentTime={currentTime} />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-purple-200 dark:border-purple-700 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-2 rounded-lg">
                <Moon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800 dark:text-gray-200">DreamWise</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Welcome back, {userProfile?.name || user?.name || "User"}
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 pb-24">{renderContent()}</main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-t border-purple-200 dark:border-purple-700">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-around py-2">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <Button
                  key={tab.id}
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex flex-col items-center gap-1 h-auto py-2 px-2 ${
                    isActive
                      ? "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30"
                      : "text-gray-600 dark:text-gray-400"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-xs">{tab.label}</span>
                </Button>
              )
            })}
          </div>
        </div>
      </nav>
    </div>
  )
}

function HomeScreen({
  user,
  onQuickAction,
  currentTime,
}: { user: any; onQuickAction: (actionId: string) => void; currentTime: Date }) {
  // Simulate user patterns (in a real app, this would come from user data)
  const userPatterns = {
    preferredDreamTime: 7, // 7 AM
    stressfulDays: ["Monday", "Wednesday"], // Days user typically needs more self-soothing
    gratitudePracticeTime: 21, // 9 PM
    lastDreamEntry: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    recentStressLevel: 7, // Scale of 1-10
    consecutiveGratitudeDays: 3,
  }

  const getTimeOfDay = () => {
    const hour = currentTime.getHours()
    if (hour >= 5 && hour < 12) return "morning"
    if (hour >= 12 && hour < 17) return "afternoon"
    if (hour >= 17 && hour < 21) return "evening"
    return "night"
  }

  const getDayOfWeek = () => {
    return currentTime.toLocaleDateString("en-US", { weekday: "long" })
  }

  const getContextualGreeting = () => {
    const timeOfDay = getTimeOfDay()
    const greetings = {
      morning: `Good morning, ${user?.name || "User"}! ☀️`,
      afternoon: `Good afternoon, ${user?.name || "User"}! 🌤️`,
      evening: `Good evening, ${user?.name || "User"}! 🌅`,
      night: `Good night, ${user?.name || "User"}! 🌙`,
    }
    return greetings[timeOfDay]
  }

  const getContextualMessage = () => {
    const timeOfDay = getTimeOfDay()
    const dayOfWeek = getDayOfWeek()
    const isStressfulDay = userPatterns.stressfulDays.includes(dayOfWeek)

    if (timeOfDay === "morning") {
      const daysSinceLastDream = Math.floor(
        (currentTime.getTime() - userPatterns.lastDreamEntry.getTime()) / (1000 * 60 * 60 * 24),
      )
      if (daysSinceLastDream >= 2) {
        return "Did you have any dreams last night? It's been a while since your last dream entry."
      }
      return "Start your day with intention and mindfulness."
    }

    if (timeOfDay === "afternoon" && isStressfulDay) {
      return "Midweek can be challenging. Take a moment for self-care."
    }

    if (timeOfDay === "evening") {
      return "Perfect time to reflect on your day and practice gratitude."
    }

    if (timeOfDay === "night") {
      return "Wind down and prepare for restful sleep and meaningful dreams."
    }

    return "Your journey of self-discovery continues."
  }

  const getContextualQuickActions = () => {
    const timeOfDay = getTimeOfDay()
    const hour = currentTime.getHours()
    const dayOfWeek = getDayOfWeek()
    const isStressfulDay = userPatterns.stressfulDays.includes(dayOfWeek)
    const daysSinceLastDream = Math.floor(
      (currentTime.getTime() - userPatterns.lastDreamEntry.getTime()) / (1000 * 60 * 60 * 1000),
    )

    // Always include referrals as a contextual action
    const baseActions = [
      {
        id: "referrals",
        label: "Share DreamWise",
        icon: Share2,
        color: "indigo",
        priority: "medium",
        reason: "Help others discover mindful growth",
      },
    ]

    // Morning (5 AM - 12 PM)
    if (timeOfDay === "morning") {
      if (hour >= 6 && hour <= 9 && daysSinceLastDream >= 1) {
        return [
          {
            id: "dream",
            label: "Log Last Night's Dream",
            icon: Moon,
            color: "purple",
            priority: "high",
            reason: "Dream recall is best in the morning",
          },
          {
            id: "gratitude",
            label: "Morning Gratitude",
            icon: Sparkles,
            color: "yellow",
            priority: "medium",
            reason: "Start your day with positivity",
          },
          ...baseActions,
          {
            id: "dashboard",
            label: "Review Insights",
            icon: BarChart3,
            color: "blue",
            priority: "low",
            reason: "Check your progress",
          },
        ]
      }
      return [
        {
          id: "gratitude",
          label: "Morning Gratitude",
          icon: Sparkles,
          color: "yellow",
          priority: "high",
          reason: "Start your day with positivity",
        },
        ...baseActions,
        {
          id: "dashboard",
          label: "Review Insights",
          icon: BarChart3,
          color: "blue",
          priority: "medium",
          reason: "Check your progress",
        },
        {
          id: "soothe",
          label: "Morning Meditation",
          icon: Heart,
          color: "pink",
          priority: "low",
          reason: "Center yourself for the day",
        },
      ]
    }

    // Default actions for other times
    return [
      {
        id: "situation",
        label: "Reflect & Analyze",
        icon: Brain,
        color: "blue",
        priority: "high",
        reason: "Process your experiences",
      },
      {
        id: "gratitude",
        label: "Manifest Gratitude",
        icon: Sparkles,
        color: "green",
        priority: "medium",
        reason: "Focus on positive manifestation",
      },
      ...baseActions,
      {
        id: "soothe",
        label: "Self-Soothe",
        icon: Heart,
        color: "pink",
        priority: "low",
        reason: "Take care of your emotional needs",
      },
    ]
  }

  const contextualActions = getContextualQuickActions()
  const priorityOrder = { high: 3, medium: 2, low: 1 }
  const sortedActions = contextualActions.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority])

  const getPriorityBadge = (priority: string) => {
    const badges = {
      high: { text: "Recommended", color: "bg-green-100 text-green-800 border-green-200" },
      medium: { text: "Suggested", color: "bg-blue-100 text-blue-800 border-blue-200" },
      low: { text: "Optional", color: "bg-gray-100 text-gray-600 border-gray-200" },
    }
    return badges[priority] || badges.medium
  }

  return (
    <div className="space-y-6">
      {/* Welcome Card */}
      <Card className="bg-gradient-to-r from-purple-500 to-blue-600 text-white border-0">
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold mb-2">{getContextualGreeting()}</h2>
          <p className="text-purple-100 mb-4">{getContextualMessage()}</p>
          <div className="flex gap-2 flex-wrap">
            <Badge variant="secondary" className="bg-white/20 text-white border-0">
              {user?.goals?.length || 0} goals set
            </Badge>
            <Badge variant="secondary" className="bg-white/20 text-white border-0">
              Day {userPatterns.consecutiveGratitudeDays} streak
            </Badge>
            <Badge variant="secondary" className="bg-white/20 text-white border-0">
              {getTimeOfDay()} • {currentTime.toLocaleDateString()}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Contextual Quick Actions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Recommended for You</h3>
          <Badge variant="outline" className="text-xs">
            Based on time & patterns
          </Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sortedActions.map((action) => {
            const Icon = action.icon
            const priorityBadge = getPriorityBadge(action.priority)
            return (
              <Card
                key={action.id}
                className={`bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm hover:shadow-lg transition-all duration-300 cursor-pointer ${
                  action.priority === "high" ? "ring-2 ring-green-200 dark:ring-green-800" : ""
                }`}
                onClick={() => onQuickAction(action.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`bg-${action.color}-100 dark:bg-${action.color}-900 p-2 rounded-full`}>
                        <Icon className={`h-5 w-5 text-${action.color}-600 dark:text-${action.color}-400`} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 dark:text-gray-200">{action.label}</p>
                      </div>
                    </div>
                    <Badge className={`text-xs ${priorityBadge.color}`}>{priorityBadge.text}</Badge>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{action.reason}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Recent Activity</h3>
        <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
          <CardContent className="p-6 text-center">
            <div className="text-gray-500 dark:text-gray-400 mb-4">
              <Sparkles className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Your journey continues</p>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {getTimeOfDay() === "morning"
                ? "Start your day with one of the recommended actions above."
                : getTimeOfDay() === "evening"
                  ? "Perfect time to reflect on your day and set intentions for tomorrow."
                  : "Take a moment for self-care and mindful reflection."}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
