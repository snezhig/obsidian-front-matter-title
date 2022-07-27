import 'reflect-metadata';
import {Container as _Container} from 'inversify';
import DispatcherInterface from "../src/EventDispatcher/Interfaces/DispatcherInterface";
import Dispatcher from "../src/EventDispatcher/Dispatcher";
import TYPES from "./inversify.types";
import bindCreator from './services/creator.config';

const Container = new _Container();
Container.bind<DispatcherInterface<any>>(TYPES.dispatcher).to(Dispatcher).inSingletonScope();
Container.bind<string>("template").toDynamicValue(context => 'private_template');
Container.bind<string>(TYPES['template.pattern']).toConstantValue('(?<placeholder>{{(\\w|\\s)+?}})');

//START CREATOR
bindCreator(Container);
//END CREATOR

export default Container;