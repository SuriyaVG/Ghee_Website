import 'dotenv/config'; // Load .env file variables
import expressFramework, { type Request, Response, NextFunction, type Express as ExpressAppType } from 'express'; // Aliasing default import
import cors from 'cors'; // Import CORS middleware
import { ZodError } from 'zod';
import pinoHttp from 'pino-http';
import logger from './logger'; // Import the configured pino logger
import { registerRoutes } from './routes';
import { setupVite, serveStatic } from './vite'; // Removed 'log' from here as pino will handle it
import http from 'http'; // Import http
import helmet from 'helmet';
import authRouter from './routes/auth';
import cookieParser from 'cookie-parser';
import csurf from 'csurf';
import { errorHandler } from './middleware/errorHandler';

const app: ExpressAppType = expressFramework();

// --- Development CSP Middleware ---
// The following block is commented out for local development with Vite.
// Vite's dev server requires no CSP for hot reloading and module loading to work correctly.
// To test CSP locally, uncomment this block and adjust as needed.
/*
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    res.setHeader(
      'Content-Security-Policy',
      "script-src 'self' 'unsafe-inline' https://sdk.cashfree.com"
    );
    next();
  });
}
*/
// --- End Development CSP Middleware ---

// --- Security Middleware ---
app.use(helmet());
// Set X-Content-Type-Options header for all responses
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  next();
});
// --- End Security Middleware ---

// --- CORS Configuration ---
const allowedOrigins = [
  'http://localhost:5000', // Vite dev server (often proxies to itself or backend port)
  'http://127.0.0.1:5000',
  'http://localhost:5173', // Vite frontend dev server
  'https://gsrghee-production.up.railway.app', // Your production frontend URL
  'https://gsrghee-production.up.railway.app;' // Handle origin with semicolon
];

console.log('ADMIN_API_TOKEN:', process.env.ADMIN_API_TOKEN);

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Clean up origin by removing any trailing semicolon
    const cleanOrigin = origin?.replace(/;$/, '');
    if (!origin || allowedOrigins.includes(cleanOrigin || '') || allowedOrigins.includes(origin || '')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Important for cookies, authorization headers with HTTPS
};

app.use(cors(corsOptions));
// --- End CORS Configuration ---

// Add pino-http middleware for request logging
// It will use the logger instance we configured
app.use(pinoHttp({ logger }));

app.use(expressFramework.json());
app.use(expressFramework.urlencoded({ extended: false }));

app.use(cookieParser());
app.use('/api/auth', authRouter); // Mount at /api/auth for proxy compatibility

// Register routes and error handler on the exported app
async function setupApp(appInstance: ExpressAppType) {
  await registerRoutes(appInstance);
  // CSRF protection for refresh endpoint
  app.use('/auth/refresh-token', csurf({ cookie: true }));
  // Use the global error handler after all routes
  appInstance.use(errorHandler);
  // Catch-all for unhandled responses
  appInstance.use((req, res, next) => {
    if (!res.headersSent) {
      logger.error({ url: req.originalUrl }, 'Unhandled request, sending 404');
      res.status(404).json({ error: 'Not Found' });
    } else {
      logger.error({ url: req.originalUrl }, 'Response sent without error handler');
    }
    next();
  });
}

let runningServer: http.Server | null = null;

async function startApp(): Promise<http.Server> {
  if (runningServer) {
    return runningServer;
  }
  await setupApp(app);
  const backendPort = 5000;
  return new Promise(async (resolve) => {
    const server = http.createServer(app);
    if (process.env.NODE_ENV === 'development') {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }
    server.listen(
      {
        port: Number(backendPort),
        host: '0.0.0.0',
      },
      () => {
        logger.info(`Backend server listening on internal port ${backendPort}`);
        runningServer = server;
        resolve(server);
      }
    );
  });
}

// For test runner: ensure app has routes and error handler
if (process.env.NODE_ENV === 'test') {
  setupApp(app);
}

// Start the server
startApp().catch((error) => {
  logger.error({ error }, 'Failed to start server');
  process.exit(1);
});

export { app, startApp };

export async function closeServer(): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    if (runningServer && runningServer.listening) {
      runningServer.close((err) => {
        if (err) {
          logger.error({ err }, 'Error closing server');
          return reject(err);
        }
        logger.info('Server closed');
        runningServer = null;
        resolve();
      });
    } else {
      resolve();
    }
  });
}
