import { inject, injectable } from "inversify";
import SI from "@config/inversify.types";
import { ObsidianMetaFactory } from "@config/inversify.factory.types";
import AbstractPlaceholder from "./AbstractPlaceholder";

@injectable()
export default class HeadingPlaceholder extends AbstractPlaceholder {
    constructor(
        @inject(SI["factory:obsidian:meta"])
        private factory: ObsidianMetaFactory
    ) {
        super();
    }

    makeValue(path: string): string {
        const headings = this.factory(path, "headings") ?? [];
        const match = this.placeholder.match(/^#h([1-6])$/);
        if (match) {
            const level = Number(match[1]);
            const found = headings.find(
                (h: { level: number; heading: string }) => h.level === level
            );
            return found?.heading ?? "";
        }
        return headings[0]?.heading ?? "";
    }
}
