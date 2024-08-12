import EventInterface from "@src/Components/EventDispatcher/Interfaces/EventInterface";
import { ResolverEvents } from "@src/Resolver/ResolverType";
import { FunctionV2ObjArg, ProcessorTypes } from "@src/Components/Processor/ProcessorUtils";

export default class ProcessorArgumentTransformer {
    static transform(event: EventInterface<ResolverEvents["resolver:resolved"]>, type: ProcessorTypes): string | null {
        switch (type) {
            case ProcessorTypes.Function:
            case ProcessorTypes.Replace:
                return event.get().value;
            case ProcessorTypes.FunctionV2:
                return JSON.stringify({ path: event.get().path, title: event.get().value } as FunctionV2ObjArg);
        }
    }
}
