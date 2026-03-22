import { build } from 'vite';

build().catch(err => {
  console.error("VITE_BUILD_ERROR:");
  console.error(err);
  process.exit(1);
});
