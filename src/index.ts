import express from 'express';
import cors from 'cors';
import { createGetEventsController } from './controllers/events';
import { createGetSettingsController, createPostSettingsController } from './controllers/settings';
import { ENV } from './lib/env';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.get('/events', createGetEventsController());

app.get('/settings', createGetSettingsController());

app.post('/settings', createPostSettingsController());

app.use((_req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

app.use((_err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(ENV.PORT, () => {
  console.log(`Server Started on port ${ENV.PORT}`);
});
