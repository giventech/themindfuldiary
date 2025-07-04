"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Moon, Sun } from "lucide-react"
import WelcomeScreen from "./components/welcome-screen"
import OnboardingFlow from "./components/onboarding-flow"
import MainApp from "./components/main-app"

export default function DreamWiseApp() {
  const [currentScreen, setCurrentScreen] = useState<"welcome" | "onboarding" | "app">("welcome")
  const [darkMode, setDarkMode] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [darkMode])

  const handleGetStarted = () => {
    setCurrentScreen("onboarding")
  }

  const handleOnboardingComplete = (userData: any) => {
    setUser(userData)
    setCurrentScreen("app")
  }

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900 transition-all duration-500">
      {/* Dark Mode Toggle */}
      <div className="fixed top-4 right-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={toggleDarkMode}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-purple-200 dark:border-purple-700"
        >
          {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
      </div>

      {/* Screen Router */}
      {currentScreen === "welcome" && <WelcomeScreen onGetStarted={handleGetStarted} />}

      {currentScreen === "onboarding" && <OnboardingFlow onComplete={handleOnboardingComplete} />}

      {currentScreen === "app" && <MainApp user={user} />}
    </div>
  )
}
