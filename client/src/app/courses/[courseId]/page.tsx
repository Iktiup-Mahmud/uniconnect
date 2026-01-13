"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  BookOpen,
  Users,
  Calendar,
  FileText,
  Link as LinkIcon,
  Video,
  Download,
  Clock,
} from "lucide-react";
import { api } from "@/lib/api";
import { Course, User } from "@/types";

export default function CourseDetailPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.courseId as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isInstructor, setIsInstructor] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
    }
    fetchCourse();
  }, [courseId]);

  const fetchCourse = async () => {
    try {
      const response = await api.getCourseById(courseId);
      if (response.success && response.data) {
        setCourse(response.data.course);
        checkEnrollment(response.data.course);
      }
    } catch (error: any) {
      console.error("Error fetching course:", error);
      if (error.message?.includes("don't have access")) {
        alert("You don't have access to this course. Please enroll first.");
        router.push("/courses");
      }
    } finally {
      setLoading(false);
    }
  };

  const checkEnrollment = (courseData: Course) => {
    if (!user) return;
    
    const enrolled = courseData.students.some(
      (student) => (typeof student === "object" ? student._id : student) === user._id
    );
    setIsEnrolled(enrolled);

    const instructor = typeof courseData.instructor === "object" 
      ? courseData.instructor._id 
      : courseData.instructor;
    setIsInstructor(instructor === user._id);
  };

  const getMaterialIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video className="h-5 w-5" />;
      case "document":
        return <FileText className="h-5 w-5" />;
      case "link":
        return <LinkIcon className="h-5 w-5" />;
      default:
        return <Download className="h-5 w-5" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-lg">Loading course...</div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-lg">Course not found</div>
          <Button onClick={() => router.push("/courses")}>
            Back to Courses
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <div className="mb-6 flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/courses")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Courses
          </Button>
        </div>

        {/* Course Header */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <Badge variant="outline">{course.code}</Badge>
                  <Badge>
                    {course.semester} {course.year}
                  </Badge>
                </div>
                <h1 className="mb-2 text-3xl font-bold">{course.name}</h1>
                <p className="text-gray-600">{course.description}</p>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                <span>
                  Instructor:{" "}
                  {typeof course.instructor === "object"
                    ? course.instructor.name
                    : "Unknown"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>{course.students.length} students enrolled</span>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="materials" className="space-y-6">
          <TabsList>
            <TabsTrigger value="materials">Materials</TabsTrigger>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
          </TabsList>

          {/* Materials Tab */}
          <TabsContent value="materials">
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">Course Materials</h2>
              </CardHeader>
              <CardContent>
                {course.materials.length === 0 ? (
                  <p className="text-center text-gray-500">
                    No materials available yet
                  </p>
                ) : (
                  <div className="space-y-3">
                    {course.materials.map((material, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between rounded-lg border p-4 hover:bg-gray-50"
                      >
                        <div className="flex items-center gap-3">
                          {getMaterialIcon(material.type)}
                          <div>
                            <h3 className="font-medium">{material.title}</h3>
                            {material.description && (
                              <p className="text-sm text-gray-600">
                                {material.description}
                              </p>
                            )}
                            <p className="text-xs text-gray-400">
                              Uploaded: {formatDate(material.uploadedAt)}
                            </p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => window.open(material.url, "_blank")}
                        >
                          {material.type === "link" ? "Open" : "Download"}
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Assignments Tab */}
          <TabsContent value="assignments">
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">Assignments</h2>
              </CardHeader>
              <CardContent>
                {course.assignments.length === 0 ? (
                  <p className="text-center text-gray-500">
                    No assignments available yet
                  </p>
                ) : (
                  <div className="space-y-4">
                    {course.assignments.map((assignment, index) => (
                      <Card key={index}>
                        <CardContent className="pt-6">
                          <div className="mb-2 flex items-start justify-between">
                            <h3 className="text-lg font-semibold">
                              {assignment.title}
                            </h3>
                            <Badge>{assignment.maxScore} points</Badge>
                          </div>
                          <p className="mb-3 text-gray-600">
                            {assignment.description}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>
                                Due: {formatDate(assignment.dueDate)}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              <span>
                                {assignment.submissions?.length || 0}{" "}
                                submissions
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Students Tab */}
          <TabsContent value="students">
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">Enrolled Students</h2>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {course.students.map((student, index) => {
                    const studentData =
                      typeof student === "object" ? student : null;
                    return (
                      <div
                        key={index}
                        className="flex items-center gap-3 rounded-lg border p-3"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-purple-500 text-white">
                          {studentData?.name.charAt(0) || "?"}
                        </div>
                        <div>
                          <h3 className="font-medium">
                            {studentData?.name || "Unknown"}
                          </h3>
                          <p className="text-sm text-gray-600">
                            @{studentData?.username || "unknown"}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
