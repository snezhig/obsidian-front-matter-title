import { ApiInterface } from "front-matter-plugin-api-provider";
import { mock } from "jest-mock-extended";
import Deffer, { DefferFeaturesReady, DefferPluginReady } from "@src/Api/Deffer";
import { expect } from "@jest/globals";

const mockFactory = jest.fn(() => mock<ApiInterface>());

const deffer = new Deffer(mockFactory);

test("Should not been booted and bound", () => {
    expect(deffer.isFeaturesReady()).toBeFalsy();
    expect(deffer.isPluginReady()).toBeFalsy();
});

test("Should throw error", () => {
    expect(deffer.getApi()).toBeNull();
});

test("Should call factory to create Api", async () => {
    deffer.setFlag(DefferPluginReady);
    expect(deffer.isPluginReady()).toBeTruthy();
    expect(deffer.isFeaturesReady()).toBeFalsy();
    await deffer.awaitPlugin();
    deffer.getApi();
    expect(mockFactory).toHaveBeenCalledTimes(1);
});

test("Should be booted and bound", async () => {
    deffer.setFlag(DefferFeaturesReady);
    await deffer.awaitFeatures();
    expect(deffer.isPluginReady()).toBeTruthy();
    expect(deffer.isPluginReady()).toBeTruthy();
});
