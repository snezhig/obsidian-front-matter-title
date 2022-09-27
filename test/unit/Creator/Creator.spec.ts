import { mock } from "jest-mock-extended";
import TemplateInterface from "../../../src/Interfaces/TemplateInterface";
import TemplatePlaceholderInterface from "../../../src/Interfaces/TemplatePlaceholderInterface";
import Creator from "../../../src/Creator/Creator";
import DispatcherInterface from "@src/Components/EventDispatcher/Interfaces/DispatcherInterface";
import { AppEvents } from "@src/Types";
import CallbackInterface from "@src/Components/EventDispatcher/Interfaces/CallbackInterface";
import Event from "@src/Components/EventDispatcher/Event";
import LoggerInterface from "@src/Components/Debug/LoggerInterface";
import PathNotFoundException from "@src/Components/Extractor/Exceptions/PathNotFoundException";

describe("Test Creator", () => {
    const path = "/path/to/file.md";
    const templateStr = "static_dynamic_static";
    const expected = "static_(static)_static";
    const template = mock<TemplateInterface>();
    const placeholder = mock<TemplatePlaceholderInterface>();
    const dispatcher = mock<DispatcherInterface<AppEvents>>();
    const events: { [K in keyof AppEvents]?: CallbackInterface<AppEvents[K]> } = {};
    const templateCallback = jest.fn(() => [template]);
    const logger = mock<LoggerInterface>();
    // @ts-ignore
    dispatcher.addListener.mockImplementation((name, cb) => (events[name] = cb));
    template.getPlaceholders.mockReturnValue([placeholder]);
    template.getTemplate.mockReturnValue(templateStr);

    test("Create title", () => {
        placeholder.makeValue.mockReturnValue("(static)");
        placeholder.getPlaceholder.mockReturnValue("dynamic");

        const creator = new Creator(dispatcher, templateCallback, logger);
        const actual = creator.create(path);

        expect(actual).toEqual(expected);
        expect(placeholder.getPlaceholder).toHaveBeenCalledTimes(1);
        expect(placeholder.makeValue).toHaveBeenNthCalledWith(1, path);
        expect(template.getTemplate).toHaveBeenCalledTimes(1);
        expect(template.getPlaceholders).toHaveBeenCalledTimes(1);
    });

    test("Should return null", () => {
        placeholder.makeValue.mockReturnValue(null);
        placeholder.getPlaceholder.mockReturnValue("(static)");
        template.getTemplate.mockReturnValueOnce("(static)");
        const creator = new Creator(dispatcher, templateCallback, logger);
        const actual = creator.create(path);
        expect(actual).toBeNull();
    });

    test("Should return null because of exception in makeValue", () => {
        placeholder.makeValue.mockImplementation(() => {
            throw new PathNotFoundException();
        });
        placeholder.getPlaceholder.mockReturnValueOnce("title");
        template.getTemplate.mockReturnValueOnce("title");
        const actual = new Creator(dispatcher, templateCallback, logger).create(path);
        expect(actual).toBeNull();
    });
    describe("Test events", () => {
        beforeAll(() => {
            dispatcher.addListener.mockClear();
            templateCallback.mockClear();
            new Creator(dispatcher, templateCallback, logger);
        });
        test("Should add listener", () => {
            expect(dispatcher.addListener).toHaveBeenCalledTimes(1);
            expect(dispatcher.addListener).toHaveBeenCalledWith("templates:changed", expect.anything());
        });

        test("Should update template after template:changed event", () => {
            templateCallback.mockClear();
            expect(events["templates:changed"]).not.toBeUndefined();
            events["templates:changed"].execute(new Event<AppEvents["templates:changed"]>({ old: [], new: [] }));
            expect(templateCallback).toHaveBeenCalledTimes(1);
        });
    });
});
