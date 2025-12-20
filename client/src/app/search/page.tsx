"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Users,
  FileText,
  Calendar,
  BookOpen,
  Heart,
  MessageCircle,
  MapPin,
  Clock,
  ArrowLeft,
} from "lucide-react";
import { api } from "@/lib/api";
import { Post, User } from "@/types";

interface Club {
  _id: string;
  name: string;
  description: string;
  category: string;
  members: string[];
  coverImage?: string;
}

interface Event {
  _id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  category: string;
  attendees: string[];
  organizer: { name: string; _id: string };
}

interface Course {
  _id: string;
  name: string;
  code: string;
  description: string;
  instructor: { name: string; _id: string };
  students: string[];
  credits: number;
}

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryParam = searchParams.get("q") || "";

  const [query, setQuery] = useState(queryParam);
  const [activeTab, setActiveTab] = useState("all");
  const [isSearching, setIsSearching] = useState(false);

  // Results
  const [users, setUsers] = useState<User[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);

  // Perform search
  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      // Search users
      const usersResponse = await api.getUsers();
      if (usersResponse.success && usersResponse.data) {
        const filtered = usersResponse.data.users.filter(
          (user: User) =>
            user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setUsers(filtered);
      }

      // Search posts
      const postsResponse = await api.getPosts();
      if (postsResponse.success && postsResponse.data) {
        const filtered = postsResponse.data.posts.filter(
          (post: Post) =>
            post.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.author?.name?.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setPosts(filtered);
      }

      // Search clubs
      const clubsResponse = await api.getClubs();
      if (clubsResponse.success && clubsResponse.data) {
        const filtered = clubsResponse.data.clubs.filter(
          (club: Club) =>
            club.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            club.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            club.category?.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setClubs(filtered);
      }

      // Search events
      const eventsResponse = await api.getEvents();
      if (eventsResponse.success && eventsResponse.data) {
        const filtered = eventsResponse.data.events.filter(
          (event: Event) =>
            event.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            event.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            event.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            event.location?.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setEvents(filtered);
      }

      // Search courses
      const coursesResponse = await api.getCourses();
      if (coursesResponse.success && coursesResponse.data) {
        const filtered = coursesResponse.data.courses.filter(
          (course: Course) =>
            course.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            course.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            course.description?.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setCourses(filtered);
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    if (queryParam) {
      performSearch(queryParam);
    }
  }, [queryParam]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
      performSearch(query);
    }
  };

  const totalResults = users.length + posts.length + clubs.length + events.length + courses.length;

  const formatTimeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-purple-50">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-gray-200 bg-white/80 backdrop-blur-md shadow-sm">
        <div className="mx-auto max-w-6xl px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="rounded-xl text-cyan-600 hover:bg-cyan-50"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>

            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search for users, posts, clubs, events, courses..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full text-black rounded-xl border-gray-200 py-6 pl-12 pr-4 text-base focus:border-cyan-500 focus:ring-cyan-500"
                />
              </div>
            </form>

            <Button
              type="submit"
              onClick={handleSearch}
              className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 px-6 font-semibold text-white hover:shadow-lg"
            >
              Search
            </Button>
          </div>

          {queryParam && (
            <div className="mt-3 text-sm text-gray-600">
              {isSearching ? (
                <span>Searching for "{queryParam}"...</span>
              ) : (
                <span>
                  Found <span className="font-semibold text-cyan-600">{totalResults}</span> results
                  for "{queryParam}"
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="mx-auto max-w-6xl px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 grid w-full grid-cols-6 rounded-xl bg-white p-1 shadow-sm">
            <TabsTrigger value="all" className="rounded-lg">
              All ({totalResults})
            </TabsTrigger>
            <TabsTrigger value="users" className="rounded-lg">
              <Users className="mr-2 h-4 w-4" />
              Users ({users.length})
            </TabsTrigger>
            <TabsTrigger value="posts" className="rounded-lg">
              <FileText className="mr-2 h-4 w-4" />
              Posts ({posts.length})
            </TabsTrigger>
            <TabsTrigger value="clubs" className="rounded-lg">
              <Users className="mr-2 h-4 w-4" />
              Clubs ({clubs.length})
            </TabsTrigger>
            <TabsTrigger value="events" className="rounded-lg">
              <Calendar className="mr-2 h-4 w-4" />
              Events ({events.length})
            </TabsTrigger>
            <TabsTrigger value="courses" className="rounded-lg">
              <BookOpen className="mr-2 h-4 w-4" />
              Courses ({courses.length})
            </TabsTrigger>
          </TabsList>

          {/* All Results */}
          <TabsContent value="all" className="space-y-6">
            {users.length > 0 && (
              <div>
                <h2 className="mb-3 text-lg font-bold text-gray-900">Users</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {users.slice(0, 4).map((user) => (
                    <Card
                      key={user._id}
                      onClick={() => router.push(`/profile?userId=${user._id}`)}
                      className="cursor-pointer border-0 bg-white shadow-md transition-all hover:-translate-y-1 hover:shadow-xl"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback className="bg-gradient-to-br from-cyan-400 to-blue-500 text-white">
                              {user.name?.charAt(0) || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <h3 className="font-bold text-gray-900">{user.name}</h3>
                            <p className="text-sm text-gray-500">@{user.username}</p>
                          </div>
                          <Badge className="bg-cyan-100 text-cyan-700">{user.role}</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {posts.length > 0 && (
              <div>
                <h2 className="mb-3 text-lg font-bold text-gray-900">Posts</h2>
                <div className="space-y-4">
                  {posts.slice(0, 3).map((post) => (
                    <Card
                      key={post._id}
                      className="border-0 bg-white shadow-md transition-all hover:-translate-y-1 hover:shadow-xl"
                    >
                      <CardContent className="p-4">
                        <div className="mb-2 flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-gradient-to-br from-purple-400 to-pink-500 text-white">
                              {post.author?.name?.charAt(0) || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{post.author?.name}</h3>
                            <p className="text-xs text-gray-500">{formatTimeAgo(post.createdAt)}</p>
                          </div>
                        </div>
                        <p className="mb-3 text-gray-700">{post.content}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Heart className="h-4 w-4" />
                            {post.likes?.length || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageCircle className="h-4 w-4" />
                            {post.comments?.length || 0}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {clubs.length > 0 && (
              <div>
                <h2 className="mb-3 text-lg font-bold text-gray-900">Clubs</h2>
                <div className="grid gap-4 md:grid-cols-3">
                  {clubs.slice(0, 3).map((club) => (
                    <Card
                      key={club._id}
                      onClick={() => router.push(`/clubs?id=${club._id}`)}
                      className="cursor-pointer border-0 bg-white shadow-md transition-all hover:-translate-y-1 hover:shadow-xl"
                    >
                      <CardContent className="p-4">
                        <h3 className="mb-2 font-bold text-gray-900">{club.name}</h3>
                        <p className="mb-3 line-clamp-2 text-sm text-gray-600">{club.description}</p>
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary">{club.category}</Badge>
                          <span className="flex items-center gap-1 text-sm text-gray-500">
                            <Users className="h-4 w-4" />
                            {club.members?.length || 0}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {events.length > 0 && (
              <div>
                <h2 className="mb-3 text-lg font-bold text-gray-900">Events</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {events.slice(0, 2).map((event) => (
                    <Card
                      key={event._id}
                      onClick={() => router.push(`/events?id=${event._id}`)}
                      className="cursor-pointer border-0 bg-white shadow-md transition-all hover:-translate-y-1 hover:shadow-xl"
                    >
                      <CardContent className="p-4">
                        <h3 className="mb-2 font-bold text-gray-900">{event.title}</h3>
                        <p className="mb-3 line-clamp-2 text-sm text-gray-600">{event.description}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(event.date).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {event.location}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {courses.length > 0 && (
              <div>
                <h2 className="mb-3 text-lg font-bold text-gray-900">Courses</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {courses.slice(0, 2).map((course) => (
                    <Card
                      key={course._id}
                      onClick={() => router.push(`/courses?id=${course._id}`)}
                      className="cursor-pointer border-0 bg-white shadow-md transition-all hover:-translate-y-1 hover:shadow-xl"
                    >
                      <CardContent className="p-4">
                        <div className="mb-2 flex items-center justify-between">
                          <h3 className="font-bold text-gray-900">{course.name}</h3>
                          <Badge variant="secondary">{course.code}</Badge>
                        </div>
                        <p className="mb-3 line-clamp-2 text-sm text-gray-600">{course.description}</p>
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <span>Instructor: {course.instructor?.name}</span>
                          <span>{course.credits} credits</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {totalResults === 0 && queryParam && !isSearching && (
              <div className="py-12 text-center">
                <Search className="mx-auto mb-4 h-16 w-16 text-gray-300" />
                <h3 className="mb-2 text-xl font-bold text-gray-900">No results found</h3>
                <p className="text-gray-600">
                  Try searching for something else or use different keywords
                </p>
              </div>
            )}
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            {users.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {users.map((user) => (
                  <Card
                    key={user._id}
                    onClick={() => router.push(`/profile?userId=${user._id}`)}
                    className="cursor-pointer border-0 bg-white shadow-md transition-all hover:-translate-y-1 hover:shadow-xl"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-14 w-14">
                          <AvatarFallback className="bg-gradient-to-br from-cyan-400 to-blue-500 text-lg text-white">
                            {user.name?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900">{user.name}</h3>
                          <p className="text-sm text-gray-500">@{user.username}</p>
                          {user.bio && (
                            <p className="mt-1 line-clamp-2 text-sm text-gray-600">{user.bio}</p>
                          )}
                        </div>
                        <Badge className="bg-cyan-100 text-cyan-700">{user.role}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <Users className="mx-auto mb-4 h-16 w-16 text-gray-300" />
                <h3 className="mb-2 text-xl font-bold text-gray-900">No users found</h3>
              </div>
            )}
          </TabsContent>

          {/* Posts Tab */}
          <TabsContent value="posts">
            {posts.length > 0 ? (
              <div className="space-y-4">
                {posts.map((post) => (
                  <Card
                    key={post._id}
                    className="border-0 bg-white shadow-md transition-all hover:-translate-y-1 hover:shadow-xl"
                  >
                    <CardContent className="p-5">
                      <div className="mb-3 flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-gradient-to-br from-purple-400 to-pink-500 text-white">
                            {post.author?.name?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900">{post.author?.name}</h3>
                          <p className="text-sm text-gray-500">
                            @{post.author?.username} · {formatTimeAgo(post.createdAt)}
                          </p>
                        </div>
                      </div>
                      <p className="mb-4 text-gray-700">{post.content}</p>
                      {post.images && post.images.length > 0 && (
                        <div className="mb-4 grid gap-2">
                          {post.images.map((img, idx) => (
                            <img
                              key={idx}
                              src={img}
                              alt="Post"
                              className="rounded-lg object-cover"
                            />
                          ))}
                        </div>
                      )}
                      <div className="flex items-center gap-6 text-gray-500">
                        <button className="flex items-center gap-2 transition-colors hover:text-red-500">
                          <Heart className="h-5 w-5" />
                          <span className="text-sm font-medium">{post.likes?.length || 0}</span>
                        </button>
                        <button className="flex items-center gap-2 transition-colors hover:text-cyan-500">
                          <MessageCircle className="h-5 w-5" />
                          <span className="text-sm font-medium">{post.comments?.length || 0}</span>
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <FileText className="mx-auto mb-4 h-16 w-16 text-gray-300" />
                <h3 className="mb-2 text-xl font-bold text-gray-900">No posts found</h3>
              </div>
            )}
          </TabsContent>

          {/* Clubs Tab */}
          <TabsContent value="clubs">
            {clubs.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-3">
                {clubs.map((club) => (
                  <Card
                    key={club._id}
                    onClick={() => router.push(`/clubs?id=${club._id}`)}
                    className="cursor-pointer border-0 bg-white shadow-md transition-all hover:-translate-y-1 hover:shadow-xl"
                  >
                    <CardContent className="p-5">
                      <h3 className="mb-2 text-lg font-bold text-gray-900">{club.name}</h3>
                      <p className="mb-4 line-clamp-3 text-sm text-gray-600">{club.description}</p>
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="text-sm">
                          {club.category}
                        </Badge>
                        <span className="flex items-center gap-1 text-sm font-medium text-gray-600">
                          <Users className="h-4 w-4" />
                          {club.members?.length || 0} members
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <Users className="mx-auto mb-4 h-16 w-16 text-gray-300" />
                <h3 className="mb-2 text-xl font-bold text-gray-900">No clubs found</h3>
              </div>
            )}
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events">
            {events.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {events.map((event) => (
                  <Card
                    key={event._id}
                    onClick={() => router.push(`/events?id=${event._id}`)}
                    className="cursor-pointer border-0 bg-white shadow-md transition-all hover:-translate-y-1 hover:shadow-xl"
                  >
                    <CardContent className="p-5">
                      <div className="mb-3 flex items-start justify-between">
                        <h3 className="flex-1 text-lg font-bold text-gray-900">{event.title}</h3>
                        <Badge variant="secondary">{event.category}</Badge>
                      </div>
                      <p className="mb-4 line-clamp-2 text-sm text-gray-600">{event.description}</p>
                      <div className="space-y-2 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-cyan-600" />
                          <span>{new Date(event.date).toLocaleDateString("en-US", {
                            weekday: "short",
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-purple-600" />
                          <span>{event.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-blue-600" />
                          <span>{event.attendees?.length || 0} attendees</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <Calendar className="mx-auto mb-4 h-16 w-16 text-gray-300" />
                <h3 className="mb-2 text-xl font-bold text-gray-900">No events found</h3>
              </div>
            )}
          </TabsContent>

          {/* Courses Tab */}
          <TabsContent value="courses">
            {courses.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {courses.map((course) => (
                  <Card
                    key={course._id}
                    onClick={() => router.push(`/courses?id=${course._id}`)}
                    className="cursor-pointer border-0 bg-white shadow-md transition-all hover:-translate-y-1 hover:shadow-xl"
                  >
                    <CardContent className="p-5">
                      <div className="mb-3 flex items-start justify-between">
                        <h3 className="flex-1 text-lg font-bold text-gray-900">{course.name}</h3>
                        <Badge variant="secondary" className="text-sm">
                          {course.code}
                        </Badge>
                      </div>
                      <p className="mb-4 line-clamp-2 text-sm text-gray-600">{course.description}</p>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span className="font-medium">
                          Instructor: <span className="text-cyan-600">{course.instructor?.name}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <BookOpen className="h-4 w-4" />
                          {course.credits} credits
                        </span>
                      </div>
                      <div className="mt-3 flex items-center gap-1 text-sm text-gray-500">
                        <Users className="h-4 w-4" />
                        <span>{course.students?.length || 0} students enrolled</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <BookOpen className="mx-auto mb-4 h-16 w-16 text-gray-300" />
                <h3 className="mb-2 text-xl font-bold text-gray-900">No courses found</h3>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {!queryParam && (
          <div className="py-16 text-center">
            <Search className="mx-auto mb-4 h-20 w-20 text-gray-300" />
            <h3 className="mb-2 text-2xl font-bold text-gray-900">Start searching</h3>
            <p className="text-gray-600">
              Enter a keyword to search for users, posts, clubs, events, and courses
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

