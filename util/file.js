import fs from 'fs';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const clearImage = filePath => {
  filePath = join(__dirname, '..', filePath);
  fs.unlink(filePath, err => console.log(err));
}

export {
  clearImage
}
