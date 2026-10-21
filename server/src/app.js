import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import mongoose from 'mongoose';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import authRoutes from './modules/auth/auth.routes.js';
import productRoutes from './modules/products/product.routes.js';
import warrantyRoutes from './modules/warranties/warranty.routes.js';
import dashboardRoutes from './modules/dashboard/dashboard.routes.js';
import documentRoutes from './modules/documents/document.routes.js';
import careRoutes from './modules/care/care.routes.js';
import notificationRoutes from './modules/notifications/notification.routes.js';
import contactRoutes from './modules/contact/contact.routes.js';
import timelineRoutes from './modules/timeline/timeline.routes.js';
import assetRoutes from './modules/assets/assets.routes.js';
import shareRoutes from './modules/shares/share.routes.js';

const app = express();

app.disable('x-powered-by');
app.use(helmet());
app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(express.json({ limit: '32kb' }));
app.use(cookieParser());
app.use(pinoHttp({ logger }));

app.get('/api/v1/health', (_req, res) => {
  res.status(200).json({
    success: true,
    data: {
      status: 'ok',
      database:
        mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString(),
    },
  });
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/warranties', warrantyRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/documents', documentRoutes);
app.use('/api/v1/care', careRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/contact', contactRoutes);
app.use('/api/v1/timeline', timelineRoutes);
app.use('/api/v1/assets', assetRoutes);
app.use('/api/v1/shares', shareRoutes);
app.use(notFound);
app.use(errorHandler);

export default app;
