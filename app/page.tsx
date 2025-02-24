"use client"

import type React from "react"

import { ArrowRight, Calendar, Apple, Dumbbell, ChevronRight, Star, Users, Trophy } from "lucide-react"
import { Button } from "@/components/ui/button"
import BMICalculator from "@/components/BMICalculator"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 flex items-center">
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 to-black/60">
          <img
            src={`${process.env.NEXT_PUBLIC_BLOB_URL}/Seiqo.png`}
            alt="Hero Background"
            className="w-full h-full object-cover mix-blend-overlay"
          />
        </div>
        <div className="container relative z-10 mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Your AI-Powered <span className="text-red-500">Personal Transformation</span> Journey
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-8">
              Achieve your fitness goals with personalized workout plans, nutrition guidance, and real-time AI coaching.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-red-500 hover:bg-red-600 text-white font-semibold px-8 shadow-lg hover:shadow-red-500/50 transition-all w-full sm:w-auto"
              >
                Start Free Trial <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-white border-2 border-white/80 hover:bg-white hover:text-gray-900 font-semibold px-8 transition-all duration-300 w-full sm:w-auto"
              >
                View Plans
              </Button>
            </div>
            <div className="mt-12 flex flex-wrap justify-center items-center gap-4 sm:gap-8">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-400" fill="currentColor" />
                <span className="text-white">4.9/5 Rating</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-400" />
                <span className="text-white">100K+ Active Users</span>
              </div>
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-400" />
                <span className="text-white">Best Fitness App 2024</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">Key Features</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={<Dumbbell className="h-8 w-8 text-red-500" />}
              title="AI-Powered Training"
              description="Get personalized workout plans that adapt to your progress and goals."
            />
            <FeatureCard
              icon={<Apple className="h-8 w-8 text-green-500" />}
              title="Smart Nutrition"
              description="Receive customized meal plans and real-time nutritional guidance."
            />
            <FeatureCard
              icon={<Calendar className="h-8 w-8 text-red-500" />}
              title="Flexible Scheduling"
              description="Plan your workouts around your life with smart scheduling."
            />
            <FeatureCard
              icon={<Users className="h-8 w-8 text-red-500" />}
              title="Community Support"
              description="Join a vibrant community of fitness enthusiasts."
            />
          </div>
        </div>
      </section>

      {/* BMI Calculator Section */}
     <BMICalculator />
      {/* Success Stories */}
      <section className="py-16 md:py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">Success Stories</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <TestimonialCard
              image="/placeholder.svg?height=400&width=300"
              quote="Lost 30 pounds in 3 months!"
              name="Sarah Johnson"
              achievement="-30 lbs"
            />
            <TestimonialCard
              image="/placeholder.svg?height=400&width=300"
              quote="Stronger and healthier than ever!"
              name="Mike Chen"
              achievement="+40% Strength"
            />
            <TestimonialCard
              image="/placeholder.svg?height=400&width=300"
              quote="Finally achieved my dream physique"
              name="Emma Davis"
              achievement="15% Body Fat"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20 bg-red-500">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-4xl font-bold text-white mb-8">Start Your Transformation Today</h2>
          <p className="text-lg md:text-xl text-white/90 mb-8">
            Join thousands of others who have already changed their lives
          </p>
          <Button size="lg" variant="secondary" className="bg-white text-red-500 hover:bg-gray-100 w-full sm:w-auto">
            Get Started Free <ChevronRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}

function TestimonialCard({
  image,
  quote,
  name,
  achievement,
}: {
  image: string
  quote: string
  name: string
  achievement: string
}) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
      <img src={image || "/placeholder.svg"} alt={name} className="w-full h-48 object-cover rounded-lg mb-4" />
      <blockquote className="text-lg font-medium mb-4">{quote}</blockquote>
      <div className="flex justify-between items-center">
        <span className="font-semibold">{name}</span>
        <span className="text-red-500 font-bold">{achievement}</span>
      </div>
    </div>
  )
}

