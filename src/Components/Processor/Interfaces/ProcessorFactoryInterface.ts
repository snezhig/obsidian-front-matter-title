import ProcessorTypes from "../ProcessorUtils";
import ProcessorInterface from "./ProcessorInterface";
export default interface ProcessorFactoryInterface {
    create(type: ProcessorTypes): ProcessorInterface;
}
