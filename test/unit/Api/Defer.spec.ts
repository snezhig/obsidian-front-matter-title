import { ApiInterface } from "front-matter-plugin-api-provider";
import { mock } from "jest-mock-extended";
import Defer, { DeferFeaturesReady, DeferPluginReady } from "@src/Api/Defer";
import { expect } from "@jest/globals";

const mockFactory = jest.fn(() => mock<ApiInterface>());

const defer = new Defer(mockFactory);

test("Should not been booted and bound", () => {
    expect(defer.isFeaturesReady()).toBeFalsy();
    expect(defer.isPluginReady()).toBeFalsy();
});

test("Should throw error", () => {
    expect(defer.getApi()).toBeNull();
});

test("Should call factory to create Api", async () => {
    defer.setFlag(DeferPluginReady);
    expect(defer.isPluginReady()).toBeTruthy();
    expect(defer.isFeaturesReady()).toBeFalsy();
    await defer.awaitPlugin();
    defer.getApi();
    expect(mockFactory).toHaveBeenCalledTimes(1);
});

test("Should be booted and bound", async () => {
    defer.setFlag(DeferFeaturesReady);
    await defer.awaitFeatures();
    expect(defer.isPluginReady()).toBeTruthy();
    expect(defer.isPluginReady()).toBeTruthy();
});
