import multer from "multer";
import { ApiError } from "@common/exceptions/ApiError";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      cb(new ApiError(400, "Only image files are allowed"));
      return;
    }
    cb(null, true);
  },
});
