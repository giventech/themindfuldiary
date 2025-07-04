"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { BarChart3, TrendingUp, Moon, Brain, Heart, Sparkles, Target, Award, Zap } from "lucide-react"

export default function Dashboard() {
  const stats = {
    totalEntries: 12,
    dreamEntries: 5,
    situationAnalyses: 4,
    gratitudeEntries: 8,
    soothingSessions: 6,
    currentStreak: 3,
    longestStreak: 7,
  }

  const insights = [
    {
      type: "pattern",
      title: "Dream Pattern Detected",
      description: "You often dream about water when feeling anxious. This might represent emotional cleansing.",
      icon: Moon,
      color: "purple",
    },
    {
      type: "emotion",
      title: "Emotional Growth",
      description: "Your emotional intensity has decreased by 23% over the past week through self-soothing.",
      icon: Heart,
      color: "pink",
    },
    {
      type: "gratitude",
      title: "Gratitude Impact",
      description: "Your gratitude practice is linked to 40% more positive situation analyses.",
      icon: Sparkles,
      color: "yellow",
    },
  ]

  const weeklyProgress = [
    { day: "Mon", dreams: 1, situations: 0, gratitude: 1, soothing: 1 },
    { day: "Tue", dreams: 0, situations: 1, gratitude: 1, soothing: 0 },
    { day: "Wed", dreams: 1, situations: 1, gratitude: 1, soothing: 2 },
    { day: "Thu", dreams: 0, situations: 0, gratitude: 1, soothing: 1 },
    { day: "Fri", dreams: 1, situations: 1, gratitude: 1, soothing: 0 },
    { day: "Sat", dreams: 1, situations: 1, gratitude: 1, soothing: 1 },
    { day: "Sun", dreams: 1, situations: 0, gratitude: 2, soothing: 1 },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-indigo-600" />
            Personal Insights
          </h2>
          <p className="text-gray-600 dark:text-gray-400">Your journey of self-discovery at a glance</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-700">
          <CardContent className="p-4 text-center">
            <Moon className="h-8 w-8 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">{stats.dreamEntries}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Dreams Logged</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700">
          <CardContent className="p-4 text-center">
            <Brain className="h-8 w-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">{stats.situationAnalyses}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Situations Analyzed</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20 border-pink-200 dark:border-pink-700">
          <CardContent className="p-4 text-center">
            <Heart className="h-8 w-8 text-pink-600 dark:text-pink-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">{stats.soothingSessions}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Soothing Sessions</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border-yellow-200 dark:border-yellow-700">
          <CardContent className="p-4 text-center">
            <Sparkles className="h-8 w-8 text-yellow-600 dark:text-yellow-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">{stats.gratitudeEntries}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Gratitude Entries</div>
          </CardContent>
        </Card>
      </div>

      {/* Streak & Progress */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-orange-600" />
              Your Streaks
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Current Streak</span>
              <Badge variant="outline" className="text-orange-600 border-orange-600">
                {stats.currentStreak} days
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Longest Streak</span>
              <Badge variant="outline" className="text-green-600 border-green-600">
                {stats.longestStreak} days
              </Badge>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Weekly Goal Progress</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">5/7 days</span>
              </div>
              <Progress value={71} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              This Week's Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {weeklyProgress.map((day, index) => {
                const total = day.dreams + day.situations + day.gratitude + day.soothing
                return (
                  <div key={day.day} className="flex items-center gap-3">
                    <span className="text-sm font-medium w-8 text-gray-600 dark:text-gray-400">{day.day}</span>
                    <div className="flex-1 flex gap-1">
                      {Array.from({ length: Math.max(total, 1) }).map((_, i) => (
                        <div
                          key={i}
                          className={`h-2 flex-1 rounded-full ${
                            i < total
                              ? "bg-gradient-to-r from-indigo-500 to-purple-500"
                              : "bg-gray-200 dark:bg-gray-700"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400 w-4">{total}</span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200 flex items-center gap-2">
          <Zap className="h-5 w-5 text-indigo-600" />
          AI-Generated Insights
        </h3>
        <div className="space-y-4">
          {insights.map((insight, index) => {
            const Icon = insight.icon
            return (
              <Card key={index} className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`bg-${insight.color}-100 dark:bg-${insight.color}-900 p-2 rounded-full`}>
                      <Icon className={`h-5 w-5 text-${insight.color}-600 dark:text-${insight.color}-400`} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">{insight.title}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{insight.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Goals Progress */}
      <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-green-600" />
            Personal Goals Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Better understand my dreams</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">60%</span>
            </div>
            <Progress value={60} className="h-2" />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Improve emotional awareness</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">75%</span>
            </div>
            <Progress value={75} className="h-2" />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Build gratitude practice</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">85%</span>
            </div>
            <Progress value={85} className="h-2" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
