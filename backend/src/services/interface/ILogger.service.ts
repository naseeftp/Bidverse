export interface ILoggerService {
    info(message: string, meta?: Record<string, unknown>): void,  // Record ->built-in TypeScript utility type create an object {keytype,valutype}
    warn(message: string, meta?: Record<string, unknown>): void;
    error(message: string, error?: Error | unknown, meta?: Record<string, unknown>): void;
    debug(message: string, meta?: Record<string, unknown>): void
}