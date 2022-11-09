import { mock } from "jest-mock-extended";
import AliasManagerStrategyInterface from "@src/Feature/Alias/Interfaces/AliasManagerStrategyInterface";
import { MetadataCacheFactory } from "@config/inversify.factory.types";
import { FrontMatterCache, MetadataCache, MetadataCacheExt, Pos } from "obsidian";
import { AliasManager } from "@src/Feature/Alias/AliasManager";
import LoggerInterface from "@src/Components/Debug/LoggerInterface";

const mockStrategy = mock<AliasManagerStrategyInterface>();
const mockStrategyFactory = jest.fn(() => mockStrategy);
const mockCache = mock<MetadataCacheExt>();
const mockCacheFactory = jest.fn(() => mockCache);
const manager = new AliasManager(mockStrategyFactory, mock<LoggerInterface>(), mockCacheFactory);
const fooPath = "path/to/foo.md";
const barPath = "path/to/bar.md";
describe("Test disabled state", () => {
    test("Should not call dependencies", async () => {
        expect(manager.isEnabled()).toBeFalsy();
        await manager.update("path/to/file.md");
        await manager.refresh();
        await manager.disable();
        expect(mockCacheFactory).not.toHaveBeenCalled();
    });
});
test("Set strategy", () => {
    manager.setStrategy("strategy_name");
    expect(mockStrategyFactory).toHaveBeenCalledTimes(1);
    expect(mockStrategyFactory).toHaveBeenCalledWith("strategy_name");
    expect(mockStrategyFactory).toHaveReturnedWith(mockStrategy);
});

describe("Test enabled state", () => {
    test("Should be enabled", () => {
        manager.enable();
        expect(manager.isEnabled()).toBeTruthy();
    });

    test("Should update alias", async () => {
        const value = "bar";
        mockStrategy.process.mockImplementationOnce(alias => {
            alias.setValue(value);
        });
        const cache = { frontmatter: { position: mock<Pos>() } as FrontMatterCache };
        mockCache.getCachedFiles.mockReturnValueOnce([barPath]);
        mockCache.getCache.mockReturnValueOnce(cache);
        expect(await manager.update(barPath)).toBeTruthy();
        expect(cache.frontmatter).toHaveProperty("alias");
        expect(cache.frontmatter.alias).toEqual(value);
        expect(mockCacheFactory).toHaveBeenCalledTimes(1);
        expect(mockCache.getCache).toHaveBeenCalledTimes(1);
        expect(mockCache.getCache).toHaveBeenCalledWith(barPath);
        expect(mockStrategy.process).toHaveBeenCalledTimes(1);
    });
});
