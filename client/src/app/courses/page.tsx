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
  Sparkles,
  GraduationCap,
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
      console.log("🔄 Fetching courses...");
      const params: any = {};
      if (selectedSemester) params.semester = selectedSemester;
      
      const response = await api.getCourses(params);
      console.log("📦 API Response:", response);
      console.log("✅ Success:", response.success);
      console.log("📊 Data:", response.data);
      console.log("📚 Courses:", response.data?.courses);
      console.log("🔢 Courses length:", response.data?.courses?.length);
      
      if (response.success && response.data) {
        const coursesArray = response.data.courses || [];
        console.log("✨ Setting courses:", coursesArray.length, "courses");
        setCourses(coursesArray);
      } else {
        console.warn("⚠️ Response not successful or no data");
      }
    } catch (error: any) {
      console.error("❌ Error fetching courses:", error);
      toast.error(error.message || "Failed to load courses");
    }
  };

  const handleEnroll = async (courseId: string) => {
    setIsLoading(true);
    try {
      const response = await api.enrollInCourse(courseId);
      if (response.success) {
        toast.success("🎉 Enrolled in course successfully!");
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
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-sky-50 via-blue-50 to-blue-100">
      {/* Animated Background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-80 w-80 animate-pulse rounded-full bg-gradient-to-r from-sky-400 to-blue-500 opacity-20 blur-3xl"></div>
        <div className="absolute -right-40 top-1/3 h-80 w-80 animate-pulse rounded-full bg-gradient-to-r from-blue-500 to-blue-700 opacity-20 blur-3xl delay-1000"></div>
        <div className="absolute bottom-20 left-1/3 h-80 w-80 animate-pulse rounded-full bg-gradient-to-r from-cyan-400 to-blue-600 opacity-20 blur-3xl delay-700"></div>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push("/dashboard")}
            className="group mb-6 rounded-2xl border border-gray-300 bg-white px-6 py-2 shadow-lg backdrop-blur-xl transition-all hover:scale-105 hover:bg-white hover:shadow-xl"
          >
            <ArrowLeft className="mr-2 h-4 w-4 text-gray-800 transition-transform group-hover:-translate-x-1" />
            <span className="font-semibold text-gray-800">Back to Dashboard</span>
          </Button>
          
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 via-blue-600 to-blue-800 shadow-xl">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="bg-gradient-to-r from-sky-600 via-blue-700 to-blue-900 bg-clip-text text-4xl font-black text-transparent">
                Explore Courses
              </h1>
              <p className="mt-1 font-medium text-gray-800">Discover and enroll in amazing courses</p>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="mb-8 flex flex-wrap gap-4">
          <div className="group relative flex-1 min-w-[250px]">
            <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-700 opacity-0 blur transition group-hover:opacity-30"></div>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-600 transition-colors group-hover:text-blue-700" />
              <Input
                placeholder="Search courses by name or code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-14 rounded-2xl border-2 border-gray-300 bg-white pl-12 pr-4 text-base font-medium text-gray-900 shadow-lg backdrop-blur-xl transition-all placeholder:text-gray-500 focus:border-blue-600 focus:bg-white focus:shadow-xl focus:ring-4 focus:ring-blue-100"
              />
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedSemester === "" ? "default" : "outline"}
              onClick={() => setSelectedSemester("")}
              className={`h-14 rounded-2xl px-6 font-bold shadow-lg transition-all hover:scale-105 hover:shadow-xl ${
                selectedSemester === ""
                  ? "bg-gradient-to-r from-sky-500 via-blue-600 to-blue-800 text-white"
                  : "border-2 border-gray-300 bg-white text-gray-800 hover:bg-gray-50"
              }`}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              All
            </Button>
            {semesters.map((sem) => (
              <Button
                key={sem}
                variant={selectedSemester === sem ? "default" : "outline"}
                onClick={() => setSelectedSemester(sem)}
                className={`h-14 rounded-2xl px-6 font-bold shadow-lg transition-all hover:scale-105 hover:shadow-xl ${
                  selectedSemester === sem
                    ? "bg-gradient-to-r from-sky-500 via-blue-600 to-blue-800 text-white"
                    : "border-2 border-gray-300 bg-white text-gray-800 hover:bg-gray-50"
                }`}
              >
                {sem}
              </Button>
            ))}
          </div>
        </div>

        {/* Courses Grid */}
        {courses.length === 0 ? (
          <Card className="group relative overflow-hidden rounded-3xl border-2 border-dashed border-gray-400 bg-white shadow-xl">
            <CardContent className="flex min-h-[300px] flex-col items-center justify-center py-16 text-center">
              <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-sky-100 to-blue-200">
                <BookOpen className="h-12 w-12 text-blue-700" />
              </div>
              <h3 className="mb-2 text-2xl font-bold text-gray-900">No courses found</h3>
              <p className="font-medium text-gray-700">Check back later for amazing courses!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {filteredCourses.map((course) => {
              const enrolled = isEnrolled(course);
              return (
                <Card
                  key={course._id}
                  className="group relative overflow-hidden rounded-3xl border-2 border-gray-300 bg-white shadow-xl backdrop-blur-xl transition-all hover:-translate-y-2 hover:shadow-2xl"
                >
                  {/* Gradient Overlay */}
                  <div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-br from-sky-500/10 via-blue-600/10 to-blue-800/10 opacity-0 transition-opacity group-hover:opacity-100"></div>
                  
                  {/* Status Badge */}
                  {enrolled && (
                    <div className="absolute right-4 top-4 z-10 flex items-center gap-1 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 px-3 py-1 text-xs font-bold text-white shadow-lg">
                      <Sparkles className="h-3 w-3" />
                      Enrolled
                    </div>
                  )}

                  <CardHeader className="relative pb-4">
                    <div className="mb-3 flex items-start justify-between">
                      <div className="flex-1">
                        <Badge className="mb-3 rounded-xl bg-gradient-to-r from-sky-500 via-blue-600 to-blue-800 px-3 py-1 text-xs font-bold text-white shadow-md">
                          {course.code}
                        </Badge>
                        <CardTitle className="text-xl font-bold text-gray-900 transition-colors group-hover:bg-gradient-to-r group-hover:from-sky-600 group-hover:to-blue-800 group-hover:bg-clip-text group-hover:text-transparent">
                          {course.name}
                        </CardTitle>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="relative space-y-4">
                    <p className="line-clamp-3 text-sm font-medium text-gray-700">
                      {course.description || "No description available"}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      <div className="flex items-center gap-2 text-gray-800">
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-sky-100 to-blue-200">
                          <Users className="h-4 w-4 text-blue-700" />
                        </div>
                        <span className="font-bold">
                          {course.students?.length || 0} students
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-800">
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-blue-100 to-blue-200">
                          <Calendar className="h-4 w-4 text-blue-700" />
                        </div>
                        <span className="font-bold">
                          {course.semester} {course.year}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-gray-50 to-blue-50 p-3">
                      <Avatar className="h-10 w-10 border-2 border-white shadow-md">
                        <AvatarImage
                          src={
                            typeof course.instructor === "object"
                              ? course.instructor.avatar
                              : ""
                          }
                        />
                        <AvatarFallback className="bg-gradient-to-br from-sky-500 to-blue-700 text-sm font-bold text-white">
                          {typeof course.instructor === "object"
                            ? course.instructor.name?.charAt(0).toUpperCase()
                            : "I"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-xs font-semibold text-gray-600">Instructor</p>
                        <p className="font-bold text-gray-900">
                          {typeof course.instructor === "object"
                            ? course.instructor.name
                            : "Instructor"}
                        </p>
                      </div>
                    </div>

                    {enrolled ? (
                      <Button
                        onClick={() => router.push(`/courses/${course._id}`)}
                        className="group/btn relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-green-500 via-emerald-600 to-green-700 py-6 font-bold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-700 opacity-0 transition-opacity group-hover/btn:opacity-100"></div>
                        <span className="relative flex items-center justify-center gap-2">
                          <BookOpen className="h-5 w-5" />
                          View Course
                        </span>
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handleEnroll(course._id)}
                        disabled={isLoading}
                        className="group/btn relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-sky-500 via-blue-600 to-blue-800 py-6 font-bold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl disabled:opacity-50"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-900 opacity-0 transition-opacity group-hover/btn:opacity-100"></div>
                        <span className="relative flex items-center justify-center gap-2">
                          <UserPlus className="h-5 w-5" />
                          Enroll Now
                        </span>
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
