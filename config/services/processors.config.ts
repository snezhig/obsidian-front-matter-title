import { ContainerModule } from "inversify";
import SI from "../inversify.types";
import { KeyStorageInterface } from "@src/Storage/Interfaces";
import { SettingsType } from "@src/Settings/SettingsType";
import ReplaceProcessor from "@src/Components/Processor/ReplaceProcessor";
import FunctionProcessor from "@src/Components/Processor/FunctionProcessor";
import { ProcessorTypes } from "@src/Components/Processor/ProcessorUtils";
import FunctionV2Processor from "@src/Components/Processor/FunctionV2Processor";

export default new ContainerModule(bind => {
    bind(SI.processor).to(ReplaceProcessor).whenTargetNamed(ProcessorTypes.Replace);
    bind(SI.processor).to(FunctionProcessor).whenTargetNamed(ProcessorTypes.Function);
    bind(SI.processor).to(FunctionV2Processor).whenTargetNamed(ProcessorTypes.FunctionV2);
    bind(SI["processor:args"]).toDynamicValue(c =>
        c.container.get<KeyStorageInterface<SettingsType>>(SI["settings:storage"]).get("processor").get("args").value()
    );
    bind(SI["factory:processor"]).toAutoNamedFactory(SI.processor);
});
