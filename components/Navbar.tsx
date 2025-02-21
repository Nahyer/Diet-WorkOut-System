"use client"
import { useState } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { OnboardingDialog } from "./onboarding-dialog"

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-gray-900/75">
      <div className="container flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold text-red-500">Fitness Studio</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          <Link href="/" className="transition-colors text-white hover:text-red-500">
            Home
          </Link>
          <Link href="/about" className="transition-colors text-white hover:text-red-500">
            About
          </Link>
          <Link href="/services" className="transition-colors text-white hover:text-red-500">
            Services
          </Link>
          <Link href="/contact" className="transition-colors text-white hover:text-red-500">
            Contact
          </Link>
          <Link href="/dashboard" className="transition-colors text-white hover:text-red-500">
            Dashboard
          </Link>
          <Link href="/admin" className="transition-colors text-white hover:text-red-500">
            Admin
          </Link>
        </nav>

        {/* Desktop Sign In and Sign Up */}
        <div className="hidden md:flex items-center space-x-4">
          <Button asChild variant="ghost" className="text-white hover:text-red-500 hover:bg-transparent">
            <Link href="/login">Sign In</Link>
          </Button>
          <OnboardingDialog />
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                className="px-0 text-white hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                onClick={toggleMobileMenu}
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px] bg-gray-900 text-white">
              <nav className="flex flex-col space-y-4 mt-6">
                <Link
                  href="/"
                  className="transition-colors hover:text-red-500"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Home
                </Link>
                <Link
                  href="/about"
                  className="transition-colors hover:text-red-500"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  About
                </Link>
                <Link
                  href="/services"
                  className="transition-colors hover:text-red-500"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Services
                </Link>
                <Link
                  href="/contact"
                  className="transition-colors hover:text-red-500"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Contact
                </Link>
                <Link
                  href="/dashboard"
                  className="transition-colors hover:text-red-500"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  href="/admin"
                  className="transition-colors hover:text-red-500"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Admin
                </Link>
                <div className="pt-4">
                  <Button
                    asChild
                    variant="ghost"
                    className="w-full justify-start text-white hover:text-red-500 hover:bg-transparent"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Link href="/login">Sign In</Link>
                  </Button>
                  <OnboardingDialog />
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}

