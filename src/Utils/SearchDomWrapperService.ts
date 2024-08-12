import { SearchDOM } from "obsidian";
import { ResolverInterface } from "../Resolver/Interfaces";
import LoggerInterface from "../Components/Debug/LoggerInterface";
import { inject, injectable, named } from "inversify";
import SI from "../../config/inversify.types";
import ResultDomWrapper from "./ResultDomWrapper";

@injectable()
export default class SearchDomWrapperService {
    private entities: Map<string, Map<SearchDOM, ResultDomWrapper>> = new Map();
    private timer: number = null;

    constructor(
        @inject(SI.logger)
        @named(SearchDomWrapperService.name)
        private logger: LoggerInterface
    ) {}

    public wrapDom(dom: SearchDOM, resolver: ResolverInterface, tag: string): void {
        if (!this.entities.has(tag)) {
            this.entities.set(tag, new Map());
        }
        const tagged = this.entities.get(tag);
        if (!tagged.has(dom)) {
            const wrapper = new ResultDomWrapper(resolver, dom);
            tagged.set(dom, wrapper);
            this.logger.log(`Entity created`);
            this.runTimer();
        }
    }

    public destroyByTag(tag: string): void {
        if (!this.entities.has(tag)) {
            return;
        }
        for (const [dom, wrapper] of this.entities.get(tag)) {
            wrapper.disable();
            this.entities.get(tag).delete(dom);
        }
    }

    private runTimer(): void {
        if (this.timer) {
            clearTimeout(this.timer);
        }
        this.timer = window.setTimeout(this.selfClean.bind(this), 10000);
    }

    private selfClean(): void {
        this.timer = null;
        for (const [tag, entities] of this.entities) {
            this.logger.log(`Tag ${tag} has ${entities.size} entities before self-clean`);
            for (const [dom, wrapper] of entities) {
                if (!document.body.contains(dom.el)) {
                    wrapper.disable();
                    this.logger.log(`Dom from ${tag} tag has been removed`);
                    this.entities.get(tag).delete(dom);
                }
            }
            this.logger.log(`Tag ${tag} has ${entities.size} entities after self-clean`);
        }
    }
}
