import { createServer, request, type ClientRequest } from 'node:http';
import type { AddressInfo } from 'node:net';

/** An isolated origin whose connections can fail without stopping the shared preview server. */
export async function createOriginOutage(upstreamOrigin: string) {
  const upstream = new URL(upstreamOrigin);
  if (upstream.protocol !== 'http:' || !['127.0.0.1', 'localhost', '[::1]'].includes(upstream.hostname)) {
    throw new Error('The outage test proxy only forwards to a local HTTP preview server.');
  }
  const upstreamRequests = new Set<ClientRequest>();
  const server = createServer((incoming, outgoing) => {
    const forwarding = request(new URL(incoming.url || '/', upstream), {
      method: incoming.method,
      headers: { ...incoming.headers, host: upstream.host },
    }, response => {
      outgoing.writeHead(response.statusCode || 502, response.headers);
      response.pipe(outgoing);
    });
    upstreamRequests.add(forwarding);
    forwarding.on('close', () => upstreamRequests.delete(forwarding));
    forwarding.on('error', () => outgoing.destroy());
    incoming.on('aborted', () => forwarding.destroy());
    incoming.pipe(forwarding);
  });
  await new Promise<void>((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      server.off('error', reject);
      resolve();
    });
  });
  const origin = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  let stopped: Promise<void> | undefined;
  const stop = () => {
    if (!stopped) {
      stopped = new Promise<void>((resolve, reject) => {
        server.close(error => error ? reject(error) : resolve());
        server.closeAllConnections();
        for (const forwarding of upstreamRequests) forwarding.destroy();
      });
    }
    return stopped;
  };
  return { origin, stop, isListening: () => server.listening };
}
