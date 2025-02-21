"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Brain, Apple, Users, ChevronRight, CheckCircle2, BarChart3 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"

export default function Services() {
  const [selectedPlan, setSelectedPlan] = useState("monthly")

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 bg-gray-900">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-purple-500/20 backdrop-blur-xl" />
        </div>
        <div className="container relative z-10 mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <motion.h1
              className="text-4xl md:text-5xl font-bold text-white mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              Transform Your Fitness Journey with AI
            </motion.h1>
            <motion.p
              className="text-xl text-gray-300 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Discover our comprehensive suite of AI-powered fitness and nutrition services
            </motion.p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Our Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={<Brain className="h-8 w-8 text-red-500" />}
              title="AI Workout Planning"
              description="Personalized workout plans that adapt to your progress and goals"
            />
            <FeatureCard
              icon={<Apple className="h-8 w-8 text-red-500" />}
              title="Nutrition Guidance"
              description="Expert nutrition advice and customized meal plans"
            />
            <FeatureCard
              icon={<BarChart3 className="h-8 w-8 text-red-500" />}
              title="Progress Tracking"
              description="Detailed analytics and progress monitoring"
            />
            <FeatureCard
              icon={<Users className="h-8 w-8 text-red-500" />}
              title="Community Support"
              description="Join a vibrant community of fitness enthusiasts"
            />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl font-bold mb-4">Choose Your Plan</h2>
            <p className="text-gray-600 mb-8">Select the perfect plan for your fitness journey</p>
            <div className="inline-flex items-center p-1 bg-gray-100 rounded-lg">
              <button
                className={`px-4 py-2 rounded-md ${
                  selectedPlan === "monthly" ? "bg-white shadow-sm" : "text-gray-500 hover:text-gray-900"
                }`}
                onClick={() => setSelectedPlan("monthly")}
              >
                Monthly
              </button>
              <button
                className={`px-4 py-2 rounded-md ${
                  selectedPlan === "annual" ? "bg-white shadow-sm" : "text-gray-500 hover:text-gray-900"
                }`}
                onClick={() => setSelectedPlan("annual")}
              >
                Annual <span className="text-red-500 text-sm">Save 20%</span>
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <PricingCard
              title="Basic"
              price={selectedPlan === "monthly" ? "29" : "279"}
              period={selectedPlan === "monthly" ? "/month" : "/year"}
              features={["AI Workout Planning", "Basic Progress Tracking", "Community Access", "Email Support"]}
              buttonText="Get Started"
              buttonVariant="outline"
            />
            <PricingCard
              title="Premium"
              price={selectedPlan === "monthly" ? "49" : "469"}
              period={selectedPlan === "monthly" ? "/month" : "/year"}
              features={[
                "Everything in Basic",
                "Nutrition Guidance",
                "Advanced Analytics",
                "Priority Support",
                "Custom Meal Plans",
                "Video Consultations",
              ]}
              buttonText="Get Premium"
              buttonVariant="default"
              highlighted={true}
            />
            <PricingCard
              title="Elite"
              price={selectedPlan === "monthly" ? "99" : "949"}
              period={selectedPlan === "monthly" ? "/month" : "/year"}
              features={[
                "Everything in Premium",
                "1-on-1 Coaching",
                "Personalized Plans",
                "24/7 Support",
                "Goal Setting Workshop",
                "Monthly Reviews",
              ]}
              buttonText="Get Elite"
              buttonVariant="outline"
            />
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>How does the AI workout planning work?</AccordionTrigger>
                <AccordionContent>
                  Our AI analyzes your fitness level, goals, and preferences to create personalized workout plans. The
                  system continuously learns from your progress and adjusts the plans accordingly for optimal results.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>Can I change my nutrition plan?</AccordionTrigger>
                <AccordionContent>
                  Yes, you can customize your nutrition plan at any time. Our system allows you to adjust your meal
                  preferences, dietary restrictions, and caloric needs to match your goals.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>Is community support available for all users?</AccordionTrigger>
                <AccordionContent>
                  Yes! All members have access to our community features, including forums, group challenges, and
                  support groups. Premium and Elite members get additional access to exclusive community events and
                  expert Q&A sessions.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-4">
                <AccordionTrigger>How do I track my progress?</AccordionTrigger>
                <AccordionContent>
                  Our app provides comprehensive progress tracking through measurements, photos, workout logs, and
                  nutrition tracking. Premium users get access to advanced analytics and detailed progress reports.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-red-500">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to Start Your Fitness Journey?</h2>
          <p className="text-xl text-white/90 mb-8">
            Join thousands of others who have already transformed their lives
          </p>
          <Button size="lg" variant="secondary" className="bg-white text-red-500 hover:bg-gray-100">
            Get Started Now <ChevronRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <Card className="relative overflow-hidden group hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="mb-4">{icon}</div>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
    </Card>
  )
}

function PricingCard({
  title,
  price,
  period,
  features,
  buttonText,
  buttonVariant = "default",
  highlighted = false,
}: {
  title: string
  price: string
  period: string
  features: string[]
  buttonText: string
  buttonVariant?: "default" | "outline"
  highlighted?: boolean
}) {
  return (
    <Card className={`relative ${highlighted ? "border-red-500 shadow-lg" : ""}`}>
      {highlighted && (
        <div className="absolute top-0 right-0 bg-red-500 text-white px-3 py-1 text-sm rounded-bl-lg">Most Popular</div>
      )}
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <div className="mt-4">
          <span className="text-4xl font-bold">${price}</span>
          <span className="text-gray-500">{period}</span>
        </div>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center">
              <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
        <Button
          className={`w-full mt-6 ${
            buttonVariant === "outline"
              ? "border-2 border-red-500 text-red-500 hover:bg-red-50"
              : "bg-red-500 text-white hover:bg-red-600"
          }`}
        >
          {buttonText}
        </Button>
      </CardContent>
    </Card>
  )
}

