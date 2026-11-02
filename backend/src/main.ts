import 'reflect-metadata';
import { createApp } from './bootstrap';
import { loadConfig } from './config';

async function main() {
  const cfg = loadConfig();
  const app = await createApp(cfg);
  await app.listen(cfg.port, '0.0.0.0');
}
main().catch((error: Error) => {
  console.error(`Failed to start: ${error.message}`);
  process.exit(1);
});
