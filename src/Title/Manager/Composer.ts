import {TAbstractFile, Workspace} from "obsidian";
import Resolver from "../Resolver/Resolver";
import Manager from "./Manager";
import MarkdownManager from "./MarkdownManager";
import GraphManager from "./GraphManager";
import ExplorerManager from "./ExplorerManager";
import QuickSwitcher from "./QuickSwitcher";
import ResolverAdapter from "../Resolver/ResolverAdapter";

export enum ManagerType {
    Graph = 'g',
    Explorer = 'e',
    Markdown = 'm',
    QuickSwitcher = 'qs'
}

export default class Composer {
    private managers = new Map<ManagerType, Manager>();

    constructor(
        ws: Workspace,
        rs: Resolver,
    ) {
        this.managers
            .set(ManagerType.Markdown, new MarkdownManager(ws, rs))
            .set(ManagerType.Graph, new GraphManager(ws, rs))
            .set(ManagerType.Explorer, new ExplorerManager(ws, rs))
            .set(ManagerType.QuickSwitcher, new QuickSwitcher(new ResolverAdapter(rs)))
    }

    public update(file?: TAbstractFile, type?: ManagerType): Promise<{ manager: ManagerType, result: boolean }[]> {
        const promises = [];
        for (const [t, manager] of this.determine(type)) {
            promises.push(manager.update(file).then(result => ({manager: t, result})));
        }
        return Promise.all(promises);
    }

    public setState(state: boolean, type?: ManagerType): void {
        const method: keyof Manager = state ? 'enable' : 'disable';
        for (const [, manager] of this.determine(type)) {
            manager[method]();
        }
    }

    private determine(type?: ManagerType): Iterable<[ManagerType, Manager]> {
        return type ? [[type, this.managers.get(type)]] : this.managers;
    }
}