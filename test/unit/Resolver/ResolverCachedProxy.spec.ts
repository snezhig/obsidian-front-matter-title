import CacheInterface from "@src/Components/Cache/CacheInterface";
import CacheItemInterface from "@src/Components/Cache/CacheItemInterface";
import Event from "@src/Components/EventDispatcher/Event";
import EventDispatcherInterface, {
    Callback,
} from "@src/Components/EventDispatcher/Interfaces/EventDispatcherInterface";
import ResolverCachedProxy from "@src/Resolver/ResolverCachedProxy";
import { ResolverEvents } from "@src/Resolver/ResolverType";
import { mock } from "jest-mock-extended";
import { AppEvents } from "@src/Types";
import { ResolverDynamicInterface } from "@src/Resolver/Interfaces";
import { CachedMetadata } from "obsidian";

const mockCacheItem = mock<CacheItemInterface<string | null>>();
mockCacheItem.set.mockReturnThis();
const mockCache = mock<CacheInterface>();
mockCache.getItem.mockReturnValue(mockCacheItem);

const mockDispatcher = mock<EventDispatcherInterface<ResolverEvents & AppEvents>>();
const mockResolver = mock<ResolverDynamicInterface>();

let metadataCacheChangedCallback: Callback<AppEvents["metadata:cache:changed"]> = null;
let fileRenameCallback: Callback<AppEvents["file:rename"]> = null;
let clearCallback: Callback<ResolverEvents["resolver:clear"]> = null;

mockDispatcher.addListener.mockImplementation(({ name, cb }) => {
    switch (name) {
        case "metadata:cache:changed":
            metadataCacheChangedCallback = cb;
            break;
        case "resolver:clear":
            clearCallback = cb;
            break;
        case "file:rename":
            fileRenameCallback = cb;
            break;
        default:
            throw new Error(`Event ${name} is not expected`);
    }
    return { getName: () => name };
});

describe("Test cached proxy", () => {
    const path = "path/to/file.md";
    const expected = "foo";

    mockCacheItem.getKey.mockReturnValue(path);
    const cached: ResolverDynamicInterface = new ResolverCachedProxy(mockResolver, mockCache, mockDispatcher);

    beforeEach(() => {
        mockResolver.resolve.mockClear();
        mockCache.save.mockClear();
        mockCacheItem.set.mockClear();
    });

    test("Should add 2 new listeners", () => {
        expect(mockDispatcher.addListener).toBeCalledTimes(3);
        expect(mockDispatcher.addListener).toBeCalledWith({
            name: "metadata:cache:changed",
            cb: expect.anything(),
            sort: 0,
        });
        expect(mockDispatcher.addListener).toBeCalledWith({ name: "file:rename", cb: expect.anything() });
        expect(mockDispatcher.addListener).toBeCalledWith({ name: "resolver:clear", cb: expect.anything(), sort: 0 });
    });

    test("Should call original resolver and save value", () => {
        mockCacheItem.isHit.mockReturnValueOnce(false);
        mockCacheItem.get.mockReturnValueOnce(expected);
        mockResolver.resolve.mockReturnValueOnce(expected);
        const actual = cached.resolve(path);
        expect(actual).toEqual(expected);
        expect(mockResolver.resolve).toBeCalledTimes(1);
        expect(mockResolver.resolve).toBeCalledWith(path);
        expect(mockCache.save).toBeCalledTimes(1);
        expect(mockCache.save).toHaveBeenCalledWith(mockCacheItem);
        expect(mockCacheItem.set).toHaveBeenCalledWith(expected);
    });

    test("Should not call original resolver, because the value is cached", () => {
        mockCacheItem.isHit.mockReturnValueOnce(true);
        mockCacheItem.get.mockReturnValueOnce(expected);
        const actual = cached.resolve(path);
        expect(actual).toEqual(expected);
        expect(mockResolver.resolve).not.toHaveBeenCalled();
        expect(mockCache.save).not.toHaveBeenCalled();
    });

    test("Should not dispatch 'resolver:unresolved' event and does not actualize title", () => {
        mockCacheItem.isHit.mockReturnValueOnce(false);
        metadataCacheChangedCallback(new Event({ path, cache: mock<CachedMetadata>() }));
        expect(mockDispatcher.dispatch).not.toHaveBeenCalled();
        expect(mockResolver.resolve).not.toHaveBeenCalled();
    });

    test('Should actualize title, but without dispatching "resolver:unresolved" event', () => {
        mockCacheItem.isHit.mockReturnValueOnce(true);
        mockCacheItem.get.mockReturnValueOnce(expected);
        mockCacheItem.set.mockImplementationOnce((v: string) => {
            mockCacheItem.get.mockReturnValueOnce(v);
            return mockCacheItem;
        });
        mockResolver.resolve.mockReturnValueOnce(expected);
        metadataCacheChangedCallback(new Event({ path, cache: mock<CachedMetadata>() }));
        expect(mockDispatcher.dispatch).not.toHaveBeenCalled();
        expect(mockResolver.resolve).toHaveBeenCalledTimes(1);
        expect(mockResolver.resolve).toHaveBeenCalledWith(path);
    });

    test('Should actualize title and dispatch "resolver:unresolved" event', () => {
        mockCacheItem.isHit.mockReturnValueOnce(true);
        mockCacheItem.get.mockReturnValueOnce(expected);
        mockCacheItem.set.mockImplementationOnce((v: string) => {
            mockCacheItem.get.mockReturnValueOnce(v);
            return mockCacheItem;
        });
        mockResolver.resolve.mockReturnValueOnce("bar");
        metadataCacheChangedCallback(new Event({ path, cache: mock<CachedMetadata>() }));
        expect(mockDispatcher.dispatch).toHaveBeenCalledTimes(1);
        expect(mockDispatcher.dispatch).toHaveBeenCalledWith("resolver:unresolved", new Event({ path }));
        expect(mockResolver.resolve).toHaveBeenCalledTimes(1);
        expect(mockResolver.resolve).toHaveBeenCalledWith(path);
    });

    test("Should clear cache", () => {
        expect(mockCache.clear).not.toHaveBeenCalled();
        clearCallback(null);
        expect(mockCache.clear).toHaveBeenCalledTimes(1);
    });
});
