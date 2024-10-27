export default interface LoggerInterface {
    log(...value: any[]): void;
    info(...value: any[]): void;
    debug(...value: any[]): void;
    warn(...value: any[]): void;
}
