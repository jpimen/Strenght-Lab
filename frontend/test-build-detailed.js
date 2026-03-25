import { build } from 'vite';

build().catch(err => {
  console.log("ESBUILD ERRORS:");
  if (err.errors) {
    err.errors.forEach(e => {
      console.log(e.text);
      console.log(e.location?.file + ":" + e.location?.line);
    });
  } else if (err.cause) {
    console.log("CAUSE:", err.cause);
  } else {
    console.log(err.message, err.stack);
  }
  process.exit(1);
});
