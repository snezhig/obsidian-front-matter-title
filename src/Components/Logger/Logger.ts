import LoggerInterface from "@src/Components/Logger/LoggerInterface";
import {Debugger} from "debug";
import {injectable} from "inversify";

@injectable()
export default class Logger implements LoggerInterface{
    constructor(
        private d: Debugger
    ) {
    }
    log(value: any) {
        this.d(value);
    }
}