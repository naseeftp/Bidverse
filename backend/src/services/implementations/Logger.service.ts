import { ILoggerService } from "../interface/ILogger.service";
import path from "node:path";
import fs from "node:fs"
import { env } from "../../config/env";

export class LoggerService implements ILoggerService {
   private readonly _context: string;
   private readonly _logsDir: string;
   constructor(context: string = "Application") {
      this._context = context;
      this._logsDir = path.join(process.cwd(), "logs")
      this._ensureLogsDir()
   }
   private _ensureLogsDir(): void {
      if (!fs.existsSync(this._logsDir)) {
         fs.mkdirSync(this._logsDir, { recursive: true })
      }
   }
   private _log(level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG', message: string, meta?:Record<string,unknown>): void {
      const timeStamp = new Date().toISOString();
      const metaString = meta ? `|Meta: ${JSON.stringify(meta)} ` : ''
      const logEntry = `[${timeStamp}] [${level}] [${this._context}] ${message}${metaString}\n`
      if (level === 'ERROR') {
         process.stderr.write(`\x1b[31m${logEntry}\x1b[0m`)
      }
      else {
         process.stdout.write(logEntry)
      }

      try {
         fs.appendFileSync(path.join(this._logsDir, 'combined.log'), logEntry)
         if (level === 'ERROR') {
            fs.appendFileSync(path.join(this._logsDir, 'error.log'), logEntry)
         }
      } catch (error) {
         process.stderr.write(`critical logger Error ${error}\n`)
      }
   }

   info(message: string, meta?: Record<string, unknown>): void {
      this._log('INFO', message, meta)
   }
   warn(message: string, meta?: Record<string, unknown>): void {
      this._log('WARN', message, meta)
   }
   debug(message: string, meta?: Record<string, unknown>): void {
      if (env.NODE_ENV !== "production") {
         this._log('DEBUG', message, meta)
      }
   }
   error(message: string, error?: Error | unknown, meta?: Record<string, unknown>): void {
      const errorDetails = error instanceof Error ? { stack: error.stack, ...(meta||{}) } : { error, ...(meta||{}) }
      this._log('ERROR', message, errorDetails)
   }

}