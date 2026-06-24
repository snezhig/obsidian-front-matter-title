import { mock } from "jest-mock-extended";
import { AppEvents } from "@src/Types";
import FeatureInterface from "@src/Interfaces/FeatureInterface";
import FeatureComposer from "@src/Feature/FeatureComposer";
import Event from "@src/Components/EventDispatcher/Event";
import EventDispatcherInterface from "../../../src/Components/EventDispatcher/Interfaces/EventDispatcherInterface";
import LoggerInterface from "../../../src/Components/Debug/LoggerInterface";

const mockDispatcher = mock<EventDispatcherInterface<AppEvents>>();
const mockFeatureFoo = mock<FeatureInterface<any>>();
const mockFeatureBar = mock<FeatureInterface<any>>();
const mockFactory = jest.fn<FeatureInterface<any> | null, [string]>(() => null);

const composer = new FeatureComposer(mockFactory, mockDispatcher, mock<LoggerInterface>());

test("Should return null, because does not have a feature", () => {
    expect(composer.get("foo")).toBeNull();
});

test("Should not do anything because feature does not exist", () => {
    composer.toggle("foo", false);
    expect(mockFactory).not.toHaveBeenCalled();
    expect(mockDispatcher.dispatch).not.toHaveBeenCalled();
});

describe("Test toggle one feature", () => {
    beforeEach(() => {
        mockFactory.mockClear();
        mockDispatcher.dispatch.mockClear();
    });
    afterAll(() => {
        mockFeatureFoo.enable.mockClear();
        mockFeatureFoo.disable.mockClear();
    });
    test("Should start feature", () => {
        mockFactory.mockReturnValueOnce(mockFeatureFoo);
        composer.toggle("foo", true);
        expect(composer.get("foo")).toEqual(mockFeatureFoo);
        expect(mockFactory).toHaveBeenCalledTimes(1);
        expect(mockFactory).toHaveBeenCalledWith("foo");
        expect(mockFeatureFoo.enable).toHaveBeenCalledTimes(1);
        expect(mockDispatcher.dispatch).toHaveBeenCalledTimes(1);
        expect(mockDispatcher.dispatch).toHaveBeenCalledWith("feature:enable", new Event({ feature: mockFeatureFoo }));
    });

    test("Should stop feature", () => {
        composer.toggle("foo", false);
        expect(mockFactory).not.toHaveBeenCalled();
        expect(mockFeatureFoo.disable).toHaveBeenCalledTimes(1);
        expect(mockDispatcher.dispatch).not.toHaveBeenCalled();
    });
});

test("Should stop all features", () => {
    mockFactory.mockReturnValueOnce(mockFeatureFoo);
    mockFactory.mockReturnValueOnce(mockFeatureBar);
    composer.toggle("foo", true);
    composer.toggle("bar", true);
    composer.disableAll();
    expect(mockFeatureFoo.enable).toHaveBeenCalledTimes(1);
    expect(mockFeatureFoo.disable).toHaveBeenCalledTimes(1);
    expect(mockFeatureBar.enable).toHaveBeenCalledTimes(1);
    expect(mockFeatureBar.disable).toHaveBeenCalledTimes(1);
});

describe("Boot isolation: a failing feature must not crash the plugin", () => {
    let errorSpy: jest.SpyInstance;
    const isolated = new FeatureComposer(mockFactory, mockDispatcher, mock<LoggerInterface>());

    beforeEach(() => {
        mockFactory.mockReset();
        mockDispatcher.dispatch.mockClear();
        errorSpy = jest.spyOn(console, "error").mockImplementation(() => undefined);
    });
    afterEach(() => errorSpy.mockRestore());

    test("enable() throwing is swallowed, feature is rolled back, no dispatch", () => {
        const broken = mock<FeatureInterface<any>>();
        broken.enable.mockImplementation(() => {
            throw new Error("internal API changed");
        });
        mockFactory.mockReturnValueOnce(broken);

        expect(() => isolated.toggle("broken", true)).not.toThrow();
        expect(broken.disable).toHaveBeenCalledTimes(1); // best-effort rollback
        expect(isolated.get("broken")).toBeNull(); // removed
        expect(mockDispatcher.dispatch).not.toHaveBeenCalled();
    });

    test("disableAll() keeps going when one feature's disable() throws", () => {
        const bad = mock<FeatureInterface<any>>();
        const good = mock<FeatureInterface<any>>();
        bad.disable.mockImplementation(() => {
            throw new Error("boom");
        });
        mockFactory.mockReturnValueOnce(bad);
        mockFactory.mockReturnValueOnce(good);
        isolated.toggle("bad", true);
        isolated.toggle("good", true);

        expect(() => isolated.disableAll()).not.toThrow();
        expect(bad.disable).toHaveBeenCalledTimes(1);
        expect(good.disable).toHaveBeenCalledTimes(1);
    });
});
