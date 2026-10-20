import app from './app.js';
import { connectDatabase } from './config/database.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { startWarrantyReminderJob } from './modules/notifications/notification.service.js';

try {
  if (env.MONGODB_URI) {
    await connectDatabase();
    logger.info('Connected to MongoDB');
    startWarrantyReminderJob();
  } else {
    logger.warn(
      'MONGODB_URI is empty; database-backed features are unavailable',
    );
  }

  app.listen(env.PORT, '0.0.0.0', () => {
    logger.info(`LifeLedger API listening on port ${env.PORT}`);
  });
} catch (error) {
  logger.fatal({ err: error }, 'Could not connect to MongoDB');
  process.exit(1);
}
