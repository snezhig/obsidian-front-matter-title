import EventInterface from "@src/Components/EventDispatcher/Interfaces/EventInterface";
import { ResolverEvents } from "@src/Resolver/ResolverType";
import { FunctionV2ObjArg, ProcessorTypes } from "@src/Components/Processor/ProcessorUtils";
import { injectable } from "inversify";

@injectable()
export default class ProcessorArgumentTransformer {
    transform(event: EventInterface<ResolverEvents["resolver:resolved"]>, type: ProcessorTypes): string | null {
        switch (type) {
            case ProcessorTypes.Function:
            case ProcessorTypes.Replace:
                return event.get().value;
            case ProcessorTypes.FunctionV2:
                return JSON.stringify({
                    path: event.get().path,
                    title: event.get().value,
                    file: null,
                } as FunctionV2ObjArg);
        }
    }
}
