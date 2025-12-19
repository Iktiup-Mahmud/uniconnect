"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Calendar,
  MapPin,
  Clock,
  Users,
  Plus,
  Search,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Event, User } from "@/types";
import { api } from "@/lib/api";

export default function EventsPage() {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showUpcoming, setShowUpcoming] = useState(true);

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

    fetchEvents();
  }, [router]);

  const fetchEvents = async () => {
    try {
      const response = await api.getEvents({ upcoming: showUpcoming });
      if (response.success && response.data) {
        setEvents(response.data.events || []);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [showUpcoming]);

  const handleRSVP = async (eventId: string) => {
    try {
      const response = await api.rsvpEvent(eventId);
      if (response.success) {
        await fetchEvents();
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to RSVP";
      alert(errorMessage);
    }
  };

  const handleCancelRSVP = async (eventId: string) => {
    try {
      const response = await api.cancelRsvp(eventId);
      if (response.success) {
        await fetchEvents();
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to cancel RSVP";
      alert(errorMessage);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredEvents = events.filter(
    (event) =>
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent"></div>
          <p className="text-gray-600">Loading events...</p>
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
              Events
            </h1>
            <p className="text-gray-600">Discover and join campus events</p>
          </div>
          <Button
            onClick={() => router.push("/events/create")}
            className="bg-gradient-to-r from-cyan-500 to-blue-500"
          >
            <Plus className="mr-2 h-5 w-5" />
            Create Event
          </Button>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={showUpcoming ? "default" : "outline"}
              onClick={() => setShowUpcoming(true)}
              className={showUpcoming ? "bg-gradient-to-r from-cyan-500 to-blue-500" : ""}
            >
              Upcoming
            </Button>
            <Button
              variant={!showUpcoming ? "default" : "outline"}
              onClick={() => setShowUpcoming(false)}
              className={!showUpcoming ? "bg-gradient-to-r from-cyan-500 to-blue-500" : ""}
            >
              All Events
            </Button>
          </div>
        </div>

        {/* Events Grid */}
        {filteredEvents.length === 0 ? (
          <Card className="border-0 bg-white shadow-lg">
            <CardContent className="py-16 text-center">
              <Calendar className="mx-auto mb-4 h-16 w-16 text-gray-400" />
              <h3 className="mb-2 text-lg font-bold text-gray-900">No events found</h3>
              <p className="text-sm text-gray-600">
                {searchTerm
                  ? "Try adjusting your search terms"
                  : "No events available at the moment"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredEvents.map((event) => {
              const isAttending = event.attendees.some(
                (a) => a._id === user?._id || (typeof a === "string" && a === user?._id)
              );
              const isOrganizer =
                event.organizer._id === user?._id ||
                (typeof event.organizer === "string" && event.organizer === user?._id);
              const isFull = event.maxAttendees
                ? event.attendees.length >= event.maxAttendees
                : false;

              return (
                <Card
                  key={event._id}
                  className="cursor-pointer border-0 bg-white shadow-lg transition-all hover:shadow-xl hover:-translate-y-1"
                  onClick={() => router.push(`/events/${event._id}`)}
                >
                  {event.imageUrl && (
                    <div className="h-48 w-full overflow-hidden rounded-t-lg">
                      <img
                        src={event.imageUrl}
                        alt={event.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-xl text-gray-900">{event.title}</CardTitle>
                      <Badge
                        variant="secondary"
                        className="bg-gradient-to-r from-orange-100 to-red-100 text-orange-700"
                      >
                        {event.category}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {event.description && (
                      <p className="mb-4 line-clamp-2 text-sm text-gray-600">
                        {event.description}
                      </p>
                    )}

                    <div className="mb-4 space-y-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(event.eventDate)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{event.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>
                          {event.attendees.length}
                          {event.maxAttendees ? ` / ${event.maxAttendees}` : ""} attendees
                        </span>
                      </div>
                    </div>

                    <div className="mb-4 flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-gradient-to-br from-purple-400 to-pink-500 text-xs text-white">
                          {typeof event.organizer === "object"
                            ? event.organizer.name.charAt(0)
                            : "O"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-sm">
                        <p className="font-semibold text-gray-900">
                          {typeof event.organizer === "object"
                            ? event.organizer.name
                            : "Organizer"}
                        </p>
                      </div>
                    </div>

                    {isOrganizer ? (
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/events/${event._id}/manage`);
                        }}
                        className="w-full bg-gradient-to-r from-purple-500 to-pink-500"
                      >
                        Manage Event
                      </Button>
                    ) : isAttending ? (
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCancelRSVP(event._id);
                        }}
                        variant="outline"
                        className="w-full"
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Cancel RSVP
                      </Button>
                    ) : (
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!isFull) handleRSVP(event._id);
                        }}
                        disabled={isFull}
                        className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 disabled:opacity-50"
                      >
                        {isFull ? (
                          "Event Full"
                        ) : (
                          <>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            RSVP
                          </>
                        )}
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

