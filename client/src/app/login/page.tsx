"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, Mail, Lock, AlertCircle } from "lucide-react";
import { api } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await api.login(formData.email, formData.password);

      if (response.success && response.data) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        router.push("/dashboard");
      } else {
        setError(
          response.message || "Login failed. Please check your credentials."
        );
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Unable to connect to server. Please try again later.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Side - Login Form */}
      <div className="flex w-full flex-col justify-center bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 px-6 py-12 lg:w-1/2 lg:px-20">
        <div className="mx-auto w-full max-w-md">
          {/* Logo */}
          <Link href="/" className="mb-8 flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500">
              <Users className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">UniConnect</span>
          </Link>

          {/* Header */}
          <div className="mb-8">
            <h1 className="mb-2 text-3xl font-bold text-gray-900">
              Welcome back
            </h1>
            <p className="text-gray-600">
              Enter your credentials to access your account
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
              <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-500" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-sm font-medium text-gray-700"
              >
                Email address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@university.edu"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="h-12 rounded-xl border-gray-300 pl-11 text-gray-900 focus:border-cyan-500 focus:ring-cyan-500"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="password"
                  className="text-sm font-medium text-gray-700"
                >
                  Password
                </Label>
                <Link
                  href="/forgot-password"
                  className="text-sm font-medium text-cyan-600 hover:text-cyan-500"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="h-12 rounded-xl border-gray-300 pl-11 text-gray-900 focus:border-cyan-500 focus:ring-cyan-500"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="h-12 w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-base font-semibold text-white shadow-lg shadow-cyan-500/30 transition-all hover:shadow-xl hover:shadow-cyan-500/40 disabled:opacity-50"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Signing in...
                </span>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-gray-300"></div>
            <span className="text-sm text-gray-500">or</span>
            <div className="h-px flex-1 bg-gray-300"></div>
          </div>

          {/* Sign Up Link */}
          <p className="text-center text-sm text-gray-600">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-semibold text-cyan-600 hover:text-cyan-500"
            >
              Sign up for free
            </Link>
          </p>
        </div>
      </div>

      {/* Right Side - Hero Image */}
      <div className="hidden lg:flex lg:w-1/2 lg:flex-col lg:justify-center lg:bg-gradient-to-br lg:from-cyan-500 lg:via-blue-500 lg:to-purple-500 lg:p-20">
        <div className="text-white">
          <h2 className="mb-6 text-4xl font-bold leading-tight">
            Connect with students
            <br />
            from around the world
          </h2>
          <p className="mb-8 text-lg text-cyan-100">
            Join thousands of students already networking, sharing experiences,
            and building meaningful connections on UniConnect.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8">
            <div>
              <div className="mb-1 text-3xl font-bold">10K+</div>
              <div className="text-sm text-cyan-100">Active Students</div>
            </div>
            <div>
              <div className="mb-1 text-3xl font-bold">50+</div>
              <div className="text-sm text-cyan-100">Universities</div>
            </div>
            <div>
              <div className="mb-1 text-3xl font-bold">100K+</div>
              <div className="text-sm text-cyan-100">Connections</div>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="mt-12 grid grid-cols-2 gap-4">
            <div className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
              <div className="mb-2 flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-white/20"></div>
                <div>
                  <div className="mb-1 h-2 w-20 rounded bg-white/30"></div>
                  <div className="h-1.5 w-16 rounded bg-white/20"></div>
                </div>
              </div>
              <div className="h-2 w-full rounded bg-white/20"></div>
              <div className="mt-1 h-2 w-4/5 rounded bg-white/20"></div>
            </div>
            <div className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
              <div className="mb-2 flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-white/20"></div>
                <div>
                  <div className="mb-1 h-2 w-20 rounded bg-white/30"></div>
                  <div className="h-1.5 w-16 rounded bg-white/20"></div>
                </div>
              </div>
              <div className="h-2 w-full rounded bg-white/20"></div>
              <div className="mt-1 h-2 w-3/5 rounded bg-white/20"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
