import App from "@src/App";
import Container from "@config/inversify.config";
import SI from "@config/inversify.types";
import ObjectHelper from "@src/Utils/ObjectHelper";
import Event from "@src/Components/EventDispatcher/Event";
import { SettingsEvent, SettingsType } from "@src/Settings/SettingsType";
import PluginHelper from "../../src/Utils/PluginHelper";
import EventDispatcherInterface from "@src/Components/EventDispatcher/Interfaces/EventDispatcherInterface";

const spy = {
    addListener: jest.spyOn<EventDispatcherInterface<any>, "addListener">(
        Container.get(SI["event:dispatcher"]),
        "addListener"
    ),
    dispatch: jest.spyOn<EventDispatcherInterface<any>, "dispatch">(Container.get(SI["event:dispatcher"]), "dispatch"),
    compare: jest.spyOn(ObjectHelper, "compare"),
};

const dispatcher = Container.get<EventDispatcherInterface<SettingsEvent>>(SI["event:dispatcher"]);
const createDefaultSettings = (): SettingsType => PluginHelper.createDefaultSettings();
describe("Test App", () => {
    new App();
    test("Templates should not exist", () => {
        expect(Container.isBound(SI.templates)).toBeFalsy();
    });
    test("Delimiter should not exist", () => {
        expect(Container.isBound(SI.delimiter)).toBeFalsy();
    });
    test("Should subscribe on events", () => {
        expect(spy.addListener).toHaveBeenCalledWith({ name: "settings:changed", cb: expect.anything() });
        expect(spy.addListener).toHaveBeenCalledWith({ name: "settings.loaded", cb: expect.anything(), once: true });
    });

    describe('Test "settings.loaded" event', () => {
        beforeAll(() => spy.dispatch.mockClear());
        afterAll(() => {
            spy.dispatch.mockClear();
        });
        test("Dispatch event", () => {
            const settings = createDefaultSettings();
            settings.templates = ["title", "fallback_title"];
            settings.rules.paths = { values: ["foo"], mode: "black" };
            dispatcher.dispatch("settings.loaded", new Event({ settings }));
        });
        test("Should bind templates", () => {
            expect(Container.get(SI.templates)).toEqual(["title", "fallback_title"]);
        });

        test("Should bind delimiter", () => {
            expect(Container.isBound(SI.delimiter)).toBeTruthy();
            expect(Container.get(SI.delimiter)).toEqual({ enabled: false, value: "" });
        });
    });

    describe('Test "settings.changed event"', () => {
        afterEach(() => spy.dispatch.mockClear());
        beforeAll(() => spy.dispatch.mockClear());
        test("Should change templates and dispatch new event", () => {
            const old = createDefaultSettings();
            const actual = createDefaultSettings();
            actual.templates = ["actual_title"];
            const changed = ObjectHelper.compare(old, actual);

            dispatcher.dispatch("settings:changed", new Event({ old, actual, changed }));

            expect(Container.get<string>(SI.templates)).toEqual(["actual_title"]);
            expect(spy.dispatch).toHaveBeenCalledWith("resolver:clear", null);
            expect(spy.dispatch).toHaveBeenCalledTimes(2);
        });

        test("Should change delimiter", () => {
            const old = createDefaultSettings();
            const actual = createDefaultSettings();
            const value = Math.random().toString() + "_";
            actual.rules.delimiter = { value, enabled: true };
            const changed = ObjectHelper.compare(old, actual);

            dispatcher.dispatch("settings:changed", new Event({ old, actual, changed }));
            expect(Container.get(SI.delimiter)).toEqual({ value, enabled: true });
            expect(spy.dispatch).toHaveBeenCalledTimes(2);
            expect(spy.dispatch).toHaveBeenCalledWith("resolver:clear", null);
        });
    });
});
