import path from 'node:path';
import fs from 'node:fs/promises';
import { TEMP_UPLOAD_DIR, UPLOAD_DIR } from '../constants/index.js';
import { env } from './env.js';
import { createDirIfNotExists } from './createDirIfNotExists.js';

export const saveFileToUploadDir = async (file) => {
  const filename = path.basename(file.filename);

  try {
    await createDirIfNotExists(UPLOAD_DIR);

    await fs.rename(
      path.join(TEMP_UPLOAD_DIR, filename),
      path.join(UPLOAD_DIR, filename),
    );
  } catch (err) {
    throw new Error(err.message);
  }

  return `${env('APP_DOMAIN')}/uploads/${filename}`;
};
