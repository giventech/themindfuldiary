"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Camera, Target, Save, Plus, Trash2, Calendar, Heart } from "lucide-react"

export default function GratitudeJournal() {
  const [gratitudeEntry, setGratitudeEntry] = useState({
    date: new Date().toISOString().split("T")[0],
    gratitudes: ["", "", ""],
    reflection: "",
    actions: [""],
    manifestation: "",
    photo: null as string | null,
  })

  const [savedEntries] = useState([
    {
      id: 1,
      date: "2024-01-19",
      gratitudes: ["Morning coffee with my partner", "Sunny weather today", "Finished a challenging project"],
      actions: [
        "I am grateful that I called my mom and had a meaningful conversation",
        "I am grateful that I took a 30-minute walk in nature and felt completely present",
      ],
      manifestation:
        "I can feel the warmth and connection from reaching out to my mom, and the peace and clarity from spending time in nature. These actions have already strengthened my relationships and inner calm.",
      reflection: "Today reminded me how small moments can bring the most joy.",
    },
  ])

  const updateGratitude = (index: number, value: string) => {
    const newGratitudes = [...gratitudeEntry.gratitudes]
    newGratitudes[index] = value
    setGratitudeEntry((prev) => ({ ...prev, gratitudes: newGratitudes }))
  }

  const updateAction = (index: number, value: string) => {
    const newActions = [...gratitudeEntry.actions]
    newActions[index] = value
    setGratitudeEntry((prev) => ({ ...prev, actions: newActions }))
  }

  const addAction = () => {
    setGratitudeEntry((prev) => ({
      ...prev,
      actions: [...prev.actions, ""],
    }))
  }

  const removeAction = (index: number) => {
    if (gratitudeEntry.actions.length > 1) {
      const newActions = gratitudeEntry.actions.filter((_, i) => i !== index)
      setGratitudeEntry((prev) => ({ ...prev, actions: newActions }))
    }
  }

  const handlePhotoUpload = () => {
    // Simulate photo upload
    setGratitudeEntry((prev) => ({
      ...prev,
      photo: "/placeholder.svg?height=200&width=300",
    }))
  }

  const handleSave = () => {
    alert("Gratitude entry saved! Your positive energy is building momentum.")
    // Reset form
    setGratitudeEntry({
      date: new Date().toISOString().split("T")[0],
      gratitudes: ["", "", ""],
      reflection: "",
      actions: [""],
      manifestation: "",
      photo: null,
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-yellow-600" />
            Gratitude Journal
          </h2>
          <p className="text-gray-600 dark:text-gray-400">Transform appreciation into meaningful action</p>
        </div>
      </div>

      {/* New Entry Form */}
      <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-yellow-600" />
            Today's Gratitude Entry
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Date */}
          <div>
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={gratitudeEntry.date}
              onChange={(e) => setGratitudeEntry((prev) => ({ ...prev, date: e.target.value }))}
              className="mt-1 max-w-xs"
            />
          </div>

          {/* Three Gratitudes */}
          <div>
            <Label className="text-base font-medium">Three things I'm grateful for today:</Label>
            <div className="space-y-3 mt-3">
              {gratitudeEntry.gratitudes.map((gratitude, index) => (
                <div key={index}>
                  <Label htmlFor={`gratitude-${index}`} className="text-sm text-gray-600 dark:text-gray-400">
                    {index + 1}.
                  </Label>
                  <Input
                    id={`gratitude-${index}`}
                    value={gratitude}
                    onChange={(e) => updateGratitude(index, e.target.value)}
                    placeholder="What are you grateful for?"
                    className="mt-1"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Photo Upload */}
          <div>
            <Label className="text-base font-medium">Capture the moment (optional)</Label>
            <div className="mt-2">
              {gratitudeEntry.photo ? (
                <div className="relative">
                  <img
                    src={gratitudeEntry.photo || "/placeholder.svg"}
                    alt="Gratitude moment"
                    className="w-full max-w-sm h-48 object-cover rounded-lg"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setGratitudeEntry((prev) => ({ ...prev, photo: null }))}
                    className="absolute top-2 right-2 bg-white/80"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button variant="outline" onClick={handlePhotoUpload} className="flex items-center gap-2">
                  <Camera className="h-4 w-4" />
                  Add Photo
                </Button>
              )}
            </div>
          </div>

          {/* Reflection */}
          <div>
            <Label htmlFor="reflection">Reflection</Label>
            <Textarea
              id="reflection"
              value={gratitudeEntry.reflection}
              onChange={(e) => setGratitudeEntry((prev) => ({ ...prev, reflection: e.target.value }))}
              placeholder="How do these gratitudes make you feel? What patterns do you notice?"
              className="min-h-24 mt-1"
            />
          </div>

          {/* Manifestation Gratitude */}
          <div>
            <Label className="text-base font-medium">Gratitude for Future Actions (Manifestation)</Label>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Express gratitude for the actions you will take, as if they've already happened. Feel the appreciation for
              your future self's commitment to growth.
            </p>
            <div className="space-y-3">
              {gratitudeEntry.actions.map((action, index) => (
                <div key={index} className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      value={action}
                      onChange={(e) => updateAction(index, e.target.value)}
                      placeholder="I am grateful that I will... (write as if already accomplished)"
                      className="flex-1"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-2">
                      Example: "I am grateful that I called my mother and strengthened our connection"
                    </p>
                  </div>
                  {gratitudeEntry.actions.length > 1 && (
                    <Button variant="outline" size="sm" onClick={() => removeAction(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addAction} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Manifestation Gratitude
              </Button>
            </div>
          </div>

          {/* Manifestation Visualization */}
          <div>
            <Label htmlFor="manifestation">Manifestation Visualization</Label>
            <Textarea
              id="manifestation"
              value={gratitudeEntry.manifestation || ""}
              onChange={(e) => setGratitudeEntry((prev) => ({ ...prev, manifestation: e.target.value }))}
              placeholder="Visualize and describe how it feels to have already taken these actions. What positive changes do you see in your life?"
              className="min-h-24 mt-1"
            />
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-4">
            <Button
              onClick={handleSave}
              className="flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
              disabled={gratitudeEntry.gratitudes.every((g) => !g.trim())}
            >
              <Save className="h-4 w-4" />
              Save Entry
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Entries */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200 flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Recent Entries
        </h3>
        <div className="space-y-4">
          {savedEntries.map((entry) => (
            <Card key={entry.id} className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <Badge variant="outline">{entry.date}</Badge>
                </div>
                <div className="space-y-2 mb-4">
                  <h4 className="font-medium text-gray-800 dark:text-gray-200">Gratitudes:</h4>
                  <ul className="space-y-1">
                    {entry.gratitudes.map((gratitude, index) => (
                      <li key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                        <span className="text-yellow-600 dark:text-yellow-400">•</span>
                        {gratitude}
                      </li>
                    ))}
                  </ul>
                </div>
                {entry.actions.length > 0 && (
                  <div className="space-y-2 mb-4">
                    <h4 className="font-medium text-gray-800 dark:text-gray-200 flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      Manifestation Gratitudes:
                    </h4>
                    <ul className="space-y-1">
                      {entry.actions.map((action, index) => (
                        <li key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                          <span className="text-green-600 dark:text-green-400">✨</span>
                          {action}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {entry.manifestation && (
                  <div className="space-y-2 mb-4">
                    <h4 className="font-medium text-gray-800 dark:text-gray-200">Manifestation Visualization:</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 italic bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 p-3 rounded-lg border-l-4 border-purple-400">
                      "{entry.manifestation}"
                    </p>
                  </div>
                )}
                {entry.reflection && (
                  <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-600 dark:text-gray-400 italic">"{entry.reflection}"</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
