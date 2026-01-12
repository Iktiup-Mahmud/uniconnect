import Link from "next/link";
import { Users, MessageCircle, Share2, Bell, Heart, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-md">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500">
              <Users className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">UniConnect</span>
          </div>
          <nav className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-xl px-6 py-2.5 text-sm font-medium text-gray-700 transition-all hover:bg-gray-100"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 px-6 py-2.5 text-sm font-medium text-white shadow-lg shadow-cyan-500/30 transition-all hover:shadow-xl hover:shadow-cyan-500/40"
            >
              Sign Up
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 text-center lg:py-28">
        <div className="mx-auto max-w-4xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-cyan-100 px-4 py-2 text-sm font-medium text-cyan-700">
            <Zap className="h-4 w-4" />
            Join 10,000+ Students Worldwide
          </div>
          <h1 className="mb-6 text-5xl font-bold leading-tight text-gray-900 md:text-6xl lg:text-7xl">
            Your University
            <br />
            <span className="bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 bg-clip-text text-transparent">
              Social Network
            </span>
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-gray-600 md:text-xl">
            Connect with classmates, share experiences, and build meaningful relationships
            in a vibrant community designed for students.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/register"
              className="group w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 px-8 py-4 text-lg font-semibold text-white shadow-xl shadow-cyan-500/30 transition-all hover:shadow-2xl hover:shadow-cyan-500/40 sm:w-auto"
            >
              Get Started Free
              <span className="ml-2 inline-block transition-transform group-hover:translate-x-1">
                →
              </span>
            </Link>
            <Link
              href="#features"
              className="w-full rounded-xl border-2 border-gray-300 bg-white px-8 py-4 text-lg font-semibold text-gray-700 transition-all hover:border-gray-400 hover:bg-gray-50 sm:w-auto"
            >
              Learn More
            </Link>
          </div>
        </div>

        {/* Preview Cards */}
        <div className="mx-auto mt-16 max-w-5xl">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-lg">
              <div className="mb-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-pink-400 to-red-400"></div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-gray-900">Sarah Johnson</p>
                  <p className="text-xs text-gray-500">Computer Science</p>
                </div>
              </div>
              <p className="mb-3 text-left text-sm text-gray-600">
                Just finished my final project! 🎉 Thanks to everyone who helped along the way.
              </p>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Heart className="h-4 w-4" /> 24
                </span>
                <span className="flex items-center gap-1">
                  <MessageCircle className="h-4 w-4" /> 8
                </span>
              </div>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-lg">
              <div className="mb-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400"></div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-gray-900">Alex Chen</p>
                  <p className="text-xs text-gray-500">Engineering</p>
                </div>
              </div>
              <p className="mb-3 text-left text-sm text-gray-600">
                Study group forming for tomorrow's exam. DM me if interested! 📚
              </p>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Heart className="h-4 w-4" /> 42
                </span>
                <span className="flex items-center gap-1">
                  <MessageCircle className="h-4 w-4" /> 15
                </span>
              </div>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-lg md:col-span-2 lg:col-span-1">
              <div className="mb-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-400"></div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-gray-900">Maya Patel</p>
                  <p className="text-xs text-gray-500">Business</p>
                </div>
              </div>
              <p className="mb-3 text-left text-sm text-gray-600">
                Amazing networking event today! Met so many inspiring people. 🌟
              </p>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Heart className="h-4 w-4" /> 67
                </span>
                <span className="flex items-center gap-1">
                  <MessageCircle className="h-4 w-4" /> 23
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="border-t bg-white py-20">
        <div className="container mx-auto px-6">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold text-gray-900 md:text-5xl">
              Everything You Need
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-600">
              A complete social platform built for the modern student experience
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-cyan-50 to-blue-50 p-8 transition-all hover:shadow-lg">
              <div className="mb-4 inline-flex rounded-xl bg-cyan-500 p-3 text-white">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-gray-900">Connect & Network</h3>
              <p className="text-gray-600">
                Build your professional network with students, alumni, and professors from around the world.
              </p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-purple-50 to-pink-50 p-8 transition-all hover:shadow-lg">
              <div className="mb-4 inline-flex rounded-xl bg-purple-500 p-3 text-white">
                <MessageCircle className="h-6 w-6" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-gray-900">Real-time Chat</h3>
              <p className="text-gray-600">
                Stay connected with instant messaging, group chats, and seamless communication.
              </p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-orange-50 to-red-50 p-8 transition-all hover:shadow-lg">
              <div className="mb-4 inline-flex rounded-xl bg-orange-500 p-3 text-white">
                <Share2 className="h-6 w-6" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-gray-900">Share Moments</h3>
              <p className="text-gray-600">
                Post updates, photos, and share your university journey with your community.
              </p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-green-50 to-emerald-50 p-8 transition-all hover:shadow-lg">
              <div className="mb-4 inline-flex rounded-xl bg-green-500 p-3 text-white">
                <Bell className="h-6 w-6" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-gray-900">Smart Notifications</h3>
              <p className="text-gray-600">
                Never miss important updates with intelligent, personalized notifications.
              </p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-8 transition-all hover:shadow-lg">
              <div className="mb-4 inline-flex rounded-xl bg-blue-500 p-3 text-white">
                <Heart className="h-6 w-6" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-gray-900">Engage & React</h3>
              <p className="text-gray-600">
                Like, comment, and interact with content that matters to you and your peers.
              </p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-yellow-50 to-orange-50 p-8 transition-all hover:shadow-lg">
              <div className="mb-4 inline-flex rounded-xl bg-yellow-500 p-3 text-white">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-gray-900">Lightning Fast</h3>
              <p className="text-gray-600">
                Optimized performance ensures a smooth, responsive experience on any device.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-500 py-20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="mb-4 text-4xl font-bold text-white md:text-5xl">
            Ready to Get Started?
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-cyan-50">
            Join thousands of students already connecting on UniConnect
          </p>
          <Link
            href="/register"
            className="inline-block rounded-xl bg-white px-8 py-4 text-lg font-semibold text-blue-600 shadow-xl transition-all hover:scale-105 hover:shadow-2xl"
          >
            Create Your Account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white py-12">
        <div className="container mx-auto px-6">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <span className="text-lg font-bold text-gray-900">UniConnect</span>
              </div>
              <p className="text-sm text-gray-600">
                Connecting students worldwide
              </p>
            </div>
            <div>
              <h4 className="mb-4 font-semibold text-gray-900">Product</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="#" className="hover:text-cyan-500">Features</Link></li>
                <li><Link href="#" className="hover:text-cyan-500">Pricing</Link></li>
                <li><Link href="#" className="hover:text-cyan-500">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 font-semibold text-gray-900">Company</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="#" className="hover:text-cyan-500">About</Link></li>
                <li><Link href="#" className="hover:text-cyan-500">Blog</Link></li>
                <li><Link href="#" className="hover:text-cyan-500">Careers</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 font-semibold text-gray-900">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="#" className="hover:text-cyan-500">Privacy</Link></li>
                <li><Link href="#" className="hover:text-cyan-500">Terms</Link></li>
                <li><Link href="#" className="hover:text-cyan-500">Contact</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 border-t pt-8 text-center text-sm text-gray-600">
            <p>&copy; 2026 UniConnect. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
