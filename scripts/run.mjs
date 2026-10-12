const mode = process.argv[2];
if (mode !== 'development' && mode !== 'production') {
  throw new Error('Expected development or production mode.');
}
process.env.NODE_ENV = mode;
await import(mode === 'development' ? '../server/_core/index.ts' : '../dist/index.js');
