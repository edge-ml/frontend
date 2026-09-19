process.on('uncaughtException', (err) => {
  if (err.code === 'EBUSY') return;
  console.error(err);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  if (err?.code === 'EBUSY') return;
  console.error(err);
  process.exit(1);
});

async function start() {
  const { createServer } = await import('vite');
  const server = await createServer();
  await server.listen();
  server.watcher?.on('error', (err) => {
    if (err.code === 'EBUSY') return;
    console.error('Watcher error:', err);
  });
}

start().catch((err) => {
  if (err?.code === 'EBUSY') return;
  console.error(err);
  process.exit(1);
});
