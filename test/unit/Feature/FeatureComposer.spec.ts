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
const mockFactory = jest.fn(() => null);

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
    test("Should enable feature", () => {
        mockFactory.mockReturnValueOnce(mockFeatureFoo);
        composer.toggle("foo", true);
        expect(composer.get("foo")).toEqual(mockFeatureFoo);
        expect(mockFactory).toHaveBeenCalledTimes(1);
        expect(mockFactory).toHaveBeenCalledWith("foo");
        expect(mockFeatureFoo.enable).toHaveBeenCalledTimes(1);
        expect(mockDispatcher.dispatch).toHaveBeenCalledTimes(1);
        expect(mockDispatcher.dispatch).toHaveBeenCalledWith("feature:enable", new Event({ feature: mockFeatureFoo }));
    });

    test("Should disable feature", () => {
        composer.toggle("foo", false);
        expect(mockFactory).not.toHaveBeenCalled();
        expect(mockFeatureFoo.disable).toHaveBeenCalledTimes(1);
        expect(mockDispatcher.dispatch).not.toHaveBeenCalled();
    });
});

test("Should disable all features", () => {
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
