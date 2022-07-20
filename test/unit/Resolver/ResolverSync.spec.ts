import {DeepMockProxy, mock, mockDeep, MockProxy} from "jest-mock-extended";
import FilterInterface from "../../../src/Interfaces/FilterInterface";
import CacheInterface from "../../../src/Components/Cache/CacheInterface";
import CreatorInterface from "../../../src/Interfaces/CreatorInterface";
import ResolverSync from "../../../src/Resolver/ResolverSync";
import CacheItemInterface from "../../../src/Components/Cache/CacheItemInterface";
import {string} from "yaml/dist/schema/common/string";

describe('Resolver Sync Test', () => {
    const filter = mock<FilterInterface>();
    const creator = mock<CreatorInterface>();
    const cacheItem = mock<CacheItemInterface<string>>();
    cacheItem.get.mockReturnValue(null);
    cacheItem.isHit.mockReturnValue(false);
    const cache = mock<CacheInterface>(undefined, {deep: true});
    cache.getItem.mockReturnValue(cacheItem);
    const resolver = new ResolverSync([filter], cache, creator);

    test('Method calls', () => {
        const path = '/test/path/file.md';
        filter.check.mockReturnValueOnce(true);
        expect(resolver.resolve(path)).toBeNull();
        expect(filter.check).toHaveBeenNthCalledWith(1, path);
        expect(cache.getItem).toHaveBeenNthCalledWith(1, path);
        expect(cache.save).toHaveBeenCalledTimes(1);
        expect(creator.create).toHaveBeenNthCalledWith(1, path);
    })


})