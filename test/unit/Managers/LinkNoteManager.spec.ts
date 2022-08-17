import LinkNoteManager from "@src/Managers/LinkNoteManager";
import {mock} from "jest-mock-extended";
import ResolverInterface from "@src/Interfaces/ResolverInterface";
import ObsidianFacade from "@src/Obsidian/ObsidianFacade";
import {LinkCache, MarkdownView, TFile, View, WorkspaceLeaf} from "obsidian";
import exp from "constants";

describe('Test test change', () => {
    const manager = new LinkNoteManager(mock<ObsidianFacade>(), mock<ResolverInterface>());
    test('Should be disabled by default', () => expect(manager.isEnabled()).toBeFalsy());
    test('Should be enabled after enable', () => {
        manager.enable();
        expect(manager.isEnabled()).toBeTruthy();
    })
    test('Should be disabled after disable', () => {
        manager.disable();
        expect(manager.isEnabled()).toBeFalsy();
    })
});

test('Should not call factory because of disabled', async () => {
    const factory = jest.fn();
    const manager = new LinkNoteManager(mock<ObsidianFacade>(), mock<ResolverInterface>());
    await expect(manager.update()).resolves.toBeFalsy();
    expect(factory).not.toHaveBeenCalled();
})

describe('Should not call resolved', () => {
    const path = '/path/to/file.md';
    const view = mock<MarkdownView>();
    view.file = {path} as TFile;
    const facade = mock<ObsidianFacade>();
    facade.getViewsOfType.mockReturnValue([]);
    const resolver = mock<ResolverInterface>();
    const manager = new LinkNoteManager(facade, resolver);
    const clear = () => {
        facade.getViewsOfType.mockClear();
        facade.getFileLinksCache.mockClear();
        facade.getFirstLinkpathDest.mockClear();
        // fileFactory.mockClear();
        // getter.mockClear()
    };
    beforeEach(clear);
    afterAll(clear);
    test('Should not call resolver and find links because there is no leaf', async () => {
        manager.enable();
        await expect(manager.update()).resolves.toBeFalsy();
        expect(facade.getViewsOfType).toHaveBeenCalledTimes(1);
        expect(facade.getFileLinksCache).not.toHaveBeenCalled();
        expect(resolver.resolve).not.toHaveBeenCalled();
    })
    test('Should not call resolver and find links because there is no file', async () => {
        facade.getViewsOfType.mockReturnValueOnce([{}] as View[]);
        await expect(manager.update()).resolves.toBeFalsy();
        expect(facade.getViewsOfType).toHaveBeenCalledTimes(1);
        expect(facade.getFileLinksCache).not.toHaveBeenCalled();
        expect(resolver.resolve).not.toHaveBeenCalled();
    });
    test('Should not call resolver and find link dest because there is no links', async () => {
        facade.getViewsOfType.mockReturnValueOnce([view]);
        facade.getFileLinksCache.mockReturnValueOnce([]);

        await expect(manager.update()).resolves.toBeFalsy();
        expect(facade.getViewsOfType).toHaveBeenCalledTimes(1);
        expect(facade.getFileLinksCache).toHaveBeenCalledTimes(1);
        expect(facade.getFileLinksCache).toHaveBeenCalledWith(path);
        expect(facade.getFirstLinkpathDest).not.toHaveBeenCalled();
        expect(resolver.resolve).not.toHaveBeenCalled();
    });

    test('Should not call resolver and find link dest because link is not [[link]] or [[link|name]]', async () => {
        const links = [
            {original: '[link](link)'},
            {original: ''},
            {original: '[link]'},
            {original: '[link|name]'},
        ] as LinkCache[];
        facade.getViewsOfType.mockReturnValueOnce([view]);
        facade.getFileLinksCache.mockReturnValueOnce(links);

        await expect(manager.update()).resolves.toBeFalsy();
        expect(facade.getViewsOfType).toHaveBeenCalledTimes(1);
        expect(facade.getFileLinksCache).toHaveBeenCalledTimes(1);
        expect(facade.getFileLinksCache).toHaveBeenCalledWith(path);
        expect(facade.getFirstLinkpathDest).not.toHaveBeenCalled();
        expect(resolver.resolve).not.toHaveBeenCalled();
    })

});