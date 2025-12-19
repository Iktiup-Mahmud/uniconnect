import 'dotenv/config';
import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import { connectDB } from './config/database';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import postRoutes from './routes/post.routes';
import portfolioRoutes from './routes/portfolio.routes';
import courseRoutes from './routes/course.routes';
import clubRoutes from './routes/club.routes';
import eventRoutes from './routes/event.routes';
import messageRoutes from './routes/message.routes';
import notificationRoutes from './routes/notification.routes';
import announcementRoutes from './routes/announcement.routes';
import commentRoutes from './routes/comment.routes';
import uploadRoutes from './routes/upload.routes';
import { errorHandler } from './middlewares/errorHandler';
import { notFound } from './middlewares/notFound';
import logger from './utils/logger';

const app: Application = express();
const PORT = process.env.PORT || 5001;

// Connect to MongoDB
connectDB();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(compression());
app.use(
  morgan('combined', {
    stream: {
      write: (message: string) => logger.http(message.trim()),
    },
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/posts', postRoutes);
app.use('/api/v1/comments', commentRoutes);
app.use('/api/v1/upload', uploadRoutes);
app.use('/api/v1/portfolios', portfolioRoutes);
app.use('/api/v1/courses', courseRoutes);
app.use('/api/v1/clubs', clubRoutes);
app.use('/api/v1/events', eventRoutes);
app.use('/api/v1/messages', messageRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/announcements', announcementRoutes);

// Error Handlers
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
