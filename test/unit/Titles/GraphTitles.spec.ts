import GraphTitles from "../../../src/Titles/GraphTitles";
import FileTitleResolver from "../../../src/FileTitleResolver";
import {GraphLeaf, GraphNode, GraphView, TFile, Workspace} from "obsidian";
import {expect} from "@jest/globals";
import Queue from "../../../src/Utils/Queue";

jest.mock('../../../src/FileTitleResolver');

Array.prototype.first = function () {
    return this[0];
}

const mocks = {
    resolver: {
        resolve: jest.spyOn<FileTitleResolver, any>(FileTitleResolver.prototype, 'resolve').mockImplementation(async () => {
            resolvedTitle = Math.random().toString();
            return resolvedTitle;
        }),
        canBeResolved: jest.spyOn<FileTitleResolver, any>(FileTitleResolver.prototype, 'canBeResolved').mockImplementation(() => true),
        isResolved: jest.spyOn<FileTitleResolver, any>(FileTitleResolver.prototype, 'isResolved').mockImplementation(() => resolvedTitle !== null),
        getResolved: jest.spyOn<FileTitleResolver, any>(FileTitleResolver.prototype, 'getResolved').mockImplementation(() => resolvedTitle)
    },
    workspace: {
        getLeavesOfType: jest.spyOn<Workspace, any>(Workspace.prototype, 'getLeavesOfType').mockImplementation(() => [])
    },
    getDisplayText: jest.spyOn(GraphNode.prototype, 'getDisplayText').mockImplementation(() => nodeText),
    onIframeLoad: jest.fn().mockImplementation(function () {
        this.nodes.forEach((e: GraphNode) => e.getDisplayText());
    }),
}

let resolvedTitle: string = null;
const nodeText = 'graph-node-text';
const createNode = () => {
    const node = new GraphNode()
    node.id = nodeText;
    return node;
};

const graph = new GraphTitles(
    Object.create(Workspace.prototype),
    Object.create(FileTitleResolver.prototype)
);

describe('Graph Titles Test', () => {
    test('Graph will not be enabled', () => {
        expect(graph.isEnabled()).toBeFalsy();
        graph.enable();
        expect(graph.isEnabled()).toBeFalsy();
    })

    describe('Graph state test', () => {
        let node: GraphNode = null;
        let leaf: GraphLeaf = null;
        let file: TFile = new TFile();
        file.path = nodeText;

        let lastQueueAdd: Promise<void> = null;
        const queueAdd = jest.spyOn<Queue<unknown, void>, any>(Queue.prototype, 'add').mockImplementation(function (v: unknown) {
            this.items.add(v);
            lastQueueAdd = this.cb();
            return lastQueueAdd;
        })

        beforeAll(() => {
            leaf = Object.create(GraphLeaf.prototype) as GraphLeaf;
            leaf.view = {
                renderer: {
                    onIframeLoad: mocks.onIframeLoad
                }
            } as unknown as GraphView;
            mocks.workspace.getLeavesOfType.mockImplementation(() => [leaf]);
        })

        beforeEach(() => {
            node = createNode();
            leaf.view.renderer.nodes = [node];
            lastQueueAdd = null;
            mocks.onIframeLoad.mockClear();
            mocks.getDisplayText.mockClear();
        })

        describe('Graph is enabled', () => {
            test('Graph will be enabled', () => {
                graph.enable();
                expect(graph.isEnabled()).toBeTruthy();
            })

            test('Original function will be called once without resolving', async () => {
                mocks.resolver.canBeResolved.mockReturnValueOnce(false);
                expect(mocks.getDisplayText).not.toHaveBeenCalled();
                leaf.view.renderer.onIframeLoad();
                expect(mocks.onIframeLoad).toHaveBeenCalledTimes(1);
                expect(mocks.getDisplayText).toHaveBeenCalledTimes(1);
                expect(lastQueueAdd).toBeNull();
            })

            test('Title resolved and original will be called once', async () => {
                expect(lastQueueAdd).toBeNull();
                expect(mocks.onIframeLoad).not.toHaveBeenCalled();
                leaf.view.renderer.onIframeLoad();
                expect(lastQueueAdd).not.toBeNull();
                await lastQueueAdd;
                expect(node.getDisplayText()).toEqual(resolvedTitle);
                expect(mocks.getDisplayText).toHaveBeenCalledTimes(1);
                expect(mocks.resolver.resolve).toHaveBeenCalledTimes(1);
            })

            describe('Update test', () => {
                test('Iframe wil not be reloaded because title was not changed', async () => {
                    mocks.resolver.resolve.mockResolvedValueOnce(resolvedTitle);
                    await expect(graph.update(file)).resolves.toBeTruthy();
                    expect(lastQueueAdd).not.toBeNull();
                    await lastQueueAdd;
                    expect(mocks.onIframeLoad).not.toHaveBeenCalled();
                })
                test('Iframe will be reloaded', async () => {
                    await expect(graph.update(file)).resolves.toBeTruthy();
                    expect(lastQueueAdd).not.toBeNull();
                    await lastQueueAdd;
                    expect(mocks.onIframeLoad).toHaveBeenCalledTimes(1);
                })
            });
        });


        // test('Graph disabled', async () => {
        //     mocks.getDisplayText.mockClear();
        //     graph.disable();
        //     expect(lastQueueAdd).not.toBeNull();
        //     expect(graph.isEnabled()).toBeFalsy();
        //     await lastQueueAdd;
        //     expect(mocks.getDisplayText).toBeCalledTimes(1);
        //     expect(node.getDisplayText()).toEqual(nodeText);
        //     expect(mocks.getDisplayText).toBeCalledTimes(2);
        // });
    })


});