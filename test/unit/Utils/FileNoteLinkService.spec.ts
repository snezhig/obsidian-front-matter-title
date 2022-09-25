import { mock } from "jest-mock-extended";
import ObsidianFacade from "@src/Obsidian/ObsidianFacade";
import FileNoteLinkService from "@src/Utils/FileNoteLinkService";
import { LinkCache, TFile } from "obsidian";

const mockFacade = mock<ObsidianFacade>();

const path = "/path/to/file.md";
const service = new FileNoteLinkService(mockFacade);

describe("Test getNoteLinks", () => {
    beforeEach(() => {
        mockFacade.getFileLinksCache.mockClear();
        mockFacade.getFirstLinkpathDest.mockClear();
    });
    test("Should return empty array, because file does not have links", () => {
        mockFacade.getFileLinksCache.mockReturnValueOnce([]);
        expect(service.getNoteLinks(path)).toEqual([]);

        expect(mockFacade.getFileLinksCache).toHaveBeenCalledTimes(1);
        expect(mockFacade.getFileLinksCache).toHaveBeenCalledWith(path);
        expect(mockFacade.getFirstLinkpathDest).not.toHaveBeenCalled();
    });

    test("Should return empty because file does not have link to another files", () => {
        const links = [
            { original: "[link](link)" },
            { original: "[[|link]](link)" },
            { original: "" },
            { original: "[link]" },
            { original: "[link|name]" },
        ] as LinkCache[];
        mockFacade.getFileLinksCache.mockReturnValueOnce(links);
        expect(service.getNoteLinks(path)).toHaveLength(0);

        expect(mockFacade.getFileLinksCache).toHaveBeenCalledTimes(1);
        expect(mockFacade.getFileLinksCache).toHaveBeenCalledWith(path);
        expect(mockFacade.getFirstLinkpathDest).not.toHaveBeenCalled();
    });

    test("Should return empty because dist of link does has not been found", () => {
        const links = [{ original: "[[link]]" }] as LinkCache[];
        mockFacade.getFileLinksCache.mockReturnValueOnce(links);
        mockFacade.getFirstLinkpathDest.mockReturnValueOnce(null);

        expect(service.getNoteLinks(path)).toHaveLength(0);
        expect(mockFacade.getFileLinksCache).toHaveBeenCalledTimes(1);
        expect(mockFacade.getFileLinksCache).toHaveBeenCalledWith(path);
        expect(mockFacade.getFirstLinkpathDest).toHaveBeenCalledTimes(1);
    });

    test("Should return links", () => {
        const links = [
            { original: "[[foo|alias]]", link: "foo" },
            { original: "[[bar|a|i|s]]", link: "bar" },
            { original: "[[quote]]", link: "quote" },
            { original: "[[qux corge]]", link: "qux corge" },
            { original: "[[waldo thud|quux]]", link: "waldo thud" },
        ] as LinkCache[];
        const expected = links.map(e => ({ original: e.original, link: e.link, dest: `${e.link}_path`, alias: null }));
        mockFacade.getFileLinksCache.mockReturnValueOnce(links);
        mockFacade.getFirstLinkpathDest.mockImplementation(e => mock<TFile>({ path: `${e}_path` }));

        const actual = service.getNoteLinks(path);

        expect(actual).toEqual(expected);
        expect(mockFacade.getFileLinksCache).toHaveBeenCalledTimes(1);
        expect(mockFacade.getFileLinksCache).toHaveBeenCalledWith(path);
        expect(mockFacade.getFirstLinkpathDest).toHaveBeenCalledTimes(5);
    });
});
