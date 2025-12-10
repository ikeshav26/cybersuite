import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from './routes/auth-gateway.routes.ts';
import aiserviceRoutes from './routes/aiservice-gateway.routes.ts';

dotenv.config();

const app = express();

// Middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3010',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/ai', aiserviceRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'api-gateway' });
});

const port = Number(process.env.PORT) || 3000;

app.listen(port, () => {
  console.log(`api-gateway listening on port ${port}`);
});

export default app;
