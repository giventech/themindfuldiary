"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Sparkles, Moon, Brain, Heart, Target, Shield } from "lucide-react"

interface WelcomeScreenProps {
  onGetStarted: () => void
}

export default function WelcomeScreen({ onGetStarted }: WelcomeScreenProps) {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center mb-6">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 rounded-full">
            <Moon className="h-12 w-12 text-white" />
          </div>
        </div>
        <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
          DreamWise
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-2">Your Personal Growth Companion</p>
        <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
          Transform your inner world into actionable wisdom through dream logging, situation analysis, and guided
          self-reflection.
        </p>
      </div>

      {/* Feature Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-purple-200 dark:border-purple-700 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6 text-center">
            <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-full w-fit mx-auto mb-4">
              <Sparkles className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="font-semibold mb-2 text-gray-800 dark:text-gray-200">Dream Insights</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Capture and analyze your dreams to uncover subconscious patterns
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-blue-200 dark:border-blue-700 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6 text-center">
            <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full w-fit mx-auto mb-4">
              <Brain className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="font-semibold mb-2 text-gray-800 dark:text-gray-200">Smart Analysis</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              AI-powered situation analysis with personalized insights
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-green-200 dark:border-green-700 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6 text-center">
            <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full w-fit mx-auto mb-4">
              <Heart className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="font-semibold mb-2 text-gray-800 dark:text-gray-200">Self-Soothing</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Evidence-based techniques for emotional regulation
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-orange-200 dark:border-orange-700 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6 text-center">
            <div className="bg-orange-100 dark:bg-orange-900 p-3 rounded-full w-fit mx-auto mb-4">
              <Target className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
            <h3 className="font-semibold mb-2 text-gray-800 dark:text-gray-200">Manifestation Gratitude</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Express gratitude for future actions to manifest positive change
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-indigo-200 dark:border-indigo-700 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6 text-center">
            <div className="bg-indigo-100 dark:bg-indigo-900 p-3 rounded-full w-fit mx-auto mb-4">
              <Shield className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="font-semibold mb-2 text-gray-800 dark:text-gray-200">Privacy First</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Your data stays private with end-to-end encryption
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-pink-200 dark:border-pink-700 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6 text-center">
            <div className="bg-pink-100 dark:bg-pink-900 p-3 rounded-full w-fit mx-auto mb-4">
              <Sparkles className="h-6 w-6 text-pink-600 dark:text-pink-400" />
            </div>
            <h3 className="font-semibold mb-2 text-gray-800 dark:text-gray-200">Personal Growth</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Track your journey with meaningful progress insights
            </p>
          </CardContent>
        </Card>
      </div>

      {/* CTA Section */}
      <div className="text-center">
        <Button
          onClick={onGetStarted}
          size="lg"
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
        >
          Begin Your Journey
        </Button>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
          Free to start • No credit card required • Your privacy protected
        </p>
      </div>
    </div>
  )
}
