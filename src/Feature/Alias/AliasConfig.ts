import { SettingsType, SF } from "@src/Settings/SettingsType";
import Storage from "@src/Storage/Storage";
import { ObjectItemInterface } from "@src/Storage/Interfaces";
import { Feature } from "@src/enum";
import { inject, injectable } from "inversify";
import SI from "@config/inversify.types";
import { StrategyType, ValidatorType } from "@src/Feature/Alias/Types";

@injectable()
export default class AliasConfig {
    constructor(
        @inject(SI["settings:storage"])
        private storage: Storage<SettingsType>
    ) {}

    private get config(): ObjectItemInterface<SF[Feature.Alias]> {
        return this.storage.get("features").get(Feature.Alias);
    }

    public getStrategy(): StrategyType {
        return this.config.get("strategy").value();
    }

    public getValidator(): ValidatorType {
        return this.config.get("validator").value();
    }
}
