import { Container } from "inversify";
import SI from "../inversify.types";
import { KeyStorageInterface } from "../../src/Storage/Interfaces";
import { SettingsType } from "../../src/Settings/SettingsType";
import ReplaceProcessor from "../../src/Components/Processor/ReplaceProcessor";
import FunctionProcessor from "../../src/Components/Processor/FunctionProcessor";
import { ProcessorTypes } from "../../src/Components/Processor/ProcessorUtils";
const c = new Container();

c.bind(SI.processor).to(ReplaceProcessor).whenTargetNamed(ProcessorTypes.Replace);
c.bind(SI.processor).to(FunctionProcessor).whenTargetNamed(ProcessorTypes.Function);
c.bind(SI["processor:args"]).toDynamicValue(() => c.get<KeyStorageInterface<SettingsType>>(SI["settings:storage"]).get('processor').get('args').value())
c.bind(SI["factory:processor"]).toAutoNamedFactory(SI.processor);

export default c;