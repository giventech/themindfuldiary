"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Mic, MicOff, Save, Sparkles, Moon, Zap } from "lucide-react"

export default function DreamLogger() {
  const [isRecording, setIsRecording] = useState(false)
  const [dreamEntry, setDreamEntry] = useState({
    title: "",
    content: "",
    emotions: [] as string[],
    vividness: [7],
    lucidity: [3],
    themes: [] as string[],
    date: new Date().toISOString().split("T")[0],
  })

  const emotionOptions = ["Joy", "Fear", "Anxiety", "Wonder", "Confusion", "Peace", "Excitement", "Sadness"]

  const themeOptions = ["Flying", "Water", "Animals", "People", "Places", "Colors", "Symbols", "Numbers"]

  const toggleEmotion = (emotion: string) => {
    const current = dreamEntry.emotions
    if (current.includes(emotion)) {
      setDreamEntry((prev) => ({
        ...prev,
        emotions: current.filter((e) => e !== emotion),
      }))
    } else {
      setDreamEntry((prev) => ({
        ...prev,
        emotions: [...current, emotion],
      }))
    }
  }

  const toggleTheme = (theme: string) => {
    const current = dreamEntry.themes
    if (current.includes(theme)) {
      setDreamEntry((prev) => ({
        ...prev,
        themes: current.filter((t) => t !== theme),
      }))
    } else {
      setDreamEntry((prev) => ({
        ...prev,
        themes: [...current, theme],
      }))
    }
  }

  const handleSave = () => {
    // Simulate saving
    alert("Dream saved! AI analysis will be available shortly.")
    // Reset form
    setDreamEntry({
      title: "",
      content: "",
      emotions: [],
      vividness: [7],
      lucidity: [3],
      themes: [],
      date: new Date().toISOString().split("T")[0],
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
            <Moon className="h-6 w-6 text-purple-600" />
            Dream Logger
          </h2>
          <p className="text-gray-600 dark:text-gray-400">Capture your subconscious experiences</p>
        </div>
      </div>

      {/* Main Entry Form */}
      <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            New Dream Entry
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Dream Title</Label>
              <Input
                id="title"
                value={dreamEntry.title}
                onChange={(e) => setDreamEntry((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Give your dream a title..."
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={dreamEntry.date}
                onChange={(e) => setDreamEntry((prev) => ({ ...prev, date: e.target.value }))}
                className="mt-1"
              />
            </div>
          </div>

          {/* Dream Content */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="content">Dream Description</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsRecording(!isRecording)}
                className={`flex items-center gap-2 ${isRecording ? "bg-red-50 text-red-600 border-red-200" : ""}`}
              >
                {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                {isRecording ? "Stop Recording" : "Voice Input"}
              </Button>
            </div>
            <Textarea
              id="content"
              value={dreamEntry.content}
              onChange={(e) => setDreamEntry((prev) => ({ ...prev, content: e.target.value }))}
              placeholder="Describe your dream in as much detail as you remember..."
              className="min-h-32"
            />
            {isRecording && (
              <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-sm">Recording... Speak clearly</span>
                </div>
              </div>
            )}
          </div>

          {/* Emotions */}
          <div>
            <Label className="text-base font-medium">Emotions in the dream</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {emotionOptions.map((emotion) => (
                <Badge
                  key={emotion}
                  variant={dreamEntry.emotions.includes(emotion) ? "default" : "outline"}
                  className={`cursor-pointer transition-all ${
                    dreamEntry.emotions.includes(emotion)
                      ? "bg-purple-600 hover:bg-purple-700"
                      : "hover:bg-purple-50 dark:hover:bg-purple-900/30"
                  }`}
                  onClick={() => toggleEmotion(emotion)}
                >
                  {emotion}
                </Badge>
              ))}
            </div>
          </div>

          {/* Dream Characteristics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="text-base font-medium">Vividness (1-10)</Label>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                How clear and detailed was your dream? Currently: {dreamEntry.vividness[0]}
              </p>
              <Slider
                value={dreamEntry.vividness}
                onValueChange={(value) => setDreamEntry((prev) => ({ ...prev, vividness: value }))}
                max={10}
                min={1}
                step={1}
                className="w-full"
              />
            </div>
            <div>
              <Label className="text-base font-medium">Lucidity (1-10)</Label>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                How aware were you that you were dreaming? Currently: {dreamEntry.lucidity[0]}
              </p>
              <Slider
                value={dreamEntry.lucidity}
                onValueChange={(value) => setDreamEntry((prev) => ({ ...prev, lucidity: value }))}
                max={10}
                min={1}
                step={1}
                className="w-full"
              />
            </div>
          </div>

          {/* Themes */}
          <div>
            <Label className="text-base font-medium">Dream Themes</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {themeOptions.map((theme) => (
                <Badge
                  key={theme}
                  variant={dreamEntry.themes.includes(theme) ? "default" : "outline"}
                  className={`cursor-pointer transition-all ${
                    dreamEntry.themes.includes(theme)
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "hover:bg-blue-50 dark:hover:bg-blue-900/30"
                  }`}
                  onClick={() => toggleTheme(theme)}
                >
                  {theme}
                </Badge>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-4">
            <Button
              onClick={handleSave}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              disabled={!dreamEntry.title || !dreamEntry.content}
            >
              <Save className="h-4 w-4" />
              Save Dream
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* AI Insights Preview */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-200 dark:border-purple-700">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="h-5 w-5 text-purple-600" />
            <h3 className="font-semibold text-gray-800 dark:text-gray-200">AI Dream Analysis</h3>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Once you save your dream, our AI will analyze patterns, symbols, and emotions to provide personalized
            insights about your subconscious mind.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
