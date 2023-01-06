import { inject, injectable } from "inversify";
import { SettingsType } from "../../SettingsType";
import AbstractBuilder from "../AbstractBuilder";
import SI from "@config/inversify.types";
import { SettingsBuilderFactory } from "../../../../config/inversify.factory.types";

@injectable()
export default class RulesBuiler extends AbstractBuilder<SettingsType, "rules"> {
    constructor(
        @inject(SI["factory:settings:builder"])
        private factory: SettingsBuilderFactory
    ) {
        super();
    }
    public doBuild(): void {
        this.container.createEl("h4", { text: "Rules" });
        const builders = this.factory<SettingsType["rules"]>("rules");
        for (const key of this.orderedKeys) {
            for (const builder of builders) {
                builder.support(key) &&
                    builder.build({
                        name: key,
                        container: this.container,
                        item: this.item.get(key),
                    });
            }
        }
    }

    private get orderedKeys(): (keyof SettingsType["rules"])[] {
        return ["paths", "delimiter"];
    }

    support(k: keyof SettingsType): boolean {
        return k === "rules";
    }
}
