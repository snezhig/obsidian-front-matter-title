import 'reflect-metadata';
import {Container as _Container, interfaces} from 'inversify';
import DispatcherInterface from "../src/EventDispatcher/Interfaces/DispatcherInterface";
import Dispatcher from "../src/EventDispatcher/Dispatcher";
import SI from "./inversify.types";
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
Container.bind<DispatcherInterface<any>>(SI.dispatcher).to(Dispatcher).inSingletonScope();
Container.bind<string>(SI.template).toConstantValue('title');
Container.bind<string>(SI['template.pattern']).toConstantValue('(?<placeholder>{{(\\w|\\s)+?}})');
Container.bind<ResolverInterface>(SI.resolver).to(ResolverSync).whenTargetNamed('sync');
Container.bind<FilterInterface>(SI.filter).to(ExtensionFilter);
Container.bind<FilterInterface>(SI.filter).to(PathListFilter);
Container.bind<BlackWhiteListInterface>(SI["component.black_white_list"]).to(BlackWhiteList).inSingletonScope();
Container.bind<CacheInterface>(SI.cache).to(Cache);
Container.bind<ExtractorInterface>(SI['component.extractor']).to(Extractor);
Container.bind<StrategyInterface>(SI['component.extractor.strategy']).to(LiteralStrategy);

Container.bind<interfaces.Factory<{[k: string]: any}>>(SI['factory.meta'])
    .toFactory<{[k: string]: any}, [string]>(context => (path: string) => {throw new Error('Factory for meta is not defined')})
//START CREATOR
bindCreator(Container);
//END CREATOR

export default Container;