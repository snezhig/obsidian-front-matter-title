import 'reflect-metadata';
import {Container} from 'inversify';
import DispatcherInterface from "../src/EventDispatcher/Interfaces/DispatcherInterface";
import Dispatcher from "../src/EventDispatcher/Dispatcher";
import TYPES from "./inversify.types";
import bindCreator from './services/creator.config';

const container = new Container();
container.bind<DispatcherInterface<any>>(TYPES.dispatcher).to(Dispatcher).inSingletonScope();
container.bind<string>("template").toDynamicValue(context => 'private_template');
container.bind<string>(TYPES['template.regexp']).toDynamicValue(context => '(?<placeholder>{{(?<title>.*?)}})');

//START CREATOR
bindCreator(container);
//END CREATOR

export default container;