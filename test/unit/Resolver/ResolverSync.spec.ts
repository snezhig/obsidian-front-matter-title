import { mock, mockClear } from "jest-mock-extended";
import FilterInterface from "../../../src/Interfaces/FilterInterface";
import CreatorInterface from "../../../src/Interfaces/CreatorInterface";
import ResolverSync from "../../../src/Resolver/ResolverSync";
import { expect } from "@jest/globals";
import { ResolverEvents } from "@src/Resolver/ResolverType";
import Event from "@src/Components/EventDispatcher/Event";
import EventDispatcherInterface from "@src/Components/EventDispatcher/Interfaces/EventDispatcherInterface";

describe("Resolver Sync Test", () => {
    const path = "/test/path/file.md";
    const title = "resolved_title";

    const filter = mock<FilterInterface>();
    const creator = mock<CreatorInterface>();

    const dispatcher = mock<EventDispatcherInterface<ResolverEvents>>();

    const resolver = new ResolverSync([filter], creator, dispatcher);

    afterEach(() => {
        mockClear(filter);
        mockClear(creator);
    });

    describe("Test filters", () => {
        beforeAll(() => {
            creator.create.mockReturnValue(title);
        });

        test("Should return null because filter will return false", () => {
            filter.check.mockReturnValueOnce(false);
            expect(resolver.resolve(path)).toBeNull();
            expect(filter.check).toHaveBeenNthCalledWith(1, path);
        });
        test("Should return value because filter will return true", () => {
            filter.check.mockReturnValue(true);
            expect(resolver.resolve(path)).toEqual(title);
            expect(filter.check).toHaveBeenNthCalledWith(1, path);
        });

        afterAll(() => {
            filter.check.mockRestore();
            creator.create.mockRestore();
        });
    });

    describe("Test creator", () => {
        beforeAll(() => {
            filter.check.mockReturnValue(true);
            creator.create.mockReturnValue(title);
        });
        beforeEach(() => dispatcher.dispatch.mockClear());
        test("Case when cache item is not hit", () => {
            expect(resolver.resolve(path)).toEqual(title);
            expect(creator.create).toHaveBeenNthCalledWith(1, path);
            expect(dispatcher.dispatch).toHaveBeenCalledTimes(1);
            expect(dispatcher.dispatch).toHaveBeenCalledWith(
                "resolver:resolved",
                new Event(expect.objectContaining({ value: title }))
            );
        });

        test("Should return modified value by event", () => {
            dispatcher.dispatch.mockImplementationOnce((name, event) => {
                if (name === "resolver:resolved") {
                    //@ts-expect-error
                    event.get().modify("bar");
                    return;
                }
                throw new Error(`Event ${name} is not expected`);
            });
            expect(resolver.resolve(path)).toEqual("bar");
            expect(creator.create).toHaveBeenNthCalledWith(1, path);
            expect(dispatcher.dispatch).toHaveBeenCalledTimes(1);
            expect(dispatcher.dispatch).toHaveBeenCalledWith(
                "resolver:resolved",
                new Event(expect.objectContaining({ value: "bar" }))
            );
        });
    });

    describe("Throw exception", () => {
        const consoleError = console.error;
        const error = new Error();
        beforeAll(() => {
            console.error = jest.fn();
        });
        test("Should not save item to cache", () => {
            creator.create.mockImplementation(() => {
                throw new Error();
            });
            expect(resolver.resolve("/path/to/file_exception.md")).toBeNull();
            expect(creator.create).toHaveBeenCalledTimes(1);
            expect(console.error).toHaveBeenCalledTimes(1);
            expect(console.error).toHaveBeenCalledWith(expect.anything(), error);
        });
        afterAll(() => {
            creator.create.mockClear();
            console.error = consoleError;
        });
    });
});
