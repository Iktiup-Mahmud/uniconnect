"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  BookOpen,
  Users,
  Calendar,
  Plus,
  Search,
  GraduationCap,
  FileText,
  Clock,
} from "lucide-react";
import { Course, User } from "@/types";
import { api } from "@/lib/api";

export default function CoursesPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token) {
      router.push("/login");
      return;
    }

    if (userData) {
      setUser(JSON.parse(userData));
    }

    fetchCourses();
  }, [router]);

  const fetchCourses = async () => {
    try {
      const response = await api.getCourses();
      if (response.success && response.data) {
        setCourses(response.data.courses || []);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnroll = async (courseId: string) => {
    try {
      const response = await api.enrollInCourse(courseId);
      if (response.success) {
        await fetchCourses();
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to enroll";
      alert(errorMessage);
    }
  };

  const filteredCourses = courses.filter(
    (course) =>
      course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent"></div>
          <p className="text-gray-600">Loading courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-purple-50 p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-4xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
              Courses
            </h1>
            <p className="text-gray-600">Browse and enroll in courses</p>
          </div>
          {(user?.role === "faculty" || user?.role === "admin") && (
            <Button
              onClick={() => router.push("/courses/create")}
              className="bg-gradient-to-r from-cyan-500 to-blue-500"
            >
              <Plus className="mr-2 h-5 w-5" />
              Create Course
            </Button>
          )}
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Courses Grid */}
        {filteredCourses.length === 0 ? (
          <Card className="border-0 bg-white shadow-lg">
            <CardContent className="py-16 text-center">
              <GraduationCap className="mx-auto mb-4 h-16 w-16 text-gray-400" />
              <h3 className="mb-2 text-lg font-bold text-gray-900">No courses found</h3>
              <p className="text-sm text-gray-600">
                {searchTerm
                  ? "Try adjusting your search terms"
                  : "No courses available at the moment"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredCourses.map((course) => {
              const isEnrolled = course.students.some(
                (s) => s._id === user?._id || (typeof s === "string" && s === user?._id)
              );
              const isInstructor =
                course.instructor._id === user?._id ||
                (typeof course.instructor === "string" && course.instructor === user?._id);

              return (
                <Card
                  key={course._id}
                  className="cursor-pointer border-0 bg-white shadow-lg transition-all hover:shadow-xl hover:-translate-y-1"
                  onClick={() => router.push(`/courses/${course._id}`)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="mb-2 text-xl text-gray-900">
                          {course.code}
                        </CardTitle>
                        <h3 className="mb-3 text-lg font-semibold text-gray-800">
                          {course.name}
                        </h3>
                      </div>
                      <Badge
                        variant="secondary"
                        className="bg-gradient-to-r from-cyan-100 to-blue-100 text-cyan-700"
                      >
                        {course.semester} {course.year}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {course.description && (
                      <p className="mb-4 line-clamp-2 text-sm text-gray-600">
                        {course.description}
                      </p>
                    )}

                    <div className="mb-4 flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>{course.students.length} students</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <span>{course.materials.length} materials</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{course.assignments.length} assignments</span>
                      </div>
                    </div>

                    <div className="mb-4 flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-gradient-to-br from-purple-400 to-pink-500 text-xs text-white">
                          {typeof course.instructor === "object"
                            ? course.instructor.name.charAt(0)
                            : "I"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-sm">
                        <p className="font-semibold text-gray-900">
                          {typeof course.instructor === "object"
                            ? course.instructor.name
                            : "Instructor"}
                        </p>
                      </div>
                    </div>

                    {user?.role === "student" && !isEnrolled && !isInstructor && (
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEnroll(course._id);
                        }}
                        className="w-full bg-gradient-to-r from-cyan-500 to-blue-500"
                      >
                        Enroll Now
                      </Button>
                    )}

                    {(isEnrolled || isInstructor) && (
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/courses/${course._id}`);
                        }}
                        className="w-full bg-gradient-to-r from-purple-500 to-pink-500"
                      >
                        {isInstructor ? "Manage Course" : "View Course"}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

