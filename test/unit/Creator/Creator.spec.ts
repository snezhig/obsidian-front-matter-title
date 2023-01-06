import { mock } from "jest-mock-extended";
import TemplateInterface from "../../../src/Interfaces/TemplateInterface";
import TemplatePlaceholderInterface from "../../../src/Interfaces/TemplatePlaceholderInterface";
import Creator from "../../../src/Creator/Creator";
import { AppEvents } from "@src/Types";
import Event from "@src/Components/EventDispatcher/Event";
import LoggerInterface from "@src/Components/Debug/LoggerInterface";
import PathNotFoundException from "@src/Components/Extractor/Exceptions/PathNotFoundException";
import EventDispatcherInterface, {
    Callback,
} from "@src/Components/EventDispatcher/Interfaces/EventDispatcherInterface";

describe("Test Creator", () => {
    const path = "/path/to/file.md";
    const templateStr = "static_dynamic_static";
    const expected = "static_(static)_static";
    const template = mock<TemplateInterface>();
    const placeholder = mock<TemplatePlaceholderInterface>();
    const dispatcher = mock<EventDispatcherInterface<AppEvents>>();
    const events: { [K in keyof AppEvents]?: Callback<AppEvents[K]> } = {};
    const templateCallback = jest.fn(() => [template]);
    const logger = mock<LoggerInterface>();
    // @ts-ignore
    dispatcher.addListener.mockImplementation(({ name, cb }) => (events[name] = cb));
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

    test("Should return value for composite template because there are only spaces", () => {
        const fooPlaceholder = mock<TemplatePlaceholderInterface>({
            makeValue: jest.fn(() => ""),
            getPlaceholder: jest.fn(() => "{{ foo }}"),
        });
        const barPlaceholder = mock<TemplatePlaceholderInterface>({
            makeValue: jest.fn(() => ""),
            getPlaceholder: jest.fn(() => "{{bar}}"),
        });
        template.getPlaceholders.mockReturnValueOnce([fooPlaceholder, barPlaceholder]);
        template.getTemplate.mockReturnValueOnce(" {{ foo }} {{bar}} ");
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
            expect(dispatcher.addListener).toHaveBeenCalledWith({ name: "settings:changed", cb: expect.anything() });
        });

        test("Should update template after template:changed event", () => {
            templateCallback.mockClear();
            expect(events["settings:changed"]).not.toBeUndefined();
            events["settings:changed"](new Event<AppEvents["settings:changed"]>(mock()));
            expect(templateCallback).toHaveBeenCalledTimes(1);
        });
    });
});
