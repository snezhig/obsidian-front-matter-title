import {TAbstractFile, Workspace} from "obsidian";
import Resolver from "../Resolver/Resolver";
import Manager from "./Manager";
import MarkdownManager from "./MarkdownManager";
import GraphManager from "./GraphManager";
import {Leaves} from "../../enum";
import ExplorerManager from "./ExplorerManager";

type ManagerType = Leaves;

export default class Composer {
    private managers = new Map<ManagerType, Manager>();

    constructor(
        ws: Workspace,
        rs: Resolver,
    ) {
        this.managers
            .set(Leaves.MD, new MarkdownManager(ws, rs))
            .set(Leaves.G, new GraphManager(ws, rs))
            .set(Leaves.FE, new ExplorerManager(ws, rs))
    }

    public update(file?: TAbstractFile, type?: ManagerType): Promise<{ manager: Leaves, result: boolean }[]> {
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

    private determine(type?: ManagerType): Iterable<[Leaves, Manager]> {
        return type ? [[type, this.managers.get(type)]] : this.managers;
    }
}