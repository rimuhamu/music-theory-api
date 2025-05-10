import { Hono } from 'hono';
import { handle } from 'hono/vercel';
import { logger } from 'hono/logger';

export const config = {
  runtime: 'edge',
};

const app = new Hono().basePath('/api');

app.use('*', logger());

app.get('/', (c) => {
  return c.json({ message: 'Hello Hono!' });
});

export default handle(app);
