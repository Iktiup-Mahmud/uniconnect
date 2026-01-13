"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Users,
  Calendar,
  MapPin,
  UserPlus,
  UserMinus,
  Share2,
} from "lucide-react";
import { api } from "@/lib/api";
import { Club, User, Event } from "@/types";

export default function ClubDetailPage() {
  const router = useRouter();
  const params = useParams();
  const clubId = params.clubId as string;

  const [club, setClub] = useState<Club | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMember, setIsMember] = useState(false);
  const [isOrganizer, setIsOrganizer] = useState(false);
  const [clubEvents, setClubEvents] = useState<Event[]>([]);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
    }
    fetchClub();
    fetchClubEvents();
  }, [clubId]);

  const fetchClub = async () => {
    try {
      const response = await api.getClubById(clubId);
      if (response.success && response.data) {
        setClub(response.data.club);
        checkMembership(response.data.club);
      }
    } catch (error) {
      console.error("Error fetching club:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchClubEvents = async () => {
    try {
      const response = await api.getEvents(`?clubId=${clubId}&upcoming=true`);
      if (response.success && response.data) {
        setClubEvents(response.data.events || []);
      }
    } catch (error) {
      console.error("Error fetching club events:", error);
    }
  };

  const checkMembership = (clubData: Club) => {
    if (!user) return;

    const member = clubData.members.some(
      (member) => (typeof member === "object" ? member._id : member) === user._id
    );
    setIsMember(member);

    const organizer =
      typeof clubData.organizer === "object"
        ? clubData.organizer._id
        : clubData.organizer;
    setIsOrganizer(organizer === user._id);
  };

  const handleJoinLeave = async () => {
    if (joining || !club) return;
    setJoining(true);

    try {
      if (isMember) {
        const response = await api.leaveClub(clubId);
        if (response.success) {
          await fetchClub();
        }
      } else {
        const response = await api.joinClub(clubId);
        if (response.success) {
          await fetchClub();
        }
      }
    } catch (error: any) {
      alert(error.message || "Failed to update membership");
    } finally {
      setJoining(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-lg">Loading club...</div>
        </div>
      </div>
    );
  }

  if (!club) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-lg">Club not found</div>
          <Button onClick={() => router.push("/clubs")}>Back to Clubs</Button>
        </div>
      </div>
    );
  }

  // Only show content if user is a member
  const canViewContent = isMember || isOrganizer || user?.role === "admin";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <div className="mb-6 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push("/clubs")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Clubs
          </Button>
        </div>

        {/* Club Header */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {club.imageUrl && (
                  <img
                    src={club.imageUrl}
                    alt={club.name}
                    className="mb-4 h-48 w-full rounded-lg object-cover"
                  />
                )}
                <div className="mb-2 flex items-center gap-2">
                  <Badge>{club.category}</Badge>
                  {club.isActive && <Badge variant="outline">Active</Badge>}
                </div>
                <h1 className="mb-2 text-3xl font-bold">{club.name}</h1>
                <p className="text-gray-600">{club.description}</p>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>{club.members.length} members</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{clubEvents.length} upcoming events</span>
                </div>
              </div>
              <div className="flex gap-2">
                {user && !isOrganizer && (
                  <Button
                    onClick={handleJoinLeave}
                    disabled={joining}
                    variant={isMember ? "outline" : "default"}
                  >
                    {isMember ? (
                      <>
                        <UserMinus className="mr-2 h-4 w-4" />
                        Leave Club
                      </>
                    ) : (
                      <>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Join Club
                      </>
                    )}
                  </Button>
                )}
                <Button variant="outline" size="icon">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Membership Required Notice */}
        {!canViewContent && (
          <Card className="mb-6 border-yellow-200 bg-yellow-50">
            <CardContent className="pt-6 text-center">
              <p className="text-yellow-800">
                Join this club to see events, updates, and connect with members!
              </p>
            </CardContent>
          </Card>
        )}

        {/* Content Tabs (Only for members) */}
        {canViewContent && (
          <Tabs defaultValue="events" className="space-y-6">
            <TabsList>
              <TabsTrigger value="events">Events</TabsTrigger>
              <TabsTrigger value="members">Members</TabsTrigger>
              <TabsTrigger value="about">About</TabsTrigger>
            </TabsList>

            {/* Events Tab */}
            <TabsContent value="events">
              <Card>
                <CardHeader>
                  <h2 className="text-xl font-semibold">Upcoming Events</h2>
                </CardHeader>
                <CardContent>
                  {clubEvents.length === 0 ? (
                    <p className="text-center text-gray-500">
                      No upcoming events scheduled
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {clubEvents.map((event) => (
                        <Card
                          key={event._id}
                          className="cursor-pointer transition-shadow hover:shadow-md"
                          onClick={() => router.push(`/events/${event._id}`)}
                        >
                          <CardContent className="pt-6">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="mb-2 flex items-center gap-2">
                                  <Badge>{event.category}</Badge>
                                </div>
                                <h3 className="mb-2 text-lg font-semibold">
                                  {event.title}
                                </h3>
                                <p className="mb-3 text-gray-600">
                                  {event.description}
                                </p>
                                <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                                  <div className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    <span>{formatDate(event.eventDate)}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <MapPin className="h-4 w-4" />
                                    <span>{event.location}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Users className="h-4 w-4" />
                                    <span>{event.attendees?.length || 0} attending</span>
                                  </div>
                                </div>
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

            {/* Members Tab */}
            <TabsContent value="members">
              <Card>
                <CardHeader>
                  <h2 className="text-xl font-semibold">Club Members</h2>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                    {club.members.map((member, index) => {
                      const memberData = typeof member === "object" ? member : null;
                      const memberId = typeof member === "object" ? member._id : member;
                      const organizerId =
                        typeof club.organizer === "object"
                          ? club.organizer._id
                          : club.organizer;

                      return (
                        <div
                          key={index}
                          className="flex items-center gap-3 rounded-lg border p-3"
                        >
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-400 to-pink-500 text-white">
                            {memberData?.name.charAt(0) || "?"}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium">
                                {memberData?.name || "Unknown"}
                              </h3>
                              {memberId === organizerId && (
                                <Badge variant="outline" className="text-xs">
                                  Organizer
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">
                              @{memberData?.username || "unknown"}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* About Tab */}
            <TabsContent value="about">
              <Card>
                <CardHeader>
                  <h2 className="text-xl font-semibold">About the Club</h2>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="mb-2 font-semibold">Description</h3>
                    <p className="text-gray-600">{club.description}</p>
                  </div>
                  <div>
                    <h3 className="mb-2 font-semibold">Category</h3>
                    <Badge>{club.category}</Badge>
                  </div>
                  <div>
                    <h3 className="mb-2 font-semibold">Organizer</h3>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-purple-500 text-white">
                        {typeof club.organizer === "object"
                          ? club.organizer.name.charAt(0)
                          : "?"}
                      </div>
                      <div>
                        <p className="font-medium">
                          {typeof club.organizer === "object"
                            ? club.organizer.name
                            : "Unknown"}
                        </p>
                        <p className="text-sm text-gray-600">
                          @
                          {typeof club.organizer === "object"
                            ? club.organizer.username
                            : "unknown"}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
