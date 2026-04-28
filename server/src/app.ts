import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import { healthRouter } from './routes/health.js';
import { authRouter } from './routes/auth.js';
import { adminDashboardRouter } from './routes/admin-dashboard.js';
import { adminEmployeesRouter } from './routes/admin-employees.js';
import { adminRequestsRouter } from './routes/admin-requests.js';
import { adminAttendancePerformanceRouter } from './routes/admin-attendance-performance.js';
import { registerSwagger } from './docs/swagger.js';
import { errorHandler, notFoundHandler } from './middleware/error.js';

export const app = express();

app.use(
  cors({
    origin: env.FRONTEND_ORIGIN,
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());

app.use('/api/health', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/admin', adminDashboardRouter);
app.use('/api/admin', adminEmployeesRouter);
app.use('/api/admin', adminRequestsRouter);
app.use('/api/admin', adminAttendancePerformanceRouter);

registerSwagger(app);

app.use(notFoundHandler);
app.use(errorHandler);
