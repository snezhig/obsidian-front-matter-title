import { injectable } from "inversify";
import { SettingsType } from "../../SettingsType";
import AbstractBuilder from "../AbstractBuilder";
import RulesDelimiterBuilder from "./RulesDelimiterBuilder";
import RulesPathsBuilder from "./RulesPathsBuilder";

@injectable()
export default class RulesBuiler extends AbstractBuilder<SettingsType, "rules"> {
    public doBuild(): void {
        this.container.createEl("h4", { text: "Rules" });
        this.buildRulePaths();
        this.buildRuleDelimiter();
    }

    private buildRulePaths(): void {
        new RulesPathsBuilder().build({
            name: "paths",
            item: this.item.get("paths"),
            container: this.container,
        });
    }

    private buildRuleDelimiter(): void {
        new RulesDelimiterBuilder().build({
            name: "delimiter",
            item: this.item.get("delimiter"),
            container: this.container,
        });
    }

    support(k: keyof SettingsType): boolean {
        return k === "rules";
    }
}
