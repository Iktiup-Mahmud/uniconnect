import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="text-2xl font-bold text-indigo-600">UniConnect</div>
          <nav className="flex gap-4">
            <Link
              href="/login"
              className="rounded-lg px-4 py-2 text-gray-700 hover:bg-gray-100"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
            >
              Sign Up
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="mb-6 text-5xl font-bold text-gray-900 md:text-6xl">
          Connect with Your{" "}
          <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            University Community
          </span>
        </h1>
        <p className="mx-auto mb-8 max-w-2xl text-xl text-gray-600">
          Share moments, connect with friends, and build your social network in
          a platform designed for students.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            href="/register"
            className="rounded-lg bg-indigo-600 px-8 py-3 text-lg font-semibold text-white hover:bg-indigo-700"
          >
            Get Started
          </Link>
          <Link
            href="#features"
            className="rounded-lg border-2 border-indigo-600 px-8 py-3 text-lg font-semibold text-indigo-600 hover:bg-indigo-50"
          >
            Learn More
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-white py-20">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-4xl font-bold text-gray-900">
            Why Choose UniConnect?
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-lg border p-6">
              <div className="mb-4 text-4xl">🌐</div>
              <h3 className="mb-2 text-xl font-semibold">Connect Globally</h3>
              <p className="text-gray-600">
                Build connections with students from universities around the
                world.
              </p>
            </div>
            <div className="rounded-lg border p-6">
              <div className="mb-4 text-4xl">📱</div>
              <h3 className="mb-2 text-xl font-semibold">Share Moments</h3>
              <p className="text-gray-600">
                Post updates, photos, and share your university experiences.
              </p>
            </div>
            <div className="rounded-lg border p-6">
              <div className="mb-4 text-4xl">🔒</div>
              <h3 className="mb-2 text-xl font-semibold">Secure & Private</h3>
              <p className="text-gray-600">
                Your data is protected with industry-standard security measures.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white py-8">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>&copy; 2025 UniConnect. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
