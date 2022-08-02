import 'reflect-metadata';
import {Container as _Container, interfaces} from 'inversify';
import DispatcherInterface from "../src/EventDispatcher/Interfaces/DispatcherInterface";
import Dispatcher from "../src/EventDispatcher/Dispatcher";
import TYPES from "./inversify.types";
import bindCreator from './services/creator.config';
import ResolverInterface from "../src/Interfaces/ResolverInterface";
import ResolverSync from "../src/Resolver/ResolverSync";
import FilterInterface from "../src/Interfaces/FilterInterface";
import ExtensionFilter from "../src/Filters/ExtensionFilter";
import PathListFilter from "../src/Filters/PathListFilter";
import BlackWhiteListInterface from "@src/Components/BlackWhiteList/BlackWhiteListInterface";
import BlackWhiteList from "@src/Components/BlackWhiteList/BlackWhiteList";
import Cache from "@src/Components/Cache/Cache";
import CacheInterface from "@src/Components/Cache/CacheInterface";
import Extractor from "@src/Components/Extractor/Extractor";
import ExtractorInterface from "@src/Components/Extractor/Interfaces/ExtractorInterface";
import StrategyInterface from "@src/Components/Extractor/Interfaces/StrategyInterface";
import LiteralStrategy from "@src/Components/Extractor/LiteralStrategy";

const Container = new _Container();
Container.bind<DispatcherInterface<any>>(TYPES.dispatcher).to(Dispatcher).inSingletonScope();
Container.bind<string>(TYPES.template).toConstantValue('title');
Container.bind<string>(TYPES['template.pattern']).toConstantValue('(?<placeholder>{{(\\w|\\s)+?}})');
Container.bind<ResolverInterface>(TYPES.resolver).to(ResolverSync).whenTargetNamed('sync');
Container.bind<FilterInterface>(TYPES.filter).to(ExtensionFilter);
Container.bind<FilterInterface>(TYPES.filter).to(PathListFilter);
Container.bind<BlackWhiteListInterface>(TYPES["component.black_white_list"]).to(BlackWhiteList).inSingletonScope();
Container.bind<CacheInterface>(TYPES.cache).to(Cache);
Container.bind<ExtractorInterface>(TYPES['component.extractor']).to(Extractor);
Container.bind<interfaces.Factory<string[]>>(TYPES['factory.meta']).toFactory(context => (path: string) => ({private_template: 'r_private_template'}))
Container.bind<StrategyInterface>(TYPES['component.extractor.strategy']).to(LiteralStrategy);
//START CREATOR
bindCreator(Container);
//END CREATOR

export default Container;