import { TAbstractFile, Workspace } from "obsidian";
import Manager from "./Manager";
import MarkdownManager from "./MarkdownManager";
import GraphManager from "./GraphManager";
import QuickSwitcher from "./QuickSwitcher";
import ResolverInterface, { Resolving } from "@src/Interfaces/ResolverInterface";

export enum ManagerType {
    Graph = "g",
    Explorer = "e",
    Markdown = "m",
    QuickSwitcher = "qs",
}

export default class Composer {
    private managers = new Map<ManagerType, Manager>();

    constructor(ws: Workspace, rss: ResolverInterface, rsa: ResolverInterface<Resolving.Async>) {
        this.managers
            .set(ManagerType.Markdown, new MarkdownManager(ws, rsa))
            .set(ManagerType.Graph, new GraphManager(ws, rsa))
            .set(ManagerType.QuickSwitcher, new QuickSwitcher(rss));
    }

    public update(file?: TAbstractFile, type?: ManagerType): Promise<{ manager: ManagerType; result: boolean }[]> {
        const promises = [];
        for (const [t, manager] of this.determine(type)) {
            promises.push(manager.update(file).then(result => ({ manager: t, result })));
        }
        return Promise.all(promises);
    }

    public setState(state: boolean, type?: ManagerType): void {
        const method: keyof Manager = state ? "enable" : "disable";
        for (const [, manager] of this.determine(type)) {
            manager[method]();
        }
    }

    private determine(type?: ManagerType): Iterable<[ManagerType, Manager]> {
        return type ? [[type, this.managers.get(type)]] : this.managers;
    }
}
