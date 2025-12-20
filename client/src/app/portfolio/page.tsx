"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  ArrowLeft,
  Plus,
  ExternalLink,
  Edit,
  Trash2,
  Award,
  Briefcase,
  Code,
  Globe,
  Github,
  Linkedin,
  Mail,
  CheckCircle,
  Star,
} from "lucide-react";
import { api } from "@/lib/api";
import { User } from "@/types";
import { toast } from "sonner";

interface Portfolio {
  _id: string;
  userId: string | User;
  title: string;
  description: string;
  skills: string[];
  projects: Project[];
  experience: Experience[];
  education: Education[];
  certifications: Certification[];
  links: {
    github?: string;
    linkedin?: string;
    website?: string;
    email?: string;
  };
  isVerified: boolean;
  createdAt: string;
}

interface Project {
  _id?: string;
  title: string;
  description: string;
  technologies: string[];
  link?: string;
  image?: string;
  startDate: string;
  endDate?: string;
}

interface Experience {
  _id?: string;
  company: string;
  position: string;
  description: string;
  startDate: string;
  endDate?: string;
  current: boolean;
}

interface Education {
  _id?: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate?: string;
  current: boolean;
}

interface Certification {
  _id?: string;
  name: string;
  issuer: string;
  date: string;
  credentialId?: string;
  link?: string;
}

export default function PortfolioPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId");

  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  // Dialog states
  const [showProjectDialog, setShowProjectDialog] = useState(false);
  const [showExperienceDialog, setShowExperienceDialog] = useState(false);
  const [showEducationDialog, setShowEducationDialog] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token) {
      router.push("/login");
      return;
    }

    if (userData) {
      const parsedUser = JSON.parse(userData);
      setCurrentUser(parsedUser);
      
      // If no userId param, show current user's portfolio
      const targetUserId = userId || parsedUser._id;
      setIsOwner(!userId || userId === parsedUser._id);
      
      fetchPortfolio(targetUserId);
    }
  }, [router, userId]);

  const fetchPortfolio = async (targetUserId: string) => {
    setIsLoading(true);
    try {
      // Fetch portfolio for the user
      // Note: You'll need to implement this endpoint
      // const response = await api.getPortfolio(targetUserId);
      
      // Mock data for now
      const mockPortfolio: Portfolio = {
        _id: "1",
        userId: targetUserId,
        title: "Full Stack Developer & UI/UX Designer",
        description: "Passionate about creating beautiful and functional web applications. 3+ years of experience in React, Node.js, and modern web technologies.",
        skills: ["React", "Node.js", "TypeScript", "Python", "MongoDB", "AWS", "UI/UX Design", "Figma"],
        projects: [
          {
            _id: "p1",
            title: "UniConnect Platform",
            description: "A comprehensive university social platform connecting students, clubs, and events.",
            technologies: ["Next.js", "Express", "MongoDB", "Socket.io", "Tailwind CSS"],
            link: "https://uniconnect.example.com",
            startDate: "2024-01-01",
            endDate: "2024-12-01",
          },
          {
            _id: "p2",
            title: "E-Commerce Dashboard",
            description: "Real-time analytics dashboard for e-commerce businesses.",
            technologies: ["React", "Node.js", "PostgreSQL", "Chart.js"],
            link: "https://ecommerce-dash.example.com",
            startDate: "2023-06-01",
            endDate: "2023-12-01",
          },
        ],
        experience: [
          {
            _id: "e1",
            company: "Tech Innovations Inc",
            position: "Senior Full Stack Developer",
            description: "Led development of multiple client projects, mentored junior developers, and implemented CI/CD pipelines.",
            startDate: "2022-01-01",
            current: true,
          },
          {
            _id: "e2",
            company: "StartupXYZ",
            position: "Frontend Developer",
            description: "Built responsive web applications using React and modern JavaScript.",
            startDate: "2021-01-01",
            endDate: "2021-12-01",
            current: false,
          },
        ],
        education: [
          {
            _id: "ed1",
            institution: "State University",
            degree: "Bachelor of Science",
            field: "Computer Science",
            startDate: "2017-09-01",
            endDate: "2021-05-01",
            current: false,
          },
        ],
        certifications: [
          {
            _id: "c1",
            name: "AWS Certified Solutions Architect",
            issuer: "Amazon Web Services",
            date: "2023-03-15",
            credentialId: "ABC123XYZ",
          },
          {
            _id: "c2",
            name: "Professional Scrum Master I",
            issuer: "Scrum.org",
            date: "2022-08-20",
          },
        ],
        links: {
          github: "https://github.com/johndoe",
          linkedin: "https://linkedin.com/in/johndoe",
          website: "https://johndoe.dev",
          email: "john@example.com",
        },
        isVerified: true,
        createdAt: new Date().toISOString(),
      };
      
      setPortfolio(mockPortfolio);
    } catch (error) {
      console.error("Error fetching portfolio:", error);
      toast.error("Failed to load portfolio");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", { month: "short", year: "numeric" });
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-16 w-16 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent mx-auto"></div>
          <p className="text-gray-600">Loading portfolio...</p>
        </div>
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-purple-50 p-8">
        <div className="mx-auto max-w-4xl text-center">
          <Briefcase className="mx-auto mb-4 h-20 w-20 text-gray-300" />
          <h2 className="mb-2 text-2xl font-bold text-gray-900">No Portfolio Yet</h2>
          <p className="mb-6 text-gray-600">
            {isOwner ? "Create your portfolio to showcase your skills and projects." : "This user hasn't created a portfolio yet."}
          </p>
          {isOwner && (
            <Button
              onClick={() => setIsEditing(true)}
              className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 px-6 py-3 font-semibold text-white hover:shadow-lg"
            >
              <Plus className="mr-2 h-5 w-5" />
              Create Portfolio
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-purple-50">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-gray-200 bg-white/80 backdrop-blur-md shadow-sm">
        <div className="mx-auto max-w-6xl px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.back()}
                className="rounded-xl text-cyan-600 hover:bg-cyan-50"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Portfolio</h1>
                <p className="text-sm text-gray-600">Professional showcase</p>
              </div>
            </div>
            {isOwner && (
              <Button
                onClick={() => setIsEditing(!isEditing)}
                className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 font-semibold text-white hover:shadow-lg"
              >
                {isEditing ? "View Mode" : <><Edit className="mr-2 h-4 w-4" />Edit Portfolio</>}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="space-y-6">
          {/* Hero Section */}
          <Card className="border-0 bg-gradient-to-r from-cyan-500 to-blue-600 shadow-2xl">
            <CardContent className="p-8 text-white">
              <div className="flex flex-col items-center gap-4 md:flex-row">
                <Avatar className="h-32 w-32 border-4 border-white shadow-xl">
                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-4xl font-bold">
                    {currentUser?.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-center md:text-left">
                  <div className="mb-2 flex items-center gap-2 justify-center md:justify-start">
                    <h2 className="text-3xl font-bold">{currentUser?.name || "User"}</h2>
                    {portfolio.isVerified && (
                      <CheckCircle className="h-6 w-6 text-yellow-300" title="Verified" />
                    )}
                  </div>
                  <p className="mb-3 text-xl text-cyan-50">{portfolio.title}</p>
                  <p className="mb-4 text-cyan-100">{portfolio.description}</p>
                  <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                    {portfolio.links.github && (
                      <a
                        href={portfolio.links.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 rounded-lg bg-white/20 px-3 py-1 backdrop-blur-sm hover:bg-white/30"
                      >
                        <Github className="h-4 w-4" />
                        <span className="text-sm">GitHub</span>
                      </a>
                    )}
                    {portfolio.links.linkedin && (
                      <a
                        href={portfolio.links.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 rounded-lg bg-white/20 px-3 py-1 backdrop-blur-sm hover:bg-white/30"
                      >
                        <Linkedin className="h-4 w-4" />
                        <span className="text-sm">LinkedIn</span>
                      </a>
                    )}
                    {portfolio.links.website && (
                      <a
                        href={portfolio.links.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 rounded-lg bg-white/20 px-3 py-1 backdrop-blur-sm hover:bg-white/30"
                      >
                        <Globe className="h-4 w-4" />
                        <span className="text-sm">Website</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Skills */}
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">Skills & Expertise</h3>
                {isOwner && isEditing && (
                  <Button size="sm" variant="outline" className="rounded-lg">
                    <Plus className="mr-1 h-4 w-4" />
                    Add Skill
                  </Button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {portfolio.skills.map((skill, idx) => (
                  <Badge
                    key={idx}
                    className="rounded-lg bg-gradient-to-r from-cyan-100 to-blue-100 px-3 py-1 text-sm font-semibold text-cyan-700"
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Projects */}
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Code className="h-5 w-5 text-cyan-600" />
                  <h3 className="text-xl font-bold text-gray-900">Projects</h3>
                </div>
                {isOwner && isEditing && (
                  <Button
                    size="sm"
                    onClick={() => setShowProjectDialog(true)}
                    className="rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white"
                  >
                    <Plus className="mr-1 h-4 w-4" />
                    Add Project
                  </Button>
                )}
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {portfolio.projects.map((project) => (
                  <Card key={project._id} className="border border-gray-200">
                    <CardContent className="p-4">
                      <div className="mb-2 flex items-start justify-between">
                        <h4 className="text-lg font-bold text-gray-900">{project.title}</h4>
                        {project.link && (
                          <a
                            href={project.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-cyan-600 hover:text-cyan-700"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                      <p className="mb-3 text-sm text-gray-600">{project.description}</p>
                      <div className="mb-3 flex flex-wrap gap-1">
                        {project.technologies.map((tech, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500">
                        {formatDate(project.startDate)} - {project.endDate ? formatDate(project.endDate) : "Present"}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Experience */}
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-purple-600" />
                  <h3 className="text-xl font-bold text-gray-900">Work Experience</h3>
                </div>
                {isOwner && isEditing && (
                  <Button
                    size="sm"
                    onClick={() => setShowExperienceDialog(true)}
                    className="rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                  >
                    <Plus className="mr-1 h-4 w-4" />
                    Add Experience
                  </Button>
                )}
              </div>
              <div className="space-y-4">
                {portfolio.experience.map((exp) => (
                  <div key={exp._id} className="border-l-4 border-purple-500 pl-4">
                    <h4 className="text-lg font-bold text-gray-900">{exp.position}</h4>
                    <p className="text-sm font-semibold text-purple-600">{exp.company}</p>
                    <p className="mb-2 text-sm text-gray-600">{exp.description}</p>
                    <p className="text-xs text-gray-500">
                      {formatDate(exp.startDate)} - {exp.current ? "Present" : exp.endDate ? formatDate(exp.endDate) : ""}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Education */}
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-blue-600" />
                  <h3 className="text-xl font-bold text-gray-900">Education</h3>
                </div>
                {isOwner && isEditing && (
                  <Button
                    size="sm"
                    onClick={() => setShowEducationDialog(true)}
                    className="rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
                  >
                    <Plus className="mr-1 h-4 w-4" />
                    Add Education
                  </Button>
                )}
              </div>
              <div className="space-y-4">
                {portfolio.education.map((edu) => (
                  <div key={edu._id} className="border-l-4 border-blue-500 pl-4">
                    <h4 className="text-lg font-bold text-gray-900">{edu.degree}</h4>
                    <p className="text-sm font-semibold text-blue-600">{edu.institution}</p>
                    <p className="mb-2 text-sm text-gray-600">Field: {edu.field}</p>
                    <p className="text-xs text-gray-500">
                      {formatDate(edu.startDate)} - {edu.current ? "Present" : edu.endDate ? formatDate(edu.endDate) : ""}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Certifications */}
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-600" />
                  <h3 className="text-xl font-bold text-gray-900">Certifications</h3>
                </div>
                {isOwner && isEditing && (
                  <Button size="sm" variant="outline" className="rounded-lg">
                    <Plus className="mr-1 h-4 w-4" />
                    Add Certification
                  </Button>
                )}
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {portfolio.certifications.map((cert) => (
                  <Card key={cert._id} className="border border-gray-200">
                    <CardContent className="p-4">
                      <h4 className="text-lg font-bold text-gray-900">{cert.name}</h4>
                      <p className="text-sm font-semibold text-yellow-600">{cert.issuer}</p>
                      <p className="text-xs text-gray-500">Issued: {formatDate(cert.date)}</p>
                      {cert.credentialId && (
                        <p className="text-xs text-gray-500">Credential ID: {cert.credentialId}</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

