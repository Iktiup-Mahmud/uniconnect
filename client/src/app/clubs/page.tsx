"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Users,
  Plus,
  Search,
  Calendar,
  UserPlus,
  UserMinus,
  Settings,
} from "lucide-react";
import { Club, User } from "@/types";
import { api } from "@/lib/api";

export default function ClubsPage() {
  const router = useRouter();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const categories = [
    "all",
    "Academic",
    "Sports",
    "Arts",
    "Technology",
    "Cultural",
    "Social",
    "Volunteer",
    "Other",
  ];

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

    fetchClubs();
  }, [router]);

  const fetchClubs = async () => {
    try {
      const response = await api.getClubs();
      if (response.success && response.data) {
        setClubs(response.data.clubs || []);
      }
    } catch (error) {
      console.error("Error fetching clubs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoin = async (clubId: string) => {
    try {
      const response = await api.joinClub(clubId);
      if (response.success) {
        await fetchClubs();
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to join club";
      alert(errorMessage);
    }
  };

  const handleLeave = async (clubId: string) => {
    try {
      const response = await api.leaveClub(clubId);
      if (response.success) {
        await fetchClubs();
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to leave club";
      alert(errorMessage);
    }
  };

  const filteredClubs = clubs.filter((club) => {
    const matchesSearch =
      club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      club.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || club.category === selectedCategory;
    return matchesSearch && matchesCategory && club.isActive;
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent"></div>
          <p className="text-gray-600">Loading clubs...</p>
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
              Clubs
            </h1>
            <p className="text-gray-600">Join clubs and connect with like-minded students</p>
          </div>
          {(user?.role === "club_organizer" || user?.role === "admin") && (
            <Button
              onClick={() => router.push("/clubs/create")}
              className="bg-gradient-to-r from-cyan-500 to-blue-500"
            >
              <Plus className="mr-2 h-5 w-5" />
              Create Club
            </Button>
          )}
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search clubs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? "default" : "outline"}
                onClick={() => setSelectedCategory(cat)}
                className={`whitespace-nowrap ${
                  selectedCategory === cat
                    ? "bg-gradient-to-r from-cyan-500 to-blue-500"
                    : ""
                }`}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        {/* Clubs Grid */}
        {filteredClubs.length === 0 ? (
          <Card className="border-0 bg-white shadow-lg">
            <CardContent className="py-16 text-center">
              <Users className="mx-auto mb-4 h-16 w-16 text-gray-400" />
              <h3 className="mb-2 text-lg font-bold text-gray-900">No clubs found</h3>
              <p className="text-sm text-gray-600">
                {searchTerm || selectedCategory !== "all"
                  ? "Try adjusting your filters"
                  : "No clubs available at the moment"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredClubs.map((club) => {
              const isMember = club.members.some(
                (m) => m._id === user?._id || (typeof m === "string" && m === user?._id)
              );
              const isOrganizer =
                club.organizer._id === user?._id ||
                (typeof club.organizer === "string" && club.organizer === user?._id);

              return (
                <Card
                  key={club._id}
                  className="cursor-pointer border-0 bg-white shadow-lg transition-all hover:shadow-xl hover:-translate-y-1"
                  onClick={() => router.push(`/clubs/${club._id}`)}
                >
                  {club.imageUrl && (
                    <div className="h-48 w-full overflow-hidden rounded-t-lg">
                      <img
                        src={club.imageUrl}
                        alt={club.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-xl text-gray-900">{club.name}</CardTitle>
                      <Badge
                        variant="secondary"
                        className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700"
                      >
                        {club.category}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {club.description && (
                      <p className="mb-4 line-clamp-2 text-sm text-gray-600">
                        {club.description}
                      </p>
                    )}

                    <div className="mb-4 flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>{club.members.length} members</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{club.events.length} events</span>
                      </div>
                    </div>

                    <div className="mb-4 flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-gradient-to-br from-cyan-400 to-blue-500 text-xs text-white">
                          {typeof club.organizer === "object"
                            ? club.organizer.name.charAt(0)
                            : "O"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-sm">
                        <p className="font-semibold text-gray-900">
                          {typeof club.organizer === "object"
                            ? club.organizer.name
                            : "Organizer"}
                        </p>
                      </div>
                    </div>

                    {isOrganizer ? (
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/clubs/${club._id}/manage`);
                        }}
                        className="w-full bg-gradient-to-r from-purple-500 to-pink-500"
                      >
                        <Settings className="mr-2 h-4 w-4" />
                        Manage Club
                      </Button>
                    ) : isMember ? (
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLeave(club._id);
                        }}
                        variant="outline"
                        className="w-full"
                      >
                        <UserMinus className="mr-2 h-4 w-4" />
                        Leave Club
                      </Button>
                    ) : (
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleJoin(club._id);
                        }}
                        className="w-full bg-gradient-to-r from-cyan-500 to-blue-500"
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

