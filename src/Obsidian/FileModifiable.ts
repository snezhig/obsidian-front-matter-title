export default interface FileModifiable {
    read(): Promise<string>;

    modify(c: string): Promise<void>;
}