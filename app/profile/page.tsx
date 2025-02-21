"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "../supabase-client"

export default function Profile() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [height, setHeight] = useState("")
  const [weight, setWeight] = useState("")
  const [age, setAge] = useState("")
  const [fitnessGoal, setFitnessGoal] = useState("weight_loss")
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        // Fetch user profile data
        const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single()
        if (data) {
          setHeight(data.height || "")
          setWeight(data.weight || "")
          setAge(data.age || "")
          setFitnessGoal(data.fitness_goal || "weight_loss")
        }
      } else {
        router.push("/login")
      }
      setLoading(false)
    }
    getUser()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { error } = await supabase.from("profiles").upsert({
        id: user.id,
        height: Number.parseFloat(height),
        weight: Number.parseFloat(weight),
        age: Number.parseInt(age),
        fitness_goal: fitnessGoal,
      })
      if (error) throw error
      alert("Profile updated successfully!")
      router.push("/dashboard")
    } catch (error) {
      alert("Error updating profile: " + error.message)
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-3xl font-bold mb-6">User Profile</h1>
      <p>View and edit your profile information.</p>
      <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-md">
        <div>
          <label htmlFor="height" className="block mb-2">
            Height (cm):
          </label>
          <input
            type="number"
            id="height"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            required
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label htmlFor="weight" className="block mb-2">
            Weight (kg):
          </label>
          <input
            type="number"
            id="weight"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            required
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label htmlFor="age" className="block mb-2">
            Age:
          </label>
          <input
            type="number"
            id="age"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            required
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label htmlFor="fitnessGoal" className="block mb-2">
            Fitness Goal:
          </label>
          <select
            id="fitnessGoal"
            value={fitnessGoal}
            onChange={(e) => setFitnessGoal(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="weight_loss">Weight Loss</option>
            <option value="muscle_gain">Muscle Gain</option>
            <option value="endurance">Endurance</option>
          </select>
        </div>
        <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">
          Update Profile
        </button>
      </form>
    </div>
  )
}

