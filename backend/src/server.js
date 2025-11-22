import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { config } from './config/index.js';
import { initDb } from './config/db.js';
import routes from './routes/index.js';
import { authenticate } from './middleware/auth.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api', routes);

app.use(authenticate, (req, res) => res.status(404).json({ message: 'Not found' }));
app.use(errorHandler);

export const start = async () => {
  await initDb();
  app.listen(config.port, () => {
    console.log(`Server listening on port ${config.port}`);
  });
};

if (process.env.NODE_ENV !== 'test') {
  start();
}

export default app;
