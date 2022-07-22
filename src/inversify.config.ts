import 'reflect-metadata';
import {Container, interfaces} from 'inversify';
import DispatcherInterface from "./EventDispatcher/Interfaces/DispatcherInterface";
import Dispatcher from "./EventDispatcher/Dispatcher";
import TemplatePlaceholderInterface from "./Interfaces/TemplatePlaceholderInterface";
import MetaPlaceholder from "./Creator/Template/Placeholders/MetaPlaceholder";
import Factory from "./Creator/Template/Placeholders/Factory";

const container = new Container();
container.bind<DispatcherInterface<any>>('dispatcher').to(Dispatcher).inSingletonScope();
container.bind<interfaces.Newable<TemplatePlaceholderInterface>>('meta').toConstructor<MetaPlaceholder>(MetaPlaceholder);
container.bind<interfaces.Factory<TemplatePlaceholderInterface>>("Factory<Placeholder>")
    .toFactory<TemplatePlaceholderInterface,
        [string, string]>(context => (type: string, placeholder: string) => {
        const c = context.container.get<interfaces.Newable<TemplatePlaceholderInterface>>(type);
        return new c(placeholder as never);
    });

container.bind<Factory>('fa').to(Factory);
export default container;