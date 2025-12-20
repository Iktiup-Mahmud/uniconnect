import 'dotenv/config';
import { connectDB } from '../config/database';
import User from '../models/User.model';
import Club from '../models/Club.model';
import Course from '../models/Course.model';
import Event from '../models/Event.model';

const seedData = async () => {
  try {
    await connectDB();
    console.log('Connected to database');

    // Clear existing data (optional - comment out if you want to keep existing data)
    // await Club.deleteMany({});
    // await Course.deleteMany({});
    // await Event.deleteMany({});

    // Get or create demo users
    let facultyUser = await User.findOne({ email: 'faculty@demo.com' });
    if (!facultyUser) {
      facultyUser = await User.create({
        name: 'Dr. Sarah Johnson',
        email: 'faculty@demo.com',
        username: 'sarah_johnson',
        password: 'password123',
        role: 'faculty',
        bio: 'Professor of Computer Science',
      });
      console.log('Created faculty user');
    }

    let organizerUser = await User.findOne({ email: 'organizer@demo.com' });
    if (!organizerUser) {
      organizerUser = await User.create({
        name: 'Mike Chen',
        email: 'organizer@demo.com',
        username: 'mike_chen',
        password: 'password123',
        role: 'club_organizer',
        bio: 'Club organizer and event coordinator',
      });
      console.log('Created organizer user');
    }

    // Get some students
    const students = await User.find({ role: 'student' }).limit(5);
    if (students.length === 0) {
      console.log('No students found. Please create some student accounts first.');
      return;
    }

    // Seed Clubs
    const clubsData = [
      {
        name: 'Computer Science Club',
        description: 'A community for computer science enthusiasts. We organize coding competitions, workshops, and tech talks.',
        organizer: organizerUser._id,
        category: 'Technology',
        imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400',
        members: [organizerUser._id, ...students.slice(0, 3).map(s => s._id)],
        isActive: true,
      },
      {
        name: 'Photography Society',
        description: 'Capture moments, share stories. Join us for photo walks, exhibitions, and photography workshops.',
        organizer: organizerUser._id,
        category: 'Arts',
        imageUrl: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400',
        members: [organizerUser._id, ...students.slice(1, 4).map(s => s._id)],
        isActive: true,
      },
      {
        name: 'Basketball Team',
        description: 'University basketball team. Practice sessions, tournaments, and team building activities.',
        organizer: organizerUser._id,
        category: 'Sports',
        imageUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400',
        members: [organizerUser._id, ...students.slice(2, 5).map(s => s._id)],
        isActive: true,
      },
      {
        name: 'Debate Club',
        description: 'Sharpen your argumentation skills. Weekly debates on current affairs and important topics.',
        organizer: organizerUser._id,
        category: 'Academic',
        imageUrl: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=400',
        members: [organizerUser._id, ...students.slice(0, 2).map(s => s._id)],
        isActive: true,
      },
      {
        name: 'Volunteer Network',
        description: 'Making a difference in our community. Join us for volunteer activities and social causes.',
        organizer: organizerUser._id,
        category: 'Volunteer',
        imageUrl: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=400',
        members: [organizerUser._id, ...students.map(s => s._id)],
        isActive: true,
      },
    ];

    for (const clubData of clubsData) {
      const existingClub = await Club.findOne({ name: clubData.name });
      if (!existingClub) {
        await Club.create(clubData);
        console.log(`Created club: ${clubData.name}`);
      } else {
        console.log(`Club already exists: ${clubData.name}`);
      }
    }

    // Seed Courses
    const coursesData = [
      {
        code: 'CS101',
        name: 'Introduction to Computer Science',
        description: 'Fundamental concepts of computer science including programming, algorithms, and data structures.',
        instructor: facultyUser._id,
        semester: 'Fall',
        year: 2024,
        students: students.slice(0, 3).map(s => s._id),
        materials: [],
        announcements: [],
        assignments: [],
      },
      {
        code: 'CS201',
        name: 'Data Structures and Algorithms',
        description: 'Advanced data structures and algorithm design techniques. Prerequisites: CS101.',
        instructor: facultyUser._id,
        semester: 'Fall',
        year: 2024,
        students: students.slice(1, 4).map(s => s._id),
        materials: [],
        announcements: [],
        assignments: [],
      },
      {
        code: 'CS301',
        name: 'Web Development',
        description: 'Modern web development using React, Node.js, and MongoDB. Build full-stack applications.',
        instructor: facultyUser._id,
        semester: 'Spring',
        year: 2025,
        students: students.slice(0, 5).map(s => s._id),
        materials: [],
        announcements: [],
        assignments: [],
      },
      {
        code: 'MATH201',
        name: 'Calculus II',
        description: 'Advanced calculus topics including integration, sequences, and series.',
        instructor: facultyUser._id,
        semester: 'Fall',
        year: 2024,
        students: students.slice(2, 5).map(s => s._id),
        materials: [],
        announcements: [],
        assignments: [],
      },
    ];

    for (const courseData of coursesData) {
      const existingCourse = await Course.findOne({ 
        code: courseData.code, 
        semester: courseData.semester, 
        year: courseData.year 
      });
      if (!existingCourse) {
        await Course.create(courseData);
        console.log(`Created course: ${courseData.code} - ${courseData.name}`);
      } else {
        console.log(`Course already exists: ${courseData.code}`);
      }
    }

    // Get clubs for events
    const clubs = await Club.find().limit(3);
    const courses = await Course.find().limit(2);

    // Seed Events
    const eventsData = [
      {
        title: 'Hackathon 2024',
        description: '24-hour coding competition. Build innovative projects and compete for prizes!',
        organizer: organizerUser._id,
        clubId: clubs[0]?._id,
        eventDate: new Date('2024-12-20T10:00:00'),
        location: 'Main Auditorium',
        category: 'Workshop',
        imageUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=400',
        attendees: [organizerUser._id, ...students.slice(0, 5).map(s => s._id)],
        maxAttendees: 50,
        isPublic: true,
      },
      {
        title: 'Photography Exhibition',
        description: 'Showcase your best shots! Open to all photography enthusiasts.',
        organizer: organizerUser._id,
        clubId: clubs[1]?._id,
        eventDate: new Date('2024-12-15T14:00:00'),
        location: 'Art Gallery',
        category: 'Cultural',
        imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400',
        attendees: [organizerUser._id, ...students.slice(1, 4).map(s => s._id)],
        maxAttendees: 30,
        isPublic: true,
      },
      {
        title: 'Basketball Tournament',
        description: 'Inter-university basketball championship. Support our team!',
        organizer: organizerUser._id,
        clubId: clubs[2]?._id,
        eventDate: new Date('2024-12-18T16:00:00'),
        location: 'Sports Complex',
        category: 'Sports',
        imageUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400',
        attendees: [organizerUser._id, ...students.map(s => s._id)],
        maxAttendees: 100,
        isPublic: true,
      },
      {
        title: 'Guest Lecture: AI and Machine Learning',
        description: 'Join us for an insightful talk on the future of AI and machine learning.',
        organizer: facultyUser._id,
        courseId: courses[0]?._id,
        eventDate: new Date('2024-12-22T11:00:00'),
        location: 'Lecture Hall A',
        category: 'Seminar',
        imageUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400',
        attendees: [facultyUser._id, ...students.slice(0, 3).map(s => s._id)],
        maxAttendees: 80,
        isPublic: true,
      },
      {
        title: 'Volunteer Day: Community Cleanup',
        description: 'Help clean up the local park and make a positive impact on the environment.',
        organizer: organizerUser._id,
        clubId: clubs[4]?._id,
        eventDate: new Date('2024-12-25T09:00:00'),
        location: 'City Park',
        category: 'Social',
        imageUrl: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=400',
        attendees: [organizerUser._id, ...students.slice(2, 5).map(s => s._id)],
        maxAttendees: 40,
        isPublic: true,
      },
    ];

    for (const eventData of eventsData) {
      const existingEvent = await Event.findOne({ 
        title: eventData.title,
        eventDate: eventData.eventDate 
      });
      if (!existingEvent) {
        const event = await Event.create(eventData);
        // Update club events array if applicable
        if (eventData.clubId) {
          await Club.findByIdAndUpdate(eventData.clubId, {
            $push: { events: event._id },
          });
        }
        console.log(`Created event: ${eventData.title}`);
      } else {
        console.log(`Event already exists: ${eventData.title}`);
      }
    }

    console.log('\n✅ Seeding completed successfully!');
    console.log('\nDemo accounts created:');
    console.log('Faculty: faculty@demo.com / password123');
    console.log('Organizer: organizer@demo.com / password123');
    console.log('\nYou can now log in and explore the platform!');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();

