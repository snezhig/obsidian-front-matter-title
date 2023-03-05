import { mock } from "jest-mock-extended";
import Creator from "../../../src/Creator/Creator";
import LoggerInterface from "@src/Components/Debug/LoggerInterface";
import PathNotFoundException from "@src/Components/Extractor/Exceptions/PathNotFoundException";

import { TemplateInterface, TemplatePlaceholderInterface } from "@src/Creator/Interfaces";
import TemplateFactory from "@src/Creator/Template/Factory";

describe("Test Creator", () => {
    const path = "/path/to/file.md";
    const templateStr = "static_dynamic_static";
    const expected = "static_(static)_static";
    const mockTemplate = mock<TemplateInterface>();
    const mockPlaceholder = mock<TemplatePlaceholderInterface>();
    const mockLogger = mock<LoggerInterface>();
    const mockFactory = mock<TemplateFactory>();
    // @ts-ignore
    mockTemplate.getPlaceholders.mockReturnValue([mockPlaceholder]);
    mockTemplate.getTemplate.mockReturnValue(templateStr);
    mockFactory.create.mockReturnValue(mockTemplate);

    describe("Test title and cache", () => {
        const creator = new Creator(mockFactory, mockLogger);
        test("Create title", () => {
            mockPlaceholder.makeValue.mockReturnValue("(static)");
            mockPlaceholder.getPlaceholder.mockReturnValue("dynamic");

            const actual = creator.create(path, templateStr);

            expect(actual).toEqual(expected);
            expect(mockFactory.create).toHaveBeenCalledTimes(1);
            expect(mockFactory.create).toHaveBeenCalledWith(templateStr);
            expect(mockPlaceholder.getPlaceholder).toHaveBeenCalledTimes(1);
            expect(mockPlaceholder.makeValue).toHaveBeenNthCalledWith(1, path);
            expect(mockTemplate.getPlaceholders).toHaveBeenCalledTimes(1);
        });
        test("Should return the same result as previous but without factory calling", () => {
            mockFactory.create.mockClear();
            expect(creator.create(path, templateStr)).toEqual(expected);
            expect(mockFactory.create).not.toHaveBeenCalled();
        });
    });

    test("Should return null", () => {
        mockPlaceholder.makeValue.mockReturnValue(null);
        mockPlaceholder.getPlaceholder.mockReturnValue("(static)");
        const creator = new Creator(mockFactory, mockLogger);
        const actual = creator.create(path, "(static)");
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
        mockTemplate.getPlaceholders.mockReturnValueOnce([fooPlaceholder, barPlaceholder]);
        const creator = new Creator(mockFactory, mockLogger);
        const actual = creator.create(path, " {{ foo }} {{bar}} ");
        expect(actual).toBeNull();
    });

    test("Should return null because of exception in makeValue", () => {
        mockPlaceholder.makeValue.mockImplementation(() => {
            throw new PathNotFoundException();
        });
        mockPlaceholder.getPlaceholder.mockReturnValueOnce("title");
        const actual = new Creator(mockFactory, mockLogger).create(path, "title");
        expect(actual).toBeNull();
    });
});
