import 'reflect-metadata';
import {Container as _Container, interfaces} from 'inversify';
import SI from "./inversify.types";
import bindCreator from './services/creator.config';
import ResolverInterface, {Resolving} from "../src/Interfaces/ResolverInterface";
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
import ResolverAsync from "@src/Resolver/ResolverAsync";
import ArrayStrategy from "@src/Components/Extractor/ArrayStrategy";
import NullStrategy from "@src/Components/Extractor/NullStrategy";
import LoggerInterface from "@src/Components/Debug/LoggerInterface";
import LoggerComposer from "@src/Components/Debug/LoggerComposer";
import DispatcherInterface from "@src/Components/EventDispatcher/Interfaces/DispatcherInterface";
import Dispatcher from "@src/Components/EventDispatcher/Dispatcher";
import ExplorerManager from "@src/Managers/ExplorerManager";
import ExplorerSortFeature from "@src/Managers/Features/ExplorerSortFeature";
import ManagerInterface from "@src/Interfaces/ManagerInterface";
import Composer from "@src/Managers/Composer";
import FeatureInterface from "@src/Interfaces/FeatureInterface";
import {Feature} from "@src/enum";
import FeatureToggle from "@src/Managers/Features/FeatureToggle";
import App from "@src/App";

const Container = new _Container();
Container.bind<DispatcherInterface<any>>(SI.dispatcher).to(Dispatcher).inSingletonScope();
Container.bind<string>(SI['template:pattern']).toConstantValue('(?<placeholder>{{(\\w|\\s)+?}})');
Container.bind<ResolverInterface>(SI.resolver).to(ResolverSync).inSingletonScope().whenTargetNamed('sync');
Container.bind<ResolverInterface<Resolving.Async>>(SI.resolver).to(ResolverAsync).inSingletonScope().whenTargetNamed('async');
Container.bind<FilterInterface>(SI.filter).to(ExtensionFilter);
Container.bind<FilterInterface>(SI.filter).to(PathListFilter);
Container.bind<BlackWhiteListInterface>(SI["component:black_white_list"]).to(BlackWhiteList).inSingletonScope();
Container.bind<CacheInterface>(SI.cache).to(Cache);
Container.bind<ExtractorInterface>(SI['component:extractor']).to(Extractor);
Container.bind<StrategyInterface>(SI['component:extractor:strategy']).to(LiteralStrategy);
Container.bind<StrategyInterface>(SI['component:extractor:strategy']).to(ArrayStrategy);
Container.bind<StrategyInterface>(SI['component:extractor:strategy']).to(NullStrategy);

Container.bind(SI["logger:composer"]).to(LoggerComposer).inSingletonScope();
Container.bind<LoggerInterface>(SI.logger)
    .toDynamicValue(context => {
        return context.container.get<LoggerComposer>(SI['logger:composer']).create(context.currentRequest.target.getNamedTag().value)
    })
    .when(() => true);

Container.bind<ManagerInterface>(SI["manager"]).to(ExplorerManager);
Container.bind<FeatureInterface<Feature>>(SI.feature).to(ExplorerSortFeature).inSingletonScope();
Container.bind<FeatureToggle>(SI.feature_toggle).to(FeatureToggle).inSingletonScope();
Container.bind<Composer>(SI.composer).to(Composer);
//START CREATOR
bindCreator(Container);
//END CREATOR

export default Container;