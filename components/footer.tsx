import Link from "next/link"
import { Facebook, Twitter, Instagram, Youtube, Mail, MapPin, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <Link href="/" className="text-2xl font-bold text-white">
              Fitness Studio
            </Link>
            <p className="text-sm text-gray-400">
              Empowering your fitness journey with AI-powered personalized training and nutrition plans.
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="hover:text-red-500 transition-colors">
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </Link>
              <Link href="#" className="hover:text-red-500 transition-colors">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Link>
              <Link href="#" className="hover:text-red-500 transition-colors">
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </Link>
              <Link href="#" className="hover:text-red-500 transition-colors">
                <Youtube className="h-5 w-5" />
                <span className="sr-only">YouTube</span>
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="hover:text-red-500 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-red-500 transition-colors">
                  Services
                </Link>
              </li>
              <li>
                <Link href="/workouts" className="hover:text-red-500 transition-colors">
                  Workouts
                </Link>
              </li>
              <li>
                <Link href="/nutrition" className="hover:text-red-500 transition-colors">
                  Nutrition Plans
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-red-500 transition-colors">
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-red-500 mt-0.5" />
                <span>123 Fitness Street, Gym City, SP 12345</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-red-500" />
                <span>+1 (234) 567-8900</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-red-500" />
                <span>contact@fitnessstudio.com</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Newsletter</h3>
            <p className="text-sm text-gray-400 mb-4">
              Subscribe to our newsletter for tips, news, and exclusive offers.
            </p>
            <form className="space-y-2">
              <Input
                type="email"
                placeholder="Enter your email"
                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
              />
              <Button className="w-full bg-red-500 hover:bg-red-600">Subscribe</Button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-gray-400">© {new Date().getFullYear()} Fitness Studio. All rights reserved.</p>
            <div className="flex space-x-6 text-sm">
              <Link href="/privacy" className="hover:text-red-500 transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-red-500 transition-colors">
                Terms of Service
              </Link>
              <Link href="/cookies" className="hover:text-red-500 transition-colors">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

