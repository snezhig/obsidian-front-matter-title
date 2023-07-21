import { mock } from "jest-mock-extended";
import ObsidianFacade from "@src/Obsidian/ObsidianFacade";
import LoggerInterface from "@src/Components/Debug/LoggerInterface";
import { Feature, Leaves } from "@src/Enum";
import { SearchPluginView, SearchDOM, TFile } from "obsidian";
import SearchFeature from "@src/Feature/Search/SearchFeature";
import { ResolverInterface } from "@src/Resolver/Interfaces";
import FeatureService from "../../../../src/Feature/FeatureService";
import SearchDomWrapperService from "../../../../src/Utils/SearchDomWrapperService";

const addResult = jest.fn();
const mockDom = mock<SearchDOM>({ addResult }, { deep: true });
const mockView = mock<SearchPluginView>({ dom: mockDom });
const mockFacade = mock<ObsidianFacade>();
const mockResolver = mock<ResolverInterface>();
const mockFactory = mock<FeatureService>();
const mockService = mock<SearchDomWrapperService>();
mockFactory.createResolver.mockReturnValueOnce(mockResolver);
const feature = new SearchFeature(mockFacade, mock<LoggerInterface>(), mockService, mockFactory);

test(`Should return ${Feature.Search}`, () => expect(feature.getId()).toEqual(Feature.Search));

describe("Search feature test", () => {
    beforeEach(() => mockFacade.getViewsOfType.mockClear());
    test("Should throw exception because there is no leave", () => {
        expect(() => feature.enable()).toThrow(`View of ${Leaves.S} not found`);
    });
    test("Should call service and be enabled", () => {
        mockFacade.getViewsOfType.mockReturnValueOnce([mockView]);
        feature.enable();
        expect(mockService.wrapDom).toBeCalledTimes(1);
        expect(mockService.wrapDom).toBeCalledWith(mockDom, mockResolver, feature.getId());
        expect(feature.isEnabled()).toBeTruthy();
    });
    test("Should destroy wrap and be disabled", () => {
        feature.disable();
        expect(feature.isEnabled()).toBeFalsy();
        expect(mockFacade.getViewsOfType).not.toBeCalled();
        expect(mockService.destroyByTag).toBeCalledTimes(1);
        expect(mockService.destroyByTag).toBeCalledWith(feature.getId());
    });
});
