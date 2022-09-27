export type Mode = "black" | "white";
export default interface BlackWhiteListInterface {
    isFileAllowed(path: string): boolean;

    setMode(mode: Mode): void;

    setList(list: string[]): void;
}
