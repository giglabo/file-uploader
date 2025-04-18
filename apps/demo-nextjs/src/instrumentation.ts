export async function register() {
  console.log(`Env: ${process.env.NEXT_RUNTIME}`);
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./instrumentation-node');
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    // TODO
  }
}
