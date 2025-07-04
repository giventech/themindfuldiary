"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Brain, MapPin, Cloud, Users, Lightbulb, Target, Save, Thermometer } from "lucide-react"

export default function SituationAnalysis() {
  const [analysis, setAnalysis] = useState({
    title: "",
    situation: "",
    emotions: [] as string[],
    intensity: [5],
    location: "",
    weather: "sunny",
    peopleInvolved: "",
    triggers: "",
    responses: "",
    learnings: "",
    date: new Date().toISOString().split("T")[0],
  })

  const emotionOptions = [
    "Happy",
    "Sad",
    "Angry",
    "Anxious",
    "Excited",
    "Frustrated",
    "Calm",
    "Overwhelmed",
    "Grateful",
    "Disappointed",
    "Hopeful",
    "Confused",
  ]

  const weatherOptions = [
    { value: "sunny", label: "☀️ Sunny", color: "yellow" },
    { value: "cloudy", label: "☁️ Cloudy", color: "gray" },
    { value: "rainy", label: "🌧️ Rainy", color: "blue" },
    { value: "stormy", label: "⛈️ Stormy", color: "purple" },
    { value: "snowy", label: "❄️ Snowy", color: "blue" },
  ]

  const toggleEmotion = (emotion: string) => {
    const current = analysis.emotions
    if (current.includes(emotion)) {
      setAnalysis((prev) => ({
        ...prev,
        emotions: current.filter((e) => e !== emotion),
      }))
    } else {
      setAnalysis((prev) => ({
        ...prev,
        emotions: [...current, emotion],
      }))
    }
  }

  const handleSave = () => {
    alert("Situation analysis saved! AI insights will be generated shortly.")
    // Reset form
    setAnalysis({
      title: "",
      situation: "",
      emotions: [],
      intensity: [5],
      location: "",
      weather: "sunny",
      peopleInvolved: "",
      triggers: "",
      responses: "",
      learnings: "",
      date: new Date().toISOString().split("T")[0],
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
            <Brain className="h-6 w-6 text-blue-600" />
            Situation Analysis
          </h2>
          <p className="text-gray-600 dark:text-gray-400">Reflect and gain insights from your experiences</p>
        </div>
      </div>

      {/* Main Analysis Form */}
      <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-blue-600" />
            New Situation Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Situation Title</Label>
              <Input
                id="title"
                value={analysis.title}
                onChange={(e) => setAnalysis((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Brief title for this situation..."
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={analysis.date}
                onChange={(e) => setAnalysis((prev) => ({ ...prev, date: e.target.value }))}
                className="mt-1"
              />
            </div>
          </div>

          {/* Situation Description */}
          <div>
            <Label htmlFor="situation">What happened?</Label>
            <Textarea
              id="situation"
              value={analysis.situation}
              onChange={(e) => setAnalysis((prev) => ({ ...prev, situation: e.target.value }))}
              placeholder="Describe the situation in detail..."
              className="min-h-24 mt-1"
            />
          </div>

          {/* Context Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="location" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Location/Setting
              </Label>
              <Input
                id="location"
                value={analysis.location}
                onChange={(e) => setAnalysis((prev) => ({ ...prev, location: e.target.value }))}
                placeholder="Where did this happen?"
                className="mt-1"
              />
            </div>
            <div>
              <Label className="flex items-center gap-2">
                <Cloud className="h-4 w-4" />
                Weather/Environment
              </Label>
              <RadioGroup
                value={analysis.weather}
                onValueChange={(value) => setAnalysis((prev) => ({ ...prev, weather: value }))}
                className="flex flex-wrap gap-2 mt-2"
              >
                {weatherOptions.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={option.value} id={option.value} />
                    <Label htmlFor={option.value} className="text-sm">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </div>

          {/* People Involved */}
          <div>
            <Label htmlFor="people" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              People Involved
            </Label>
            <Input
              id="people"
              value={analysis.peopleInvolved}
              onChange={(e) => setAnalysis((prev) => ({ ...prev, peopleInvolved: e.target.value }))}
              placeholder="Who else was involved?"
              className="mt-1"
            />
          </div>

          {/* Emotions */}
          <div>
            <Label className="text-base font-medium">How did you feel?</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {emotionOptions.map((emotion) => (
                <Badge
                  key={emotion}
                  variant={analysis.emotions.includes(emotion) ? "default" : "outline"}
                  className={`cursor-pointer transition-all ${
                    analysis.emotions.includes(emotion)
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "hover:bg-blue-50 dark:hover:bg-blue-900/30"
                  }`}
                  onClick={() => toggleEmotion(emotion)}
                >
                  {emotion}
                </Badge>
              ))}
            </div>
          </div>

          {/* Emotional Intensity */}
          <div>
            <Label className="text-base font-medium flex items-center gap-2">
              <Thermometer className="h-4 w-4" />
              Emotional Intensity (1-10)
            </Label>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              How intense were your emotions? Currently: {analysis.intensity[0]}
            </p>
            <Slider
              value={analysis.intensity}
              onValueChange={(value) => setAnalysis((prev) => ({ ...prev, intensity: value }))}
              max={10}
              min={1}
              step={1}
              className="w-full"
            />
          </div>

          {/* Reflection Questions */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="triggers">What triggered this situation or your response?</Label>
              <Textarea
                id="triggers"
                value={analysis.triggers}
                onChange={(e) => setAnalysis((prev) => ({ ...prev, triggers: e.target.value }))}
                placeholder="Identify potential triggers..."
                className="min-h-20 mt-1"
              />
            </div>

            <div>
              <Label htmlFor="responses">How did you respond? What actions did you take?</Label>
              <Textarea
                id="responses"
                value={analysis.responses}
                onChange={(e) => setAnalysis((prev) => ({ ...prev, responses: e.target.value }))}
                placeholder="Describe your responses and actions..."
                className="min-h-20 mt-1"
              />
            </div>

            <div>
              <Label htmlFor="learnings">What did you learn? What would you do differently?</Label>
              <Textarea
                id="learnings"
                value={analysis.learnings}
                onChange={(e) => setAnalysis((prev) => ({ ...prev, learnings: e.target.value }))}
                placeholder="Reflect on insights and potential improvements..."
                className="min-h-20 mt-1"
              />
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-4">
            <Button
              onClick={handleSave}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              disabled={!analysis.title || !analysis.situation}
            >
              <Save className="h-4 w-4" />
              Save Analysis
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* AI Insights Preview */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-700">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Target className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-gray-800 dark:text-gray-200">AI Pattern Recognition</h3>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Our AI will analyze your situation to identify patterns, suggest coping strategies, and help you develop
            emotional intelligence over time.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
