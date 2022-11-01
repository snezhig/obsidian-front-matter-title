import {interfaces} from "inversify";
import Container = interfaces.Container;
import SI from "@config/inversify.types";
import FeatureInterface from "@src/Interfaces/FeatureInterface";
import ExplorerManager from "@src/Feature/Explorer/ExplorerManager";
import FeatureComposer from "@src/Feature/FeatureComposer";
import ExplorerSort from "@src/Feature/Explorer/ExplorerSort";
import ManagerComposer from "@src/Feature/ManagerComposer";
import SearchManager from "@src/Feature/Search/SearchManager";
import TabManager from "@src/Feature/Tab/TabManager";
import {AliasManager} from "@src/Feature/Alias/AliasManager";
import EnsureStrategy from "@src/Feature/Alias/Strategy/EnsureStrategy";
import AdjustStrategy from "@src/Feature/Alias/Strategy/AdjustStrategy";
import ReplaceStrategy from "@src/Feature/Alias/Strategy/ReplaceStrategy";
import AliasManagerStrategyInterface from "@src/Feature/Alias/Interfaces/AliasManagerStrategyInterface";

export default (container: Container) => {
    container.bind(SI["feature:composer"]).to(FeatureComposer).inSingletonScope();
    container.bind(SI["manager:composer"]).to(ManagerComposer).inSingletonScope();

    container.bind(SI["factory:feature"]).toAutoNamedFactory<FeatureInterface<any>>(SI.feature);
    container.bind<FeatureInterface<any>>(SI.feature).to(AliasManager).whenTargetNamed(AliasManager.getId());
    container.bind<FeatureInterface<any>>(SI.feature).to(ExplorerManager).whenTargetNamed(ExplorerManager.getId());
    container.bind<FeatureInterface<any>>(SI.feature).to(ExplorerSort).whenTargetNamed(ExplorerSort.getId());
    container.bind<FeatureInterface<any>>(SI.feature).to(SearchManager).whenTargetNamed(SearchManager.getId());
    container.bind<FeatureInterface<any>>(SI.feature).to(TabManager).whenTargetNamed(TabManager.getId());

    container.bind(SI["factory:alias:modifier:strategy"]).toAutoNamedFactory<AliasManagerStrategyInterface>(SI['alias:modifier:strategy']);
    container.bind(SI['alias:modifier:strategy']).to(EnsureStrategy).whenTargetNamed('ensure');
    container.bind(SI['alias:modifier:strategy']).to(AdjustStrategy).whenTargetNamed('adjust');
    container.bind(SI['alias:modifier:strategy']).to(ReplaceStrategy).whenTargetNamed('replace');
}