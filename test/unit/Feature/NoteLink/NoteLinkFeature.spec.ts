import { mock } from "jest-mock-extended";
import NoteLinkFeature from "../../../../src/Feature/NoteLink/NoteLinkFeature";
import FeatureService from "../../../../src/Feature/FeatureService";
import FileNoteLinkService, { NoteLink } from "../../../../src/Utils/FileNoteLinkService";
import { AppEvents } from "../../../../src/Types";
import ObsidianFacade from "../../../../src/Obsidian/ObsidianFacade";
import { FeatureConfig } from "../../../../src/Feature/Types";
import { Feature } from "../../../../src/Enum";
import { NoteLinkStrategy } from "../../../../src/Feature/NoteLink/NoteLinkTypes";
import { createEventDispatcherMock } from "../../../mocks/MockFactory";
import NoteLinkApprove from "../../../../src/Feature/NoteLink/NoteLinkApprove";
import { ResolverInterface } from "../../../../src/Resolver/Interfaces";
import { CachedMetadata, TFile } from "obsidian";
import Event from "../../../../src/Components/EventDispatcher/Event";

const mockResolver = mock<ResolverInterface>();
const mockFeatureService = mock<FeatureService>();
mockFeatureService.createResolver.mockReturnValueOnce(mockResolver);
const { mockEventDispatcher, callbacks } = createEventDispatcherMock<AppEvents>();
const mockService = mock<FileNoteLinkService>();
const mockApprove = mock<NoteLinkApprove>();
const mockFacade = mock<ObsidianFacade>();
const config: FeatureConfig<Feature.NoteLink> = {
    approval: true,
    strategy: NoteLinkStrategy.OnlyEmpty,
    enabled: true,
    templates: { main: "", fallback: "" },
};

const feature = new NoteLinkFeature(
    mockFeatureService,
    mockService,
    mockEventDispatcher,
    mockApprove,
    mockFacade,
    config
);

test("Should create resolver in construct", () => {
    expect(mockFeatureService.createResolver).toHaveBeenCalledTimes(1);
    expect(mockFeatureService.createResolver).toHaveBeenCalledWith(Feature.NoteLink);
});

test("Should be disabled by default", () => expect(feature.isEnabled()).toBeFalsy());

test("Should bind listeners and be enabled", () => {
    feature.enable();
    expect(mockEventDispatcher.addListener).toHaveBeenCalledTimes(1);
    expect(mockEventDispatcher.addListener).toHaveBeenCalledWith({
        name: "metadata:cache:changed",
        cb: callbacks["metadata:cache:changed"].cb,
    });
    expect(feature.isEnabled()).toBeTruthy();
});

test("Should request changes and execute them", async () => {
    const path = "/foo/bar/path";
    const links: Record<string, NoteLink> = {
        foo: { alias: "foo-alias", dest: "foo", link: "foo-link", original: "[[foo-link|foo-alias]]" },
        bar: { alias: "", dest: "bar", link: "bar-link", original: "[[bar-link]]" },
        baz: { alias: "", dest: "baz", link: "baz-link", original: "[[baz-link]]" },
    };
    const mockFile = new TFile();
    const content = "some text [[bar-link]] some suffix";
    const expectedContent = "some text [[bar-link|bar-resolved]] some suffix";

    mockResolver.resolve.mockImplementation(path => (path === "baz" ? null : `${path}-resolved`));
    mockService.getNoteLinks.mockReturnValueOnce(Object.values(links));
    mockApprove.request.mockResolvedValue(true);
    mockFacade.getTFile.mockReturnValueOnce(mockFile);
    mockFacade.getFileContent.mockResolvedValueOnce(content);
    mockFacade.modifyFile.mockResolvedValueOnce();

    await callbacks["metadata:cache:changed"].cb(new Event({ path, cache: mock<CachedMetadata>() }));
    expect(mockService.getNoteLinks).toBeCalledWith(path);
    expect(mockApprove.request).toBeCalledWith(path, [
        { original: links.bar.original, replace: `[[${links.bar.link}|bar-resolved]]` },
    ]);
    expect(mockFacade.getTFile).toBeCalledWith(path);
    expect(mockFacade.getFileContent).toBeCalledWith(mockFile);
    expect(mockFacade.modifyFile).toHaveBeenCalledWith(mockFile, expectedContent);
});
