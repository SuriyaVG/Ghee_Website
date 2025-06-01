import 'dotenv/config'; // Load .env file variables
import expressFramework, { type Request, Response, NextFunction, type Express as ExpressAppType } from 'express'; // Aliasing default import
import cors from 'cors'; // Import CORS middleware
import { ZodError } from 'zod';
import pinoHttp from 'pino-http';
import logger from './logger'; // Import the configured pino logger
import { registerRoutes } from './routes';
import { setupVite, serveStatic } from './vite'; // Removed 'log' from here as pino will handle it
import http from 'http'; // Import http

const app: ExpressAppType = expressFramework();

// --- CORS Configuration ---
const allowedOrigins = [
  'http://localhost:5000', // Vite dev server (often proxies to itself or backend port)
  'http://127.0.0.1:5000',
  'https://gheewebsite-production.up.railway.app', // Your production frontend URL
  // Add your production frontend URL here when deploying
  // e.g., 'https://www.yourdomain.com'
];

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
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

// Note: Routes will be registered in startApp

// --- Centralized Error Handling ---
app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
  // Use req.log provided by pino-http for error logging within request context
  // or fallback to the main logger if req.log is not available (should be rare with pino-http)
  const errorLogger = req.log || logger;

  // --- Detailed Error Logging with Pino ---
  errorLogger.error(
    {
      err, // Log the error object itself
      req: { // Log relevant request details
        id: req.id, // Request ID added by pino-http
        method: req.method,
        url: req.originalUrl,
        body: req.body, // Be cautious with logging full body in prod if it contains sensitive data
        headers: req.headers,
      },
      // Add any other context you find useful
    },
    `Server Error: ${err.message}`
  );
  // --- End Detailed Error Logging with Pino ---

  let statusCode = err.statusCode || err.status || 500;
  let responseJson: { message: string; errors?: any; stack?: string; code?: string } = {
    message: 'An unexpected error occurred. Please try again later.',
  };

  if (err instanceof ZodError) {
    statusCode = 400; // Bad Request
    responseJson.message = 'Validation failed. Please check your input.';
    responseJson.errors = err.errors.map((e) => ({
      path: e.path.join('.'),
      message: e.message,
      code: e.code,
    }));
  } else if (err.isAxiosError) {
    // Example: Handle Axios errors specifically
    // req.log.error({ err: err.response }, 'Axios Response Error'); // More detailed log for Axios
    if (err.response) {
      responseJson.message = `Error communicating with an external service. (${err.response.status})`;
      if (process.env.NODE_ENV !== 'production') {
        responseJson.errors = err.response.data;
      }
    } else if (err.request) {
      responseJson.message = 'No response from an external service.';
    } else {
      responseJson.message = 'Error preparing request to an external service.';
    }
    statusCode = err.response?.status || 502;
  }
  // Add other specific error type handlers here

  if (process.env.NODE_ENV === 'production') {
    if (statusCode >= 500) {
      responseJson.message = 'Internal Server Error. We are working to resolve this.';
    } else if (!responseJson.errors && statusCode < 500) {
      if (
        responseJson.message === 'An unexpected error occurred. Please try again later.' &&
        err.message
      ) {
        responseJson.message = 'An error occurred processing your request.';
      }
    }
    delete responseJson.stack;
  } else {
    if (!responseJson.errors && !responseJson.stack) {
      responseJson.stack = err.stack;
    }
    if (
      responseJson.message === 'An unexpected error occurred. Please try again later.' &&
      err.message
    ) {
      responseJson.message = err.message;
    }
  }

  res.status(statusCode).json(responseJson);
});
// --- End Centralized Error Handling ---

let runningServer: http.Server | null = null;

async function startApp(): Promise<http.Server> {
  if (runningServer) {
    return runningServer; // Return existing server if already started
  }

  await registerRoutes(app); // Register routes first

  const backendPort = process.env.PORT || 5000;
  
  return new Promise(async (resolve) => {
    const server = http.createServer(app); // Create server with the app

    if (process.env.NODE_ENV === 'development') {
      await setupVite(app, server); // Pass the actual http.Server instance
    } else {
      serveStatic(app);
    }

    server.listen(
      {
        port: Number(backendPort),
        host: '0.0.0.0',
      },
      () => {
        // Use the main logger for application lifecycle events
        logger.info(`Backend server listening on internal port ${backendPort}`); // Update log message
        runningServer = server;
        resolve(server);
      }
    );
  });
}

if (process.env.NODE_ENV !== 'test') {
  startApp().catch(err => {
    logger.fatal({ err }, 'Failed to start server');
    process.exit(1);
  });
}

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
