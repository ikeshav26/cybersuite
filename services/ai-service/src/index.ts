import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from '@cybersec/config';
import { logger } from '@cybersec/utils';
import { errorHandler } from './middleware/error-handler.js';
import { requestLogger } from './middleware/request-logger.js';
import aiRoutes from './routes/ai.routes.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = config.aiService.port;

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: config.corsOrigin,
    credentials: true,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use(requestLogger);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'ai-service',
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.use('/api/ai', aiRoutes);

// Error handling
app.use(errorHandler);

app.listen(PORT, () => {
  // console.log(process.env.GITHUB_APP_ID)
  logger.info('AI Service running on port ' + PORT);
});
