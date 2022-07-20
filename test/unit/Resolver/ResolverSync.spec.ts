import {mock, mockClear} from "jest-mock-extended";
import FilterInterface from "../../../src/Interfaces/FilterInterface";
import CacheInterface from "../../../src/Components/Cache/CacheInterface";
import CreatorInterface from "../../../src/Interfaces/CreatorInterface";
import ResolverSync from "../../../src/Resolver/ResolverSync";
import CacheItemInterface from "../../../src/Components/Cache/CacheItemInterface";
import {expect} from "@jest/globals";

describe('Resolver Sync Test', () => {
    const path = '/test/path/file.md';
    const title = 'resolved_title';

    const filter = mock<FilterInterface>();
    const creator = mock<CreatorInterface>();

    const cacheItem = mock<CacheItemInterface<string>>();
    cacheItem.get.mockReturnValue(null);
    cacheItem.isHit.mockReturnValue(false);
    const cache = mock<CacheInterface>(undefined, {deep: true});
    cache.getItem.mockReturnValue(cacheItem);

    const resolver = new ResolverSync([filter], cache, creator);

    afterEach(() => {
        mockClear(filter);
        mockClear(cacheItem);
        mockClear(cache);
        mockClear(creator);
    })

    describe('Test filters', () => {
        beforeAll(() => {
            cacheItem.isHit.mockReturnValue(false);
            creator.create.mockReturnValue(title);
        })

        test('Title will be null because filter will return false', () => {
            filter.check.mockReturnValueOnce(false);
            expect(resolver.resolve(path)).toBeNull();
            expect(filter.check).toHaveBeenNthCalledWith(1, path);
        })
        test('Title will be resolved because filter will return true', () => {
            filter.check.mockReturnValue(true);
            expect(resolver.resolve(path)).toEqual(title);
            expect(filter.check).toHaveBeenNthCalledWith(1, path);
        })

        afterAll(() => {
            filter.check.mockRestore();
            cacheItem.isHit.mockRestore();
            creator.create.mockRestore();

        })
    })

    describe('Test cache and creator', () => {
        beforeAll(() => {
            filter.check.mockReturnValue(true);
            creator.create.mockReturnValue(title);
        })
        test('Case when cache item is not hit', () => {
            cacheItem.isHit.mockReturnValue(false);
            expect(resolver.resolve(path)).toEqual(title);
            expect(cacheItem.set).toHaveBeenNthCalledWith(1, title);
            expect(cache.save).toHaveBeenCalledTimes(1);
            expect(cache.getItem).toHaveBeenCalledTimes(1);
            expect(creator.create).toHaveBeenNthCalledWith(1, path);
        })

        test('Cache when cache item is hit', () => {
            cacheItem.isHit.mockReturnValue(true);
            cacheItem.get.mockReturnValue(title);
            expect(resolver.resolve(path)).toEqual(title);
            expect(cacheItem.get).toHaveBeenCalledTimes(1);
            expect(creator.create).not.toHaveBeenCalled();
        })
    })


})