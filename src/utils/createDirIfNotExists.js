import fs from 'node:fs/promises';

export const createDirIfNotExists = async (url) => {
  try {
    await fs.access(url);
  } catch (err) {
    if (err.code === 'ENOENT') {
      try {
        await fs.mkdir(url, { recursive: true });
      } catch (mkdirErr) {
        throw new Error(`Failed to create directory: ${mkdirErr.message}`);
      }
    } else {
      throw err;
    }
  }
};
