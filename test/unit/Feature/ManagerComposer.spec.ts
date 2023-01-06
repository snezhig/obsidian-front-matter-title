import FeatureComposer from "@src/Feature/FeatureComposer";
import { mock } from "jest-mock-extended";
import ManagerComposer from "@src/Feature/ManagerComposer";
import LoggerInterface from "@src/Components/Debug/LoggerInterface";
import ManagerFeatureInterface from "@src/Interfaces/ManagerFeatureInterface";
import FeatureInterface from "@src/Interfaces/FeatureInterface";
import { AppEvents } from "../../../src/Types";
import { Feature } from "@src/enum";
import EventDispatcherInterface from "../../../src/Components/EventDispatcher/Interfaces/EventDispatcherInterface";

const mockComposer = mock<FeatureComposer>();
const mockDispatcher = mock<EventDispatcherInterface<AppEvents>>();
const composer = new ManagerComposer(mockComposer, mock<LoggerInterface>(), mockDispatcher);
const path = "path/to/file.md";

beforeEach(() => {
    mockComposer.get.mockClear();
});
test("Should try to update only one feature", async () => {
    const feature = mock<ManagerFeatureInterface & FeatureInterface<Feature>>();
    feature.update.mockResolvedValueOnce(true);
    mockComposer.get.mockReturnValueOnce(feature);
    expect(await composer.update(path, Feature.Tab)).toEqual({ [Feature.Tab]: true });
    expect(feature.update).toHaveBeenCalledTimes(1);
    expect(feature.update).toHaveBeenCalledWith(path);
    expect(mockComposer.get).toHaveBeenCalledTimes(1);
    expect(mockComposer.get).toHaveBeenCalledWith(Feature.Tab);
});
test("Should try to update all", async () => {
    const foo = mock<ManagerFeatureInterface & FeatureInterface<Feature>>();
    foo.update.mockResolvedValueOnce(true);
    const bar = mock<ManagerFeatureInterface & FeatureInterface<Feature>>();
    bar.update.mockResolvedValueOnce(false);
    const result: { [K in Feature]?: boolean } = {};
    mockComposer.get.mockImplementationOnce((id: Feature) => {
        result[id] = true;
        return foo;
    });
    mockComposer.get.mockImplementationOnce((id: Feature) => {
        result[id] = false;
        return bar;
    });
    expect(await composer.update(path)).toEqual(result);
    expect(foo.update).toHaveBeenCalledTimes(1);
    expect(bar.update).toHaveBeenCalledTimes(1);
});

test("Should try to refresh only one feature", async () => {
    const feature = mock<ManagerFeatureInterface & FeatureInterface<Feature>>();
    feature.refresh.mockResolvedValueOnce({ [path]: true });
    mockComposer.get.mockReturnValueOnce(feature);
    expect(await composer.refresh(Feature.Tab)).toEqual({ [Feature.Tab]: { [path]: true } });
    expect(feature.refresh).toHaveBeenCalledTimes(1);
    expect(mockComposer.get).toHaveBeenCalledTimes(1);
    expect(mockComposer.get).toHaveBeenCalledWith(Feature.Tab);
});

test("Should try to refresh all", async () => {
    const foo = mock<ManagerFeatureInterface & FeatureInterface<Feature>>();
    foo.refresh.mockResolvedValueOnce({ [path]: true });
    const bar = mock<ManagerFeatureInterface & FeatureInterface<Feature>>();
    bar.refresh.mockResolvedValueOnce({ [path]: false });
    const result: { [K in Feature]?: any } = {};
    mockComposer.get.mockImplementationOnce((id: Feature) => {
        result[id] = { [path]: true };
        return foo;
    });
    mockComposer.get.mockImplementationOnce((id: Feature) => {
        result[id] = { [path]: false };
        return bar;
    });
    expect(await composer.refresh()).toEqual(result);
    expect(foo.refresh).toHaveBeenCalledTimes(1);
    expect(bar.refresh).toHaveBeenCalledTimes(1);
});
