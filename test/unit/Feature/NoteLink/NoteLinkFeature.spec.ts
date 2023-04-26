import { mock } from "jest-mock-extended";
import NoteLinkFeature from "../../../../src/Feature/NoteLink/NoteLinkFeature";
import FeatureService from "../../../../src/Feature/FeatureService";
import FileNoteLinkService, { NoteLink } from "../../../../src/Utils/FileNoteLinkService";
import EventDispatcherInterface, {
    Callback,
    Listener,
} from "../../../../src/Components/EventDispatcher/Interfaces/EventDispatcherInterface";
import { AppEvents } from "../../../../src/Types";
import ListenerInterface from "../../../../src/Interfaces/ListenerInterface";
import ObsidianFacade from "../../../../src/Obsidian/ObsidianFacade";
import { FeatureConfig } from "../../../../src/Feature/Types";
import { Feature } from "../../../../src/Enum";
import { NoteLinkStrategy } from "../../../../src/Feature/NoteLink/NoteLinkTypes";
import ListenerRef from "../../../../src/Components/EventDispatcher/Interfaces/ListenerRef";
import { createEventDispatcherMock } from "../../../mocks/MockFactory";
import NoteLinkApprove from "../../../../src/Feature/NoteLink/NoteLinkApprove";
import { ResolverInterface } from "../../../../src/Resolver/Interfaces";

const mockResolver = mock<ResolverInterface>();
const mockFeatureService = mock<FeatureService>();
mockFeatureService.createResolver.mockReturnValueOnce(mockResolver);
const { mockEventDispatcher, callbacks } = createEventDispatcherMock<AppEvents>();
const mockService = mock<FileNoteLinkService>();
const mockApprove = mock<NoteLinkApprove>();
const mockFacade = mock<ObsidianFacade>();
const config: FeatureConfig<Feature.NoteLink> = { approval: true, strategy: NoteLinkStrategy.All, enabled: true };

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
