"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  UserPlus,
  UserMinus,
  Share2,
  Clock,
} from "lucide-react";
import { api } from "@/lib/api";
import { Event, User } from "@/types";

export default function EventDetailPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.eventId as string;

  const [event, setEvent] = useState<Event | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAttending, setIsAttending] = useState(false);
  const [isOrganizer, setIsOrganizer] = useState(false);
  const [rsvping, setRsvping] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
    }
    fetchEvent();
  }, [eventId]);

  const fetchEvent = async () => {
    try {
      const response = await api.getEventById(eventId);
      if (response.success && response.data) {
        setEvent(response.data.event);
        checkAttendance(response.data.event);
      }
    } catch (error) {
      console.error("Error fetching event:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkAttendance = (eventData: Event) => {
    if (!user) return;

    const attending = eventData.attendees?.some(
      (attendee) =>
        (typeof attendee === "object" ? attendee._id : attendee) === user._id
    );
    setIsAttending(attending || false);

    const organizer =
      typeof eventData.organizer === "object"
        ? eventData.organizer._id
        : eventData.organizer;
    setIsOrganizer(organizer === user._id);
  };

  const handleRSVP = async () => {
    if (rsvping || !event) return;
    setRsvping(true);

    try {
      if (isAttending) {
        const response = await api.cancelRsvp(eventId);
        if (response.success) {
          await fetchEvent();
        }
      } else {
        const response = await api.rsvpEvent(eventId);
        if (response.success) {
          await fetchEvent();
        }
      }
    } catch (error: any) {
      alert(error.message || "Failed to update RSVP");
    } finally {
      setRsvping(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      time: date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  };

  const isEventPast = (dateString: string) => {
    return new Date(dateString) < new Date();
  };

  const isFull = () => {
    if (!event || !event.maxAttendees) return false;
    return (event.attendees?.length || 0) >= event.maxAttendees;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-lg">Loading event...</div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-lg">Event not found</div>
          <Button onClick={() => router.push("/events")}>Back to Events</Button>
        </div>
      </div>
    );
  }

  const eventDateTime = formatDate(event.eventDate);
  const isPast = isEventPast(event.eventDate);
  const isEventFull = isFull();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-5xl px-4 py-8">
        {/* Header */}
        <div className="mb-6 flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/events")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Events
          </Button>
        </div>

        {/* Event Header Card */}
        <Card className="mb-6">
          <CardHeader>
            {event.imageUrl && (
              <img
                src={event.imageUrl}
                alt={event.title}
                className="mb-6 h-64 w-full rounded-lg object-cover"
              />
            )}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <Badge>{event.category}</Badge>
                  {isPast && <Badge variant="outline">Past Event</Badge>}
                  {isEventFull && !isPast && (
                    <Badge
                      variant="outline"
                      className="border-red-500 text-red-500"
                    >
                      Full
                    </Badge>
                  )}
                  {event.isPublic && <Badge variant="outline">Public</Badge>}
                </div>
                <h1 className="mb-3 text-4xl font-bold">{event.title}</h1>
                <p className="text-lg text-gray-600">{event.description}</p>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Event Details */}
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">Event Details</h2>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar className="mt-1 h-5 w-5 text-blue-600" />
                  <div>
                    <h3 className="font-medium">Date & Time</h3>
                    <p className="text-gray-600">{eventDateTime.date}</p>
                    <p className="text-gray-600">{eventDateTime.time}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="mt-1 h-5 w-5 text-red-600" />
                  <div>
                    <h3 className="font-medium">Location</h3>
                    <p className="text-gray-600">{event.location}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Users className="mt-1 h-5 w-5 text-purple-600" />
                  <div>
                    <h3 className="font-medium">Attendees</h3>
                    <p className="text-gray-600">
                      {event.attendees?.length || 0}
                      {event.maxAttendees
                        ? ` / ${event.maxAttendees}`
                        : ""}{" "}
                      people attending
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Organizer Info */}
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">Organized By</h2>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-purple-500 text-white">
                    {typeof event.organizer === "object"
                      ? event.organizer.name.charAt(0)
                      : "?"}
                  </div>
                  <div>
                    <h3 className="font-medium">
                      {typeof event.organizer === "object"
                        ? event.organizer.name
                        : "Unknown"}
                    </h3>
                    <p className="text-sm text-gray-600">
                      @
                      {typeof event.organizer === "object"
                        ? event.organizer.username
                        : "unknown"}
                    </p>
                  </div>
                </div>
                {event.clubId && (
                  <div className="mt-4">
                    <h3 className="mb-2 text-sm font-medium text-gray-500">
                      Associated Club
                    </h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        router.push(
                          `/clubs/${
                            typeof event.clubId === "object"
                              ? event.clubId._id
                              : event.clubId
                          }`
                        )
                      }
                    >
                      {typeof event.clubId === "object"
                        ? event.clubId.name
                        : "View Club"}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Attendees List */}
            {event.attendees && event.attendees.length > 0 && (
              <Card>
                <CardHeader>
                  <h2 className="text-xl font-semibold">Attendees</h2>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    {event.attendees.slice(0, 10).map((attendee, index) => {
                      const attendeeData =
                        typeof attendee === "object" ? attendee : null;
                      return (
                        <div
                          key={index}
                          className="flex items-center gap-3 rounded-lg border p-3"
                        >
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-blue-500 text-white">
                            {attendeeData?.name.charAt(0) || "?"}
                          </div>
                          <div>
                            <h3 className="font-medium">
                              {attendeeData?.name || "Unknown"}
                            </h3>
                            <p className="text-sm text-gray-600">
                              @{attendeeData?.username || "unknown"}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {event.attendees.length > 10 && (
                    <p className="mt-3 text-center text-sm text-gray-500">
                      +{event.attendees.length - 10} more attendees
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* RSVP Card */}
            {user && !isOrganizer && !isPast && (
              <Card>
                <CardContent className="pt-6">
                  <Button
                    className="w-full"
                    onClick={handleRSVP}
                    disabled={rsvping || (isEventFull && !isAttending)}
                    variant={isAttending ? "outline" : "default"}
                  >
                    {isAttending ? (
                      <>
                        <UserMinus className="mr-2 h-4 w-4" />
                        Cancel RSVP
                      </>
                    ) : (
                      <>
                        <UserPlus className="mr-2 h-4 w-4" />
                        {isEventFull ? "Event Full" : "RSVP"}
                      </>
                    )}
                  </Button>
                  {isAttending && (
                    <p className="mt-2 text-center text-sm text-green-600">
                      ✓ You're attending this event
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {isPast && (
              <Card className="border-gray-300 bg-gray-100">
                <CardContent className="pt-6 text-center">
                  <Clock className="mx-auto mb-2 h-8 w-8 text-gray-500" />
                  <p className="font-medium text-gray-700">
                    This event has ended
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Share Button */}
            <Button variant="outline" className="w-full">
              <Share2 className="mr-2 h-4 w-4" />
              Share Event
            </Button>

            {/* Quick Info */}
            <Card>
              <CardHeader>
                <h3 className="font-semibold">Quick Info</h3>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-600">Category:</span>
                  <p className="font-medium">{event.category}</p>
                </div>
                <div>
                  <span className="text-gray-600">Visibility:</span>
                  <p className="font-medium">
                    {event.isPublic ? "Public Event" : "Private Event"}
                  </p>
                </div>
                {event.maxAttendees && (
                  <div>
                    <span className="text-gray-600">Capacity:</span>
                    <p className="font-medium">{event.maxAttendees} people</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
