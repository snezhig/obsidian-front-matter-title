import GraphManager from "../../../../src/Title/Manager/GraphManager";
import { GraphLeaf, GraphNode, GraphView, TFile, Workspace } from "obsidian";
import { expect } from "@jest/globals";
import Queue from "../../../../src/Utils/Queue";
import Resolver from "../../../../src/Title/Resolver/Resolver";
import { Leaves } from "../../../../src/enum";
import FunctionReplacer from "../../../../src/Utils/FunctionReplacer";

jest.mock("../../../../src/Title/Resolver/Resolver");
jest.spyOn<any, "setTimeout">(global, "setTimeout");

Array.prototype.first = function () {
    return this[0];
};

const mocks = {
    resolver: {
        resolve: jest.spyOn<Resolver, any>(Resolver.prototype, "resolve").mockImplementation(async () => {
            resolvedTitle = Math.random().toString();
            return resolvedTitle;
        }),
        isSupported: jest.spyOn<Resolver, any>(Resolver.prototype, "isSupported").mockImplementation(() => true),
    },
    workspace: {
        getLeavesOfType: jest
            .spyOn<Workspace, any>(Workspace.prototype, "getLeavesOfType")
            .mockImplementation(() => []),
        on: jest.spyOn<Workspace, "on">(Workspace.prototype, "on"),
    },
    getDisplayText: jest.spyOn(GraphNode.prototype, "getDisplayText").mockImplementation(() => nodeText),
    onIframeLoad: jest.fn().mockImplementation(function () {
        this.nodes.forEach((e: GraphNode) => e.getDisplayText());
    }),
};
let resolvedTitle: string = null;
const nodeText = "graph-node-text";
const createNode = (): GraphNode => {
    const node = new GraphNode();
    node.id = nodeText;
    return node;
};
const createLeaf = (): GraphLeaf => {
    const leaf = Object.create(GraphLeaf.prototype) as GraphLeaf;
    leaf.view = {
        renderer: {
            onIframeLoad: mocks.onIframeLoad,
        },
    } as unknown as GraphView;
    return leaf;
};
let lastQueueAdd: Promise<void> = null;
jest.spyOn<Queue<unknown, void>, any>(Queue.prototype, "add").mockImplementation(function (v: unknown) {
    this.items.add(v);
    lastQueueAdd = this.cb();
    return lastQueueAdd;
});

const graph = new GraphManager(Object.create(Workspace.prototype), Object.create(Resolver.prototype));

/**
 * TODO: rewrite test
 * Create independent cases, more readable
 */

describe("Graph Titles Test", () => {
    describe("Graph init flow test", () => {
        afterAll(() => {
            mocks.workspace.getLeavesOfType.mockReturnValue([]);
            mocks.resolver.resolve.mockClear();
            graph.disable();
        });
        test("Graph will not be enabled", () => {
            expect(graph.isEnabled()).toBeFalsy();
            graph.enable();
            expect(graph.isEnabled()).toBeTruthy();
        });

        test("Bind to layout-change only one time", async () => {
            await graph.enable();
            await graph.enable();
            expect(mocks.workspace.on).toHaveBeenCalledTimes(1);
        });

        test("Iframe has not been updated yet", () => {
            expect(mocks.onIframeLoad).not.toHaveBeenCalled();
        });

        test("Times has been started", async () => {
            mocks.workspace.getLeavesOfType.mockReturnValue([{}]);
            const promise = graph.enable();
            expect(setTimeout).toHaveBeenCalled();
            mocks.workspace.getLeavesOfType.mockReturnValue([]);
            await promise;
        });

        test("Iframe has been updated", async () => {
            expect(lastQueueAdd).toBeNull();
            const leaf = createLeaf();
            leaf.view.renderer.nodes = [createNode()];
            mocks.workspace.getLeavesOfType.mockImplementation((e: string) => (e === Leaves.G ? [leaf] : []));
            await graph.enable();
            expect(lastQueueAdd).not.toBeNull();
            await lastQueueAdd;
            expect(mocks.onIframeLoad).toHaveBeenCalledTimes(1);
        });
    });

    describe("Graph state test", () => {
        let node: GraphNode = null;
        let leaf: GraphLeaf = null;
        let file: TFile = new TFile();
        file.path = nodeText;

        beforeAll(() => {
            leaf = createLeaf();
            mocks.workspace.getLeavesOfType.mockImplementation((type: string) => (type === Leaves.G ? [leaf] : []));
        });

        beforeEach(() => {
            node = createNode();
            leaf.view.renderer.nodes = [node];
            lastQueueAdd = null;
            mocks.onIframeLoad.mockClear();
            mocks.getDisplayText.mockClear();
            mocks.resolver.resolve.mockClear();
        });

        describe("Graph is enabled", () => {
            test("Graph will be enabled", () => {
                graph.enable();
                expect(graph.isEnabled()).toBeTruthy();
            });

            test("Original function will be called once without resolving", async () => {
                mocks.resolver.isSupported.mockReturnValueOnce(false);
                expect(mocks.getDisplayText).not.toHaveBeenCalled();
                leaf.view.renderer.onIframeLoad();
                expect(mocks.onIframeLoad).toHaveBeenCalledTimes(1);
                expect(mocks.getDisplayText).toHaveBeenCalledTimes(1);
                expect(mocks.resolver.resolve).not.toHaveBeenCalled();
                expect(lastQueueAdd).toBeNull();
            });

            test("Title resolved and original will be called once", async () => {
                expect(lastQueueAdd).toBeNull();
                expect(mocks.onIframeLoad).not.toHaveBeenCalled();
                leaf.view.renderer.onIframeLoad();
                expect(lastQueueAdd).not.toBeNull();
                await lastQueueAdd;
                expect(node.getDisplayText()).toEqual(resolvedTitle);
                expect(mocks.getDisplayText).toHaveBeenCalledTimes(1);
                expect(mocks.resolver.resolve).toHaveBeenCalledTimes(1);
            });

            describe("Update test", () => {
                test("Iframe wil not be reloaded because title was not changed", async () => {
                    mocks.resolver.resolve.mockResolvedValueOnce(resolvedTitle);
                    await expect(graph.update(file)).resolves.toBeTruthy();
                    expect(lastQueueAdd).not.toBeNull();
                    await lastQueueAdd;
                    expect(mocks.onIframeLoad).not.toHaveBeenCalled();
                });
                test("Iframe will be reloaded", async () => {
                    await expect(graph.update(file)).resolves.toBeTruthy();
                    expect(lastQueueAdd).not.toBeNull();
                    await lastQueueAdd;
                    expect(mocks.onIframeLoad).toHaveBeenCalledTimes(1);
                });

                test("Original will be called because of resolving reject", async () => {
                    mocks.resolver.resolve.mockRejectedValueOnce(new Error());
                    await expect(graph.update(file)).resolves.toBeTruthy();
                    expect(lastQueueAdd).not.toBeNull();
                    await lastQueueAdd;
                    expect(mocks.onIframeLoad).toHaveBeenCalledTimes(1);
                    expect(mocks.getDisplayText).toHaveBeenCalledTimes(1);
                });

                test("Text has been updated inspire of there is not leaf", async () => {
                    const title = "update without existing leaves";
                    mocks.resolver.resolve.mockResolvedValueOnce(title);
                    mocks.workspace.getLeavesOfType.mockReturnValueOnce([]);
                    await graph.update(file);
                    expect(lastQueueAdd).toBeNull();
                    leaf.view.renderer.onIframeLoad();
                    expect(lastQueueAdd).not.toBeNull();
                    await lastQueueAdd;
                    expect(mocks.resolver.resolve).toHaveBeenCalledTimes(1);
                    expect(node.getDisplayText()).toEqual(title);
                });
            });
        });

        test("Graph disabled", async () => {
            mocks.getDisplayText.mockClear();
            graph.disable();
            expect(lastQueueAdd).toBeNull();
            expect(graph.isEnabled()).toBeFalsy();
            expect(mocks.onIframeLoad).toHaveBeenCalled();
            expect(mocks.getDisplayText).toBeCalledTimes(1);
            expect(node.getDisplayText()).toEqual(nodeText);
        });
    });
});
``;
