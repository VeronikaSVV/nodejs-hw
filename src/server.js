import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import { readFileSync } from 'node:fs';
import 'dotenv/config';
import { connectMongoDB } from './db/connectMongoDB.js';
import { errorHandler } from './middleware/errorHandler.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';
import { logger } from './middleware/logger.js';
import { isCelebrateError } from 'celebrate';
import notesRoutes from './routes/notesRoutes.js';

const PORT = process.env.PORT ?? 3000;

const openApiSpec = JSON.parse(
  readFileSync(new URL('../docs/openapi.json', import.meta.url), 'utf8'),
);

const app = express();
app.use(logger);
app.use(helmet());
app.use(express.json());
app.use(cors({ origin: '*' }));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiSpec));

app.use(notesRoutes);

app.use(notFoundHandler);

app.use((err, req, res, next) => {
  if (isCelebrateError(err)) {
    const details = [...err.details.values()]
      .map(({ details: errors }) => errors.map(({ message }) => message))
      .flat();
    return res.status(400).json({ message: 'Validation error', errors: details });
  }
  next(err);
});

app.use(errorHandler);

await connectMongoDB();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
