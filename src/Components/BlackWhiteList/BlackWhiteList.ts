import BlackWhiteListInterface, {Mode} from "./BlackWhiteListInterface";

export default class BlackWhiteList implements BlackWhiteListInterface {

    private mode: Mode;
    private list: string[];

    private get default(): boolean {
        return this.mode === 'black';
    }

    isFileAllowed(path: string): boolean {

        for (const item of this.list) {
            if (path.startsWith(item)) {
                return this.mode === 'white';
            }
        }
        return this.default;
    }

    setMode(mode: Mode): void {
        this.mode = mode;
    }

    setList(list: string[]): void {
        this.list = [...list];
    }

}