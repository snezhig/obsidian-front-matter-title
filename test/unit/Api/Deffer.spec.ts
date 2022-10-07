import { Api, PluginBindIncompleteError } from "front-matter-plugin-api-provider";
import { mock } from "jest-mock-extended";
import Deffer, { DefferBooted, DefferBound } from "@src/Api/Deffer";
import { expect } from "@jest/globals";

const mockFactory = jest.fn(() => mock<Api>());

const deffer = new Deffer(mockFactory);

test("Should not been booted and bound", () => {
    expect(deffer.isBooted()).toBeFalsy();
    expect(deffer.isBooted()).toBeFalsy();
});

test("Should throw error", () => {
    expect(() => deffer.getApi()).toThrowError(PluginBindIncompleteError);
});

test("Should call factory to create Api", async () => {
    deffer.setFlag(DefferBound);
    expect(deffer.isBound()).toBeTruthy();
    expect(deffer.isBooted()).toBeFalsy();
    expect(await deffer.awaitBind()).toEqual(deffer);
    deffer.getApi();
    expect(mockFactory).toHaveBeenCalledTimes(1);
});

test("Should be booted and bound", async () => {
    deffer.setFlag(DefferBooted);
    await deffer.awaitBoot();
    expect(deffer.isBooted()).toBeTruthy();
    expect(deffer.isBound()).toBeTruthy();
});
