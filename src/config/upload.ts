import multer from 'multer';
import path from 'path';
import crypto from 'crypto';

const pathToTemp = path.resolve(__dirname, '..', '..', 'tmp');

export default {
  tempPath: pathToTemp,
  storage: multer.diskStorage({
    destination: pathToTemp,
    filename(_request, file, callback) {
      const fileHash = crypto.randomBytes(10).toString('hex');
      const fileName = `${fileHash}-${file.originalname}`;

      return callback(null, fileName);
    },
  }),
};
