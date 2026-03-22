import { build } from 'vite';
import * as fs from 'fs';

build().catch(err => {
  fs.writeFileSync('vite_error.log', JSON.stringify(err, Object.getOwnPropertyNames(err), 2));
  process.exit(1);
});
