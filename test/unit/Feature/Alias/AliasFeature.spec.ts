import { mock } from "jest-mock-extended";
import { CachedMetadata, FrontMatterCache, MetadataCacheExt, Pos } from "obsidian";
import { AliasFeature } from "@src/Feature/Alias/AliasFeature";
import LoggerInterface from "@src/Components/Debug/LoggerInterface";
import { Feature } from "@src/enum";
import { StrategyInterface, ValidatorInterface } from "@src/Feature/Alias/Interfaces";
import { StrategyType, ValidatorType } from "@src/Feature/Alias/Types";
import EventDispatcherInterface from "@src/Components/EventDispatcher/Interfaces/EventDispatcherInterface";
import { AppEvents } from "@src/Types";
import AliasConfig from "@src/Feature/Alias/AliasConfig";

const mockValidator = mock<ValidatorInterface>({ validate: jest.fn(() => true) });
const mockValidatorFactory = jest.fn(() => mockValidator);
const mockStrategy = mock<StrategyInterface>();
const mockStrategyFactory = jest.fn(() => mockStrategy);
const mockCache = mock<MetadataCacheExt>();
const mockCacheFactory = jest.fn(() => mockCache);
const mockDispatcher = mock<EventDispatcherInterface<AppEvents>>();
const mockConfig = mock<AliasConfig>();
const validatorType = ValidatorType.FrontmatterAuto;
const strategyType = StrategyType.Adjust;
const feature = new AliasFeature(
    mockStrategyFactory,
    mockValidatorFactory,
    mock<LoggerInterface>(),
    mockCacheFactory,
    mockDispatcher,
    mockConfig
);
const fooPath = "path/to/foo.md";
const barPath = "path/to/bar.md";
const quotePath = "path/to/quote.md";

describe("Test ID", () => {
    expect(feature.getId()).toEqual(Feature.Alias);
    expect(AliasFeature.getId()).toEqual(Feature.Alias);
});

test("Should be disabled", () => expect(feature.isEnabled()).toBeFalsy());
test("Should add listener, set validator, strategy and refresh", () => {
    const metadata = { frontmatter: { alias: "bar" } } as unknown as CachedMetadata;
    mockConfig.getValidator.mockReturnValueOnce(validatorType);
    mockConfig.getStrategy.mockReturnValueOnce(strategyType);
    mockCache.getCachedFiles.mockReturnValueOnce([fooPath]);
    mockCache.getCache.mockReturnValueOnce(metadata);
    mockValidator.validate.mockReturnValueOnce(false);
    feature.enable();
    expect(mockDispatcher.addListener).toBeCalledTimes(1);
    expect(mockDispatcher.addListener).toBeCalledWith({ name: "metadata:cache:changed", cb: expect.anything() });
    expect(mockValidatorFactory).toBeCalledTimes(1);
    expect(mockValidatorFactory).toBeCalledWith(validatorType);
    expect(mockStrategyFactory).toBeCalledTimes(1);
    expect(mockStrategyFactory).toBeCalledWith(strategyType);
    expect(mockCacheFactory).toBeCalledTimes(1);
    expect(mockCache.getCachedFiles).toBeCalledTimes(1);
    expect(mockCache.getCache).toHaveBeenCalledTimes(1);
    expect(mockCache.getCache).toHaveBeenCalledWith(fooPath);
    expect(mockValidator.validate).toHaveBeenCalledTimes(1);
    expect(mockValidator.validate).toHaveBeenCalledWith(metadata);
    expect(mockStrategy.process).not.toHaveBeenCalled();
});
//
// describe("Test enabled state", () => {
//     beforeEach(() => {
//         mockCache.getCache.mockClear();
//         mockCache.getCachedFiles.mockClear();
//         mockStrategy.process.mockClear();
//         mockCacheFactory.mockClear();
//         mockValidator.validate.mockClear();
//     });
//     test("Should be enabled", () => {
//         feature.enable();
//         expect(feature.isEnabled()).toBeTruthy();
//     });
//
//     test("Should set `bar` as alias by update", async () => {
//         const value = "bar";
//         mockStrategy.process.mockImplementationOnce(alias => alias.setValue(value));
//         const cache = {frontmatter: {position: mock<Pos>()} as FrontMatterCache};
//         mockCache.getCache.mockReturnValueOnce(cache);
//         expect(await feature.update(barPath)).toBeTruthy();
//         expect(cache.frontmatter).toHaveProperty("alias");
//         expect(cache.frontmatter.alias).toEqual(value);
//         expect(mockCacheFactory).toHaveBeenCalledTimes(1);
//         expect(mockCache.getCache).toHaveBeenCalledTimes(1);
//         expect(mockCache.getCache).toHaveBeenCalledWith(barPath);
//         expect(mockStrategy.process).toHaveBeenCalledTimes(1);
//         expect(mockValidator.validate).toHaveBeenCalledTimes(1);
//         expect(mockValidator.validate).toHaveBeenCalledWith(cache);
//     });
//     test("Should not update because validator returns false", async () => {
//         const cache = {};
//         mockCache.getCache.mockReturnValueOnce(cache);
//         mockValidator.validate.mockReturnValueOnce(false);
//         expect(await feature.update(fooPath)).toBeFalsy();
//         expect(cache).toEqual({});
//         expect(mockStrategy.process).not.toHaveBeenCalled();
//         expect(mockCache.getCache).toHaveBeenCalledTimes(1);
//         expect(mockCache.getCache).toHaveBeenCalledWith(fooPath);
//         expect(mockCacheFactory).toHaveBeenCalledTimes(1);
//         expect(mockValidator.validate).toHaveBeenCalledTimes(1);
//         expect(mockValidator.validate).toHaveBeenCalledWith(cache);
//     });
//
//     test("Should set aliases by refresh", async () => {
//         const values: { [k: string]: string } = {
//             [barPath]: "bar_value",
//             [fooPath]: "foo_value",
//             [quotePath]: undefined,
//         };
//         mockStrategy.process.mockImplementation((alias, path) => {
//             values[path] && alias.setValue(values[path]);
//         });
//         const caches: { [k: string]: CachedMetadata } = {
//             [barPath]: {frontmatter: {position: mock<Pos>()} as FrontMatterCache},
//             [fooPath]: {frontmatter: {position: mock<Pos>()} as FrontMatterCache},
//             [quotePath]: {frontmatter: {position: mock<Pos>()} as FrontMatterCache},
//         };
//         mockCache.getCachedFiles.mockReturnValueOnce([barPath, fooPath, quotePath]);
//         mockCache.getCache.mockImplementation(path => caches[path]);
//         expect(await feature.refresh()).toEqual({[barPath]: true, [fooPath]: true, [quotePath]: false});
//         expect(caches[barPath].frontmatter.alias).toEqual("bar_value");
//         expect(caches[fooPath].frontmatter.alias).toEqual("foo_value");
//         expect(caches[quotePath].frontmatter).not.toHaveProperty("alias");
//         expect(mockStrategy.process).toHaveBeenCalledTimes(3);
//         expect(mockCache.getCachedFiles).toHaveBeenCalledTimes(1);
//         expect(mockCache.getCache).toHaveBeenCalledTimes(3);
//         expect(mockCacheFactory).toHaveBeenCalledTimes(4);
//     });
// });
//
// test("Should restore after disable", async () => {
//     const value = "bar";
//     mockStrategy.process.mockImplementationOnce(alias => alias.setValue(value));
//     const cache = {frontmatter: {position: mock<Pos>()} as FrontMatterCache};
//     mockCache.getCache.mockReturnValueOnce(cache);
//     expect(cache.frontmatter.alias).not.toEqual("bar");
//     expect(await feature.update(fooPath)).toBeTruthy();
//     expect(cache.frontmatter.alias).toEqual("bar");
//     feature.disable();
//     expect(feature.isEnabled()).toBeFalsy();
//     expect(cache.frontmatter).not.toHaveProperty("alias");
// });
