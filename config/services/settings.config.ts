import {interfaces} from "inversify";
import Container = interfaces.Container;
import SI from "@config/inversify.types";
import DefaultBuilder from "@src/Settings/FeatureBuilder/DefaultBuilder";
import AliasBuilder from "@src/Settings/FeatureBuilder/AliasBuilder";
import {Feature} from "@src/enum";
import {SettingsFeatureBuildFactory} from "@config/inversify.factory.types";
import ExplorerSortBuilder from "@src/Settings/FeatureBuilder/ExplorerSortBuilder";

export default (c: Container) => {
    c.bind(SI["settings:feature:builder"]).toDynamicValue( () => new DefaultBuilder()).whenTargetNamed('default')
    c.bind(SI["settings:feature:builder"]).toDynamicValue( () => new AliasBuilder()).whenTargetNamed(Feature.Alias)
    c.bind(SI["settings:feature:builder"]).toDynamicValue( () => new ExplorerSortBuilder()).whenTargetNamed(Feature.ExplorerSort)
    c.bind<SettingsFeatureBuildFactory>(SI["factory:settings:feature:builder"]).toFunction((name: string) => c.isBoundNamed(SI["settings:feature:builder"], name) ? c.getNamed(SI["settings:feature:builder"], name) : null);
};