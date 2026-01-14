"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Users,
  ArrowLeft,
  Search,
  UserPlus,
  UserMinus,
  BookOpen,
  Sparkles,
  Heart,
} from "lucide-react";
import { Club } from "@/types";
import { api } from "@/lib/api";
import { toast } from "sonner";

export default function ClubsPage() {
  const router = useRouter();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    fetchClubs();
  }, [router, selectedCategory]);

  const fetchClubs = async () => {
    try {
      const params: any = {};
      if (selectedCategory) params.category = selectedCategory;
      const response = await api.getClubs(params);
      if (response.success && response.data) {
        setClubs(response.data.clubs || []);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to load clubs");
    }
  };

  const handleJoinClub = async (clubId: string) => {
    setIsLoading(true);
    try {
      const response = await api.joinClub(clubId);
      if (response.success) {
        toast.success("🎉 Joined club successfully!");
        fetchClubs();
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to join club");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLeaveClub = async (clubId: string) => {
    setIsLoading(true);
    try {
      const response = await api.leaveClub(clubId);
      if (response.success) {
        toast.success("Left club successfully");
        fetchClubs();
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to leave club");
    } finally {
      setIsLoading(false);
    }
  };

  const isMember = (club: Club) => {
    const userData = localStorage.getItem("user");
    if (!userData) return false;
    const user = JSON.parse(userData);
    return club.members?.some(
      (m: any) =>
        (typeof m === "object" ? m._id : m) === user._id ||
        (typeof m === "object" ? m._id : m) === user.id
    );
  };

  const filteredClubs = clubs.filter(
    (club) =>
      club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      club.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      club.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categories = ["Technology", "Arts", "Sports", "Academic", "Volunteer"];

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
              <Heart className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="bg-gradient-to-r from-sky-600 via-blue-700 to-blue-900 bg-clip-text text-4xl font-black text-transparent">
                Discover Clubs
              </h1>
              <p className="mt-1 font-medium text-gray-800">Join communities that match your interests</p>
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
                placeholder="Search clubs by name or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-14 rounded-2xl border-2 border-gray-300 bg-white pl-12 pr-4 text-base font-medium text-gray-900 shadow-lg backdrop-blur-xl transition-all placeholder:text-gray-500 focus:border-blue-600 focus:bg-white focus:shadow-xl focus:ring-4 focus:ring-blue-100"
              />
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === "" ? "default" : "outline"}
              onClick={() => setSelectedCategory("")}
              className={`h-14 rounded-2xl px-6 font-bold shadow-lg transition-all hover:scale-105 hover:shadow-xl ${
                selectedCategory === ""
                  ? "bg-gradient-to-r from-sky-500 via-blue-600 to-blue-800 text-white"
                  : "border-2 border-gray-300 bg-white text-gray-800 hover:bg-gray-50"
              }`}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              All
            </Button>
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? "default" : "outline"}
                onClick={() => setSelectedCategory(cat)}
                className={`h-14 rounded-2xl px-6 font-bold shadow-lg transition-all hover:scale-105 hover:shadow-xl ${
                  selectedCategory === cat
                    ? "bg-gradient-to-r from-sky-500 via-blue-600 to-blue-800 text-white"
                    : "border-2 border-gray-300 bg-white text-gray-800 hover:bg-gray-50"
                }`}
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>

        {/* Clubs Grid */}
        {clubs.length === 0 ? (
          <Card className="group relative overflow-hidden rounded-3xl border-2 border-dashed border-gray-400 bg-white shadow-xl">
            <CardContent className="flex min-h-[300px] flex-col items-center justify-center py-16 text-center">
              <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-sky-100 to-blue-200">
                <Heart className="h-12 w-12 text-blue-700" />
              </div>
              <h3 className="mb-2 text-2xl font-bold text-gray-900">No clubs found</h3>
              <p className="font-medium text-gray-700">Check back later for amazing clubs!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {filteredClubs.map((club) => {
              const member = isMember(club);
              return (
                <Card
                  key={club._id}
                  className="group relative overflow-hidden rounded-3xl border-2 border-gray-300 bg-white shadow-xl backdrop-blur-xl transition-all hover:-translate-y-2 hover:shadow-2xl"
                >
                  {/* Gradient Overlay */}
                  <div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-br from-sky-500/10 via-blue-600/10 to-blue-800/10 opacity-0 transition-opacity group-hover:opacity-100"></div>
                  
                  {/* Image */}
                  {club.imageUrl && (
                    <div className="relative h-48 overflow-hidden rounded-t-3xl">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                      <img
                        src={club.imageUrl}
                        alt={club.name}
                        className="h-full w-full object-cover transition-transform group-hover:scale-110"
                      />
                      {member && (
                        <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-gradient-to-r from-sky-500 via-blue-600 to-blue-800 px-3 py-1 text-xs font-bold text-white shadow-lg">
                          <Sparkles className="h-3 w-3" />
                          Member
                        </div>
                      )}
                    </div>
                  )}

                  <CardHeader className="relative pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <Badge className="mb-3 rounded-xl bg-gradient-to-r from-sky-500 via-blue-600 to-blue-800 px-3 py-1 text-xs font-bold text-white shadow-md">
                          {club.category}
                        </Badge>
                        <CardTitle className="text-xl font-bold text-gray-900 transition-colors group-hover:bg-gradient-to-r group-hover:from-sky-600 group-hover:to-blue-800 group-hover:bg-clip-text group-hover:text-transparent">
                          {club.name}
                        </CardTitle>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="relative space-y-4">
                    <p className="line-clamp-3 text-sm font-medium text-gray-700">
                      {club.description || "No description available"}
                    </p>

                    <div className="flex items-center gap-2 text-sm text-gray-800">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-sky-100 to-blue-200">
                        <Users className="h-4 w-4 text-blue-700" />
                      </div>
                      <span className="font-bold">
                        {club.members?.length || 0} members
                      </span>
                    </div>

                    <div className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-gray-50 to-blue-50 p-3">
                      <Avatar className="h-10 w-10 border-2 border-white shadow-md">
                        <AvatarImage
                          src={
                            typeof club.organizer === "object"
                              ? club.organizer.avatar
                              : ""
                          }
                        />
                        <AvatarFallback className="bg-gradient-to-br from-sky-500 to-blue-700 text-sm font-bold text-white">
                          {typeof club.organizer === "object"
                            ? club.organizer.name?.charAt(0).toUpperCase()
                            : "O"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-xs font-semibold text-gray-600">Organizer</p>
                        <p className="font-bold text-gray-900">
                          {typeof club.organizer === "object"
                            ? club.organizer.name
                            : "Organizer"}
                        </p>
                      </div>
                    </div>

                    {member ? (
                      <div className="flex flex-col gap-2">
                        <Button
                          onClick={() => router.push(`/clubs/${club._id}`)}
                          className="group/btn relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-sky-500 via-blue-600 to-blue-800 py-6 font-bold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-900 opacity-0 transition-opacity group-hover/btn:opacity-100"></div>
                          <span className="relative flex items-center justify-center gap-2">
                            <BookOpen className="h-5 w-5" />
                            View Club
                          </span>
                        </Button>
                        <Button
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLeaveClub(club._id);
                          }}
                          disabled={isLoading}
                          className="w-full rounded-2xl border-2 border-gray-300 bg-white py-6 font-bold text-gray-800 backdrop-blur-xl transition-all hover:scale-105 hover:bg-gray-50 hover:shadow-lg"
                        >
                          <UserMinus className="mr-2 h-4 w-4" />
                          Leave Club
                        </Button>
                      </div>
                    ) : (
                      <Button
                        onClick={() => handleJoinClub(club._id)}
                        disabled={isLoading || !club.isActive}
                        className="group/btn relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-sky-500 via-blue-600 to-blue-800 py-6 font-bold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl disabled:opacity-50"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-900 opacity-0 transition-opacity group-hover/btn:opacity-100"></div>
                        <span className="relative flex items-center justify-center gap-2">
                          <UserPlus className="h-5 w-5" />
                          Join Club
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
