import { inject, injectable } from "inversify";
import SI from "@config/inversify.types";
import Storage from "@src/Storage/Storage";
import { SettingsType, SettingsFeature } from "@src/Settings/SettingsType";
import { ObjectItemInterface } from "@src/Storage/Interfaces";
import { Feature } from "@src/Enum";
import { NoteLinkStrategy } from "@src/Feature/NoteLink/NoteLinkTypes";

@injectable()
export default class NoteLinkConfig {
    constructor(
        @inject(SI["settings:storage"])
        private storage: Storage<SettingsType>
    ) {}

    public config(): ObjectItemInterface<SettingsFeature[Feature.NoteLink]> {
        return this.storage.get("features").get(Feature.NoteLink);
    }

    public get approval(): boolean {
        return this.config().get("approval").value();
    }
    public get strategy(): NoteLinkStrategy {
        return this.config().get("strategy").value();
    }
}
