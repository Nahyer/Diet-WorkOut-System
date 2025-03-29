"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Brain, Target, Users, TrendingUp, ChevronRight, Github, Linkedin, Twitter } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Image from "next/image"

// Animated counter component
function Counter({ from, to }: { from: number; to: number }) {
  const [count, setCount] = useState(from)

  useEffect(() => {
    const interval = setInterval(() => {
      setCount((current) => {
        if (current >= to) {
          clearInterval(interval)
          return to
        }
        return current + 1
      })
    }, 50)
    return () => clearInterval(interval)
  }, [to])

  return <span>{count}</span>
}

export default function About() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[50vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-black/60">
        <Image
            src="/images/gym-equipment.jpg"
            alt="Gym Equipment"
            fill
            className="object-cover mix-blend-overlay"
          />
        </div>
        <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
          <motion.h1
            className="text-4xl md:text-6xl font-bold mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Transforming Lives Through AI-Powered Fitness
          </motion.h1>
          <motion.p
            className="text-xl text-gray-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Join thousands of others who have already changed their lives with our personalized approach to fitness and
            nutrition.
          </motion.p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-red-500 mb-2">
                <Counter from={0} to={50} />
                k+
              </div>
              <p className="text-gray-600">Active Users</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-red-500 mb-2">
                <Counter from={0} to={95} />%
              </div>
              <p className="text-gray-600">Success Rate</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-red-500 mb-2">
                <Counter from={0} to={200} />+
              </div>
              <p className="text-gray-600">Expert Trainers</p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Approach Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Tabs defaultValue="mission" className="max-w-4xl mx-auto">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="mission">Our Mission</TabsTrigger>
              <TabsTrigger value="approach">Scientific Approach</TabsTrigger>
            </TabsList>
            <TabsContent value="mission" className="mt-8">
              <Card>
                <CardHeader>
                  <CardTitle>Our Mission</CardTitle>
                  <CardDescription>Empowering individuals to achieve their fitness goals</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600">
                    At Fitness Studio, we believe everyone deserves access to personalized fitness guidance. Our mission
                    is to democratize personal training through AI technology, making expert-level fitness advice
                    accessible to all.
                  </p>
                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="flex items-start space-x-3">
                      <Target className="h-6 w-6 text-red-500" />
                      <div>
                        <h4 className="font-semibold">Personalized Goals</h4>
                        <p className="text-sm text-gray-600">Tailored to your unique needs</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Users className="h-6 w-6 text-red-500" />
                      <div>
                        <h4 className="font-semibold">Community Support</h4>
                        <p className="text-sm text-gray-600">Never train alone</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="approach" className="mt-8">
              <Card>
                <CardHeader>
                  <CardTitle>Scientific Approach</CardTitle>
                  <CardDescription>Research-backed methodologies</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600">
                    Our approach combines cutting-edge exercise science with proven nutrition principles. Every workout
                    and meal plan is backed by peer-reviewed research and validated by industry experts.
                  </p>
                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="flex items-start space-x-3">
                      <Brain className="h-6 w-6 text-red-500" />
                      <div>
                        <h4 className="font-semibold">Evidence-Based</h4>
                        <p className="text-sm text-gray-600">Research-backed methods</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <TrendingUp className="h-6 w-6 text-red-500" />
                      <div>
                        <h4 className="font-semibold">Continuous Improvement</h4>
                        <p className="text-sm text-gray-600">Adaptive programming</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Meet Our Expert Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        <TeamMemberCard
          image="/images/Head-fitness.jpg"
          name="John Doe"
          role="Head of Fitness"
          bio="15+ years of experience in personal training and sports science."
        />
        <TeamMemberCard
          image="/images/chief-nutrition.jpg"
          name="Jane Smith"
          role="Chief Nutritionist"
          bio="Registered dietitian with expertise in sports nutrition and meal planning."
        />
        <TeamMemberCard
          image="/images/AI-tech.jpg"
          name="Mike Johnson"
          role="AI Technology Lead"
          bio="PhD in Computer Science, specializing in machine learning and fitness tech."
        />
          </div>
        </div>
      </section>

      <style jsx>{`
        img {
          object-fit: cover;
          width: 100%;
          height: 100%;
        }
      `}</style>

      {/* CTA Section */}
      <section className="py-20 bg-red-500 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Start Your Fitness Journey?</h2>
          <p className="text-xl mb-8 text-white/90">
            Join thousands of others who have already transformed their lives
          </p>
          <Link href="/login" passHref>
            <Button variant="default" size="lg">
              Get Started <ChevronRight className="h-6 w-6 ml-2" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}

function TeamMemberCard({ image, name, role, bio }: { image: string; name: string; role: string; bio: string }) {
  return (
    <Card className="overflow-hidden group">
      <div className="relative overflow-hidden h-64">
        <Image
          src={image || "/placeholder.svg"}
          alt={name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
          <div className="flex gap-4 text-white">
            <a href="#" className="hover:text-red-500 transition-colors">
              <Twitter className="h-5 w-5" />
            </a>
            <a href="#" className="hover:text-red-500 transition-colors">
              <Linkedin className="h-5 w-5" />
            </a>
            <a href="#" className="hover:text-red-500 transition-colors">
              <Github className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
      <CardContent className="p-6">
        <h3 className="text-xl font-semibold mb-1">{name}</h3>
        <p className="text-red-500 font-medium mb-3">{role}</p>
        <p className="text-gray-600 text-sm">{bio}</p>
      </CardContent>
    </Card>
  )
}

