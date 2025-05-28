import 'dotenv/config'; // Load .env file variables
import express, { type Request, Response, NextFunction } from 'express';
import cors from 'cors'; // Import CORS middleware
import { ZodError } from 'zod';
import pinoHttp from 'pino-http';
import logger from './logger'; // Import the configured pino logger
import { registerRoutes } from './routes';
import { setupVite, serveStatic } from './vite'; // Removed 'log' from here as pino will handle it

const app = express();

// --- CORS Configuration ---
const allowedOrigins = [
  'http://localhost:5000', // Vite dev server (often proxies to itself or backend port)
  'http://127.0.0.1:5000',
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

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

(async () => {
  const server = await registerRoutes(app);

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

  if (app.get('env') === 'development') {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = 5000;
  server.listen(
    {
      port,
      host: '127.0.0.1',
    },
    () => {
      // Use the main logger for application lifecycle events
      logger.info(`Server listening on port ${port}`);
    }
  );
})();
