"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Heart, Play, Pause, RotateCcw, Wind, Waves, Mountain, Flower, Timer, CheckCircle } from "lucide-react"

export default function SelfSoothing() {
  const [activeSession, setActiveSession] = useState<string | null>(null)
  const [sessionTime, setSessionTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [completedSessions, setCompletedSessions] = useState<string[]>([])

  const techniques = [
    {
      id: "breathing",
      title: "4-7-8 Breathing",
      description: "Calm your nervous system with this powerful breathing technique",
      duration: 240, // 4 minutes
      icon: Wind,
      color: "blue",
      instructions: [
        "Inhale through your nose for 4 counts",
        "Hold your breath for 7 counts",
        "Exhale through your mouth for 8 counts",
        "Repeat this cycle 4 times",
      ],
    },
    {
      id: "progressive",
      title: "Progressive Muscle Relaxation",
      description: "Release tension by systematically relaxing muscle groups",
      duration: 600, // 10 minutes
      icon: Mountain,
      color: "green",
      instructions: [
        "Start with your toes and work upward",
        "Tense each muscle group for 5 seconds",
        "Release and notice the relaxation",
        "Move through your entire body",
      ],
    },
    {
      id: "visualization",
      title: "Peaceful Place Visualization",
      description: "Transport your mind to a calm, safe space",
      duration: 480, // 8 minutes
      icon: Waves,
      color: "purple",
      instructions: [
        "Close your eyes and breathe deeply",
        "Imagine your perfect peaceful place",
        "Engage all your senses in this space",
        "Stay present in this visualization",
      ],
    },
    {
      id: "grounding",
      title: "5-4-3-2-1 Grounding",
      description: "Ground yourself in the present moment using your senses",
      duration: 300, // 5 minutes
      icon: Flower,
      color: "orange",
      instructions: [
        "5 things you can see",
        "4 things you can touch",
        "3 things you can hear",
        "2 things you can smell",
        "1 thing you can taste",
      ],
    },
  ]

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isPlaying && activeSession) {
      interval = setInterval(() => {
        setSessionTime((prev) => {
          const technique = techniques.find((t) => t.id === activeSession)
          if (technique && prev >= technique.duration) {
            setIsPlaying(false)
            setCompletedSessions((prev) => [...prev, activeSession])
            setActiveSession(null)
            return 0
          }
          return prev + 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isPlaying, activeSession])

  const startSession = (techniqueId: string) => {
    setActiveSession(techniqueId)
    setSessionTime(0)
    setIsPlaying(true)
  }

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const resetSession = () => {
    setIsPlaying(false)
    setSessionTime(0)
    setActiveSession(null)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const activeTechnique = techniques.find((t) => t.id === activeSession)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
            <Heart className="h-6 w-6 text-pink-600" />
            Self-Soothing Toolkit
          </h2>
          <p className="text-gray-600 dark:text-gray-400">Evidence-based techniques for emotional regulation</p>
        </div>
      </div>

      {/* Active Session */}
      {activeSession && activeTechnique && (
        <Card className="bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 border-pink-200 dark:border-pink-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className={`bg-${activeTechnique.color}-100 dark:bg-${activeTechnique.color}-900 p-2 rounded-full`}
                >
                  <activeTechnique.icon
                    className={`h-5 w-5 text-${activeTechnique.color}-600 dark:text-${activeTechnique.color}-400`}
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200">{activeTechnique.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {formatTime(sessionTime)} / {formatTime(activeTechnique.duration)}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={togglePlayPause}>
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                <Button variant="outline" size="sm" onClick={resetSession}>
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Progress value={(sessionTime / activeTechnique.duration) * 100} className="mb-4" />

            <div className="space-y-2">
              <h4 className="font-medium text-gray-800 dark:text-gray-200">Instructions:</h4>
              <ul className="space-y-1">
                {activeTechnique.instructions.map((instruction, index) => (
                  <li key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                    <span className="text-pink-600 dark:text-pink-400">•</span>
                    {instruction}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Technique Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {techniques.map((technique) => {
          const Icon = technique.icon
          const isCompleted = completedSessions.includes(technique.id)
          const isActive = activeSession === technique.id

          return (
            <Card
              key={technique.id}
              className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300 ${
                isActive ? "ring-2 ring-pink-500" : ""
              }`}
            >
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`bg-${technique.color}-100 dark:bg-${technique.color}-900 p-2 rounded-full`}>
                      <Icon className={`h-5 w-5 text-${technique.color}-600 dark:text-${technique.color}-400`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 dark:text-gray-200">{technique.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          <Timer className="h-3 w-3 mr-1" />
                          {formatTime(technique.duration)}
                        </Badge>
                        {isCompleted && (
                          <Badge variant="outline" className="text-xs text-green-600 border-green-600">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Completed
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{technique.description}</p>
                <Button
                  onClick={() => startSession(technique.id)}
                  disabled={isActive}
                  className={`w-full bg-gradient-to-r from-${technique.color}-500 to-${technique.color}-600 hover:from-${technique.color}-600 hover:to-${technique.color}-700`}
                >
                  {isActive ? "In Progress..." : "Start Session"}
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Progress Summary */}
      <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Your Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-600 dark:text-gray-400">Sessions Completed Today</span>
            <Badge variant="outline">
              {completedSessions.length} / {techniques.length}
            </Badge>
          </div>
          <Progress value={(completedSessions.length / techniques.length) * 100} />
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            {completedSessions.length === 0
              ? "Start your first self-soothing session to begin tracking your progress."
              : `Great work! You've completed ${completedSessions.length} session${completedSessions.length > 1 ? "s" : ""} today.`}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
