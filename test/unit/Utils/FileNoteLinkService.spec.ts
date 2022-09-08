import {mock} from "jest-mock-extended";
import ObsidianFacade from "@src/Obsidian/ObsidianFacade";
import FileNoteLinkService from "@src/Utils/FileNoteLinkService";
import {LinkCache} from "obsidian";

const mockFacade = mock<ObsidianFacade>();

const path = '/path/to/file.md';
const service = new FileNoteLinkService(mockFacade);


describe('Test getNoteLinks', () => {
    beforeEach(() => {
        mockFacade.getFileLinksCache.mockClear();
    })
    test('Should return empty array, because file does not have links', () => {
        mockFacade.getFileLinksCache.mockReturnValueOnce([]);
        expect(service.getNoteLinks(path)).toEqual([]);

        expect(mockFacade.getFileLinksCache).toHaveBeenCalledTimes(1);
        expect(mockFacade.getFileLinksCache).toHaveBeenCalledWith(path);
        expect(mockFacade.getFirstLinkpathDest).not.toHaveBeenCalled();
    })

    test('Should return empty because file does not have link to another files', () => {
        const links = [
            {original: '[link](link)'},
            {original: ''},
            {original: '[link]'},
            {original: '[link|name]'},
        ] as LinkCache[];
        mockFacade.getFileLinksCache.mockReturnValueOnce(links);
        service.getNoteLinks(path);

        expect(mockFacade.getFileLinksCache).toHaveBeenCalledTimes(1);
        expect(mockFacade.getFileLinksCache).toHaveBeenCalledWith(path);
        expect(mockFacade.getFirstLinkpathDest).not.toHaveBeenCalled();
    })
});