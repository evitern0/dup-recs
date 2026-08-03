import { createServer } from 'node:http';
import type { AddressInfo } from 'node:net';

export async function startTestServer(app) {
  const server = createServer(app);
  await new Promise<void>((resolve) => {
    server.listen(0, () => resolve());
  });
  const { port } = server.address() as AddressInfo;
  return {
    server,
    baseUrl: `http://127.0.0.1:${port}`,
    async close() {
      await new Promise<void>((resolve) => {
        server.close(() => resolve());
      });
    }
  };
}
