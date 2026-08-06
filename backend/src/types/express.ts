import 'multer';

declare global {
  /* eslint-disable @typescript-eslint/no-namespace */
  namespace Express {
    interface Request {
      file?: Multer.File;
      files?: Multer.File[] | { [fieldname: string]: Multer.File[] };
    }
  }
}