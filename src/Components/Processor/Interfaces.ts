import { ProcessorTypes } from "@src/Components/Processor/ProcessorUtils";

export default interface ProcessorInterface {
    process(value: string): string;
    getType(): ProcessorTypes;
}
