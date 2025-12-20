"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Calendar,
  MapPin,
  Users,
  ArrowLeft,
  Search,
  UserPlus,
  UserMinus,
  Clock,
} from "lucide-react";
import { Event } from "@/types";
import { api } from "@/lib/api";
import { toast } from "sonner";

export default function EventsPage() {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [showUpcoming, setShowUpcoming] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    fetchEvents();
  }, [router, selectedCategory, showUpcoming]);

  const fetchEvents = async () => {
    try {
      const params: any = { upcoming: showUpcoming };
      if (selectedCategory) params.category = selectedCategory;
      const response = await api.getEvents(params);
      if (response.success && response.data) {
        setEvents(response.data.events || []);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to load events");
    }
  };

  const handleRsvp = async (eventId: string) => {
    setIsLoading(true);
    try {
      const response = await api.rsvpEvent(eventId);
      if (response.success) {
        toast.success("RSVP successful");
        fetchEvents();
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to RSVP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelRsvp = async (eventId: string) => {
    setIsLoading(true);
    try {
      const response = await api.cancelRsvp(eventId);
      if (response.success) {
        toast.success("RSVP cancelled");
        fetchEvents();
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to cancel RSVP");
    } finally {
      setIsLoading(false);
    }
  };

  const isAttending = (event: Event) => {
    const userData = localStorage.getItem("user");
    if (!userData) return false;
    const user = JSON.parse(userData);
    return event.attendees?.some(
      (a: any) =>
        (typeof a === "object" ? a._id : a) === user._id ||
        (typeof a === "object" ? a._id : a) === user.id
    );
  };

  const filteredEvents = events.filter(
    (event) =>
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categories = [
    "Workshop",
    "Seminar",
    "Conference",
    "Social",
    "Sports",
    "Cultural",
    "Academic",
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
          <h1 className="text-3xl font-bold mb-4 text-gray-900">Events</h1>
        </div>

        {/* Search and Filter */}
        <div className="mb-6 flex gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 rounded-xl border-gray-300 focus:border-cyan-500 focus:ring-cyan-500"
              />
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={showUpcoming ? "default" : "outline"}
              onClick={() => setShowUpcoming(true)}
              size="sm"
              className={showUpcoming ? "rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/30" : "rounded-xl border-gray-300"}
            >
              Upcoming
            </Button>
            <Button
              variant={!showUpcoming ? "default" : "outline"}
              onClick={() => setShowUpcoming(false)}
              size="sm"
              className={!showUpcoming ? "rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/30" : "rounded-xl border-gray-300"}
            >
              All
            </Button>
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? "default" : "outline"}
                onClick={() =>
                  setSelectedCategory(selectedCategory === cat ? "" : cat)
                }
                size="sm"
                className={selectedCategory === cat ? "rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/30" : "rounded-xl border-gray-300"}
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>

        {/* Events Grid */}
        {events.length === 0 ? (
          <Card className="rounded-2xl border border-gray-200 bg-white shadow-sm">
            <CardContent className="py-8 text-center text-gray-500">
              No events found. Check back later!
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => {
              const attending = isAttending(event);
              const eventDate = new Date(event.eventDate);
              const isPast = eventDate < new Date();
              return (
                <Card
                  key={event._id}
                  className={`rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-lg transition-shadow ${
                    isPast ? "opacity-60" : ""
                  }`}
                >
                  <CardHeader>
                    {event.imageUrl && (
                      <img
                        src={event.imageUrl}
                        alt={event.title}
                        className="w-full h-32 object-cover rounded-xl mb-2"
                      />
                    )}
                    <div className="flex items-start justify-between mb-2">
                      <CardTitle className="text-xl">{event.title}</CardTitle>
                      <Badge className="rounded-lg">{event.category}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {event.description || "No description available"}
                    </p>
                    <div className="space-y-2 mb-4 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {eventDate.toLocaleDateString()} at{" "}
                          {eventDate.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="h-4 w-4" />
                        <span>{event.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Users className="h-4 w-4" />
                        <span>
                          {event.attendees?.length || 0} attending
                          {event.maxAttendees
                            ? ` / ${event.maxAttendees} max`
                            : ""}
                        </span>
                      </div>
                    </div>
                    {attending ? (
                      <Button
                        variant="outline"
                        onClick={() => handleCancelRsvp(event._id)}
                        disabled={isLoading || isPast}
                        className="w-full rounded-xl border-gray-300 hover:bg-gray-50"
                      >
                        <UserMinus className="mr-2 h-4 w-4" />
                        Cancel RSVP
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handleRsvp(event._id)}
                        disabled={
                          isLoading ||
                          isPast ||
                          (event.maxAttendees &&
                            (event.attendees?.length || 0) >= event.maxAttendees)
                        }
                        className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/30 hover:shadow-xl hover:shadow-cyan-500/40 disabled:opacity-50"
                      >
                        <UserPlus className="mr-2 h-4 w-4" />
                        RSVP
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
