import {interfaces} from "inversify";
import Container = interfaces.Container;
import SI from "@config/inversify.types";
import FeatureInterface from "@src/Interfaces/FeatureInterface";
import {AliasModifier} from "@src/Components/MetadataCacheAlias/AliasModifier";
import EnsureStrategy from "@src/Components/MetadataCacheAlias/Strategy/EnsureStrategy";
import AdjustStrategy from "@src/Components/MetadataCacheAlias/Strategy/AdjustStrategy";
import ReplaceStrategy from "@src/Components/MetadataCacheAlias/Strategy/ReplaceStrategy";
import AliasModifierStrategyInterface
    from "@src/Components/MetadataCacheAlias/Interfaces/AliasModifierStrategyInterface";
import ExplorerManager from "@src/Feature/Explorer/ExplorerManager";
import FeatureComposer from "@src/Feature/FeatureComposer";
import ExplorerSort from "@src/Feature/Explorer/ExplorerSort";
import ManagerComposer from "@src/Feature/ManagerComposer";

export default (container: Container) => {
    container.bind(SI["feature:composer"]).to(FeatureComposer).inSingletonScope();
    container.bind(SI["manager:composer"]).to(ManagerComposer).inSingletonScope();
    container.bind(SI["factory:feature"]).toAutoNamedFactory<FeatureInterface<any>>(SI.feature);
    container.bind<FeatureInterface<any>>(SI.feature).to(AliasModifier).whenTargetNamed(AliasModifier.getId());
    container.bind<FeatureInterface<any>>(SI.feature).to(ExplorerManager).whenTargetNamed(ExplorerManager.getId());
    container.bind<FeatureInterface<any>>(SI.feature).to(ExplorerSort).whenTargetNamed(ExplorerSort.getId());


    container.bind(SI['alias:modifier:strategy']).to(EnsureStrategy).whenTargetNamed('ensure');
    container.bind(SI['alias:modifier:strategy']).to(AdjustStrategy).whenTargetNamed('adjust');
    container.bind(SI['alias:modifier:strategy']).to(ReplaceStrategy).whenTargetNamed('replace');
    container.bind(SI["factory:alias:modifier:strategy"]).toAutoNamedFactory<AliasModifierStrategyInterface>(SI['alias:modifier:strategy']);
}