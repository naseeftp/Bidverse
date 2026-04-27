import { Request, Response, NextFunction } from "express";
import { ZodError, ZodSchema } from "zod";

export const validator = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const validationErrors = error.issues.map((issue) => ({
          field: issue.path[issue.path.length - 1],
          message: issue.message,
        }));

        return res.status(400).json({
          success: false,
          message: "Validation Failed",
          errors: validationErrors,
        });
      }
      next(error);
    }
  };
};