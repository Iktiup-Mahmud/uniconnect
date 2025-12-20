"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  BookOpen,
  Users,
  ArrowLeft,
  Search,
  UserPlus,
  Calendar,
} from "lucide-react";
import { Course } from "@/types";
import { api } from "@/lib/api";
import { toast } from "sonner";

export default function CoursesPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSemester, setSelectedSemester] = useState<string>("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    fetchCourses();
  }, [router, selectedSemester]);

  const fetchCourses = async () => {
    try {
      const params: any = {};
      if (selectedSemester) params.semester = selectedSemester;
      const response = await api.getCourses(params);
      if (response.success && response.data) {
        setCourses(response.data.courses || []);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to load courses");
    }
  };

  const handleEnroll = async (courseId: string) => {
    setIsLoading(true);
    try {
      const response = await api.enrollInCourse(courseId);
      if (response.success) {
        toast.success("Enrolled in course successfully");
        fetchCourses();
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to enroll in course");
    } finally {
      setIsLoading(false);
    }
  };

  const isEnrolled = (course: Course) => {
    const userData = localStorage.getItem("user");
    if (!userData) return false;
    const user = JSON.parse(userData);
    return course.students?.some(
      (s: any) =>
        (typeof s === "object" ? s._id : s) === user._id ||
        (typeof s === "object" ? s._id : s) === user.id
    );
  };

  const filteredCourses = courses.filter(
    (course) =>
      course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const semesters = ["Fall", "Spring", "Summer"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard")}
            className="mb-4 rounded-xl border-gray-300 bg-white hover:bg-gray-50 text-gray-700 shadow-sm"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold mb-4 text-gray-900">Courses</h1>
        </div>

        {/* Search and Filter */}
        <div className="mb-6 flex gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 rounded-xl border-gray-300 focus:border-cyan-500 focus:ring-cyan-500"
              />
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={selectedSemester === "" ? "default" : "outline"}
              onClick={() => setSelectedSemester("")}
              size="sm"
              className={selectedSemester === "" ? "rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/30" : "rounded-xl border-gray-300"}
            >
              All
            </Button>
            {semesters.map((sem) => (
              <Button
                key={sem}
                variant={selectedSemester === sem ? "default" : "outline"}
                onClick={() => setSelectedSemester(sem)}
                size="sm"
                className={selectedSemester === sem ? "rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/30" : "rounded-xl border-gray-300"}
              >
                {sem}
              </Button>
            ))}
          </div>
        </div>

        {/* Courses Grid */}
        {courses.length === 0 ? (
          <Card className="rounded-2xl border border-gray-200 bg-white shadow-sm">
            <CardContent className="py-8 text-center text-gray-500">
              No courses found. Check back later!
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => {
              const enrolled = isEnrolled(course);
              return (
                <Card key={course._id} className="rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <CardTitle className="text-xl">{course.code}</CardTitle>
                        <p className="text-lg font-semibold mt-1">{course.name}</p>
                      </div>
                      <Badge className="rounded-lg">{course.semester}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {course.description || "No description available"}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>
                          {course.students?.length || 0} student
                          {(course.students?.length || 0) !== 1 ? "s" : ""}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{course.year}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mb-4">
                      <Avatar className="h-6 w-6">
                        <AvatarImage
                          src={
                            typeof course.instructor === "object"
                              ? course.instructor.avatar
                              : ""
                          }
                        />
                        <AvatarFallback>
                          {typeof course.instructor === "object"
                            ? course.instructor.name?.charAt(0).toUpperCase()
                            : "I"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-gray-600">
                        {typeof course.instructor === "object"
                          ? course.instructor.name
                          : "Instructor"}
                      </span>
                    </div>
                    {enrolled ? (
                      <Badge variant="outline" className="w-full justify-center py-2 rounded-xl">
                        Enrolled
                      </Badge>
                    ) : (
                      <Button
                        onClick={() => handleEnroll(course._id)}
                        disabled={isLoading}
                        className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/30 hover:shadow-xl hover:shadow-cyan-500/40 disabled:opacity-50"
                      >
                        <UserPlus className="mr-2 h-4 w-4" />
                        Enroll
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
