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
  Calendar,
  ArrowLeft,
  Search,
  UserPlus,
  UserMinus,
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
        toast.success("Joined club successfully");
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

  const filteredClubs = clubs.filter((club) =>
    club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    club.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categories = [
    "Academic",
    "Sports",
    "Arts",
    "Technology",
    "Cultural",
    "Social",
    "Volunteer",
    "Other",
  ];

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
          <h1 className="text-3xl font-bold mb-4 text-gray-900">Clubs</h1>
        </div>

        {/* Search and Filter */}
        <div className="mb-6 flex gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search clubs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 rounded-xl border-gray-300 focus:border-cyan-500 focus:ring-cyan-500"
              />
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={selectedCategory === "" ? "default" : "outline"}
              onClick={() => setSelectedCategory("")}
              size="sm"
              className={selectedCategory === "" ? "rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/30" : "rounded-xl border-gray-300"}
            >
              All
            </Button>
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? "default" : "outline"}
                onClick={() => setSelectedCategory(cat)}
                size="sm"
                className={selectedCategory === cat ? "rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/30" : "rounded-xl border-gray-300"}
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>

        {/* Clubs Grid */}
        {clubs.length === 0 ? (
          <Card className="rounded-2xl border border-gray-200 bg-white shadow-sm">
            <CardContent className="py-8 text-center text-gray-500">
              No clubs found. Check back later!
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClubs.map((club) => {
              const member = isMember(club);
              return (
                <Card
                  key={club._id}
                  className="rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-lg transition-shadow"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <CardTitle className="text-xl text-black">
                        {club.name}
                      </CardTitle>
                      <Badge className="rounded-lg">{club.category}</Badge>
                    </div>
                    {club.imageUrl && (
                      <img
                        src={club.imageUrl}
                        alt={club.name}
                        className="w-full h-32 object-cover text-black rounded-xl mb-2"
                      />
                    )}
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {club.description || "No description available"}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>
                          {club.members?.length || 0} member
                          {(club.members?.length || 0) !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mb-4">
                      <Avatar className="h-6 w-6">
                        <AvatarImage
                          src={
                            typeof club.organizer === "object"
                              ? club.organizer.avatar
                              : ""
                          }
                        />
                        <AvatarFallback>
                          {typeof club.organizer === "object"
                            ? club.organizer.name?.charAt(0).toUpperCase()
                            : "O"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-gray-600">
                        {typeof club.organizer === "object"
                          ? club.organizer.name
                          : "Organizer"}
                      </span>
                    </div>
                    {member ? (
                      <Button
                        variant="outline"
                        onClick={() => handleLeaveClub(club._id)}
                        disabled={isLoading}
                        className="w-full rounded-xl border-gray-300 hover:bg-gray-50"
                      >
                        <UserMinus className="mr-2 h-4 w-4" />
                        Leave Club
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handleJoinClub(club._id)}
                        disabled={isLoading || !club.isActive}
                        className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/30 hover:shadow-xl hover:shadow-cyan-500/40 disabled:opacity-50"
                      >
                        <UserPlus className="mr-2 h-4 w-4" />
                        Join Club
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
