import { ApiInterface, PluginIsNotReadyError } from "front-matter-plugin-api-provider";
import { mock } from "jest-mock-extended";
import Deffer, { DefferManagersReady, DefferPluginReady } from "@src/Api/Deffer";
import { expect } from "@jest/globals";

const mockFactory = jest.fn(() => mock<ApiInterface>());

const deffer = new Deffer(mockFactory);

test("Should not been booted and bound", () => {
    expect(deffer.isManagersReady()).toBeFalsy();
    expect(deffer.isPluginReady()).toBeFalsy();
});

test("Should throw error", () => {
    expect(() => deffer.getApi()).toThrowError(PluginIsNotReadyError);
});

test("Should call factory to create Api", async () => {
    deffer.setFlag(DefferPluginReady);
    expect(deffer.isPluginReady()).toBeTruthy();
    expect(deffer.isManagersReady()).toBeFalsy();
    await deffer.awaitPlugin();
    deffer.getApi();
    expect(mockFactory).toHaveBeenCalledTimes(1);
});

test("Should be booted and bound", async () => {
    deffer.setFlag(DefferManagersReady);
    await deffer.awaitManagers();
    expect(deffer.isPluginReady()).toBeTruthy();
    expect(deffer.isPluginReady()).toBeTruthy();
});
