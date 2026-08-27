import { mock, mockReset } from "jest-mock-extended";
import { MarkdownViewExt } from "obsidian";
import { InlineTitleManager } from "@src/Feature/InlineTitle/InlineTitleManager";
import FakeTitleElementService from "@src/Utils/FakeTitleElementService";
import ObsidianFacade from "@src/Obsidian/ObsidianFacade";
import EventDispatcherInterface from "@src/Components/EventDispatcher/Interfaces/EventDispatcherInterface";
import LoggerInterface from "@src/Components/Debug/LoggerInterface";
import { ResolverInterface } from "@src/Resolver/Interfaces";
import { AppEvents } from "@src/Types";

const dispatcher = mock<EventDispatcherInterface<AppEvents>>();
const facade = mock<ObsidianFacade>();
const logger = mock<LoggerInterface>();
const service = mock<FakeTitleElementService>();
const resolver = mock<ResolverInterface>();

const createView = (path: string, leafId: string): MarkdownViewExt =>
    mock<MarkdownViewExt>({
        file: { path } as any,
        inlineTitleEl: mock<HTMLDivElement>(),
        leaf: { id: leafId } as any,
        getState: () => ({ mode: "source" }),
    } as any);

describe("InlineTitleManager", () => {
    let manager: InlineTitleManager;

    beforeEach(() => {
        [dispatcher, facade, logger, service, resolver].forEach(mockReset);
        service.getOrCreate.mockReturnValue({ created: true, element: mock<HTMLElement>() });
        manager = new InlineTitleManager(dispatcher, facade, logger, service);
        manager.setResolver(resolver);
        manager.enable();
    });

    it("keeps titles of open notes when an unrelated file is created (#285)", async () => {
        // Dropping an image into a note creates an attachment, which fires
        // vault "create" -> update(<image path>). No markdown view matches it.
        facade.getViewsOfType.mockReturnValue([createView("note.md", "leaf-1")]);
        resolver.resolve.mockReturnValue("Title From Frontmatter");

        await manager.update("attachments/pasted-image.png");

        expect(service.removeExcept).not.toHaveBeenCalled();
        expect(service.remove).not.toHaveBeenCalled();
        expect(service.removeAll).not.toHaveBeenCalled();
    });

    it("keeps titles of other open notes when one note is updated", async () => {
        facade.getViewsOfType.mockReturnValue([createView("a.md", "leaf-1"), createView("b.md", "leaf-2")]);
        resolver.resolve.mockReturnValue("Title");

        await manager.update("a.md");

        expect(service.removeExcept).not.toHaveBeenCalled();
        expect(service.getOrCreate).toHaveBeenCalledTimes(1);
    });

    it("collects orphaned elements on a full refresh", async () => {
        facade.getViewsOfType.mockReturnValue([createView("a.md", "leaf-1")]);
        resolver.resolve.mockReturnValue("Title");

        await manager.refresh();

        expect(service.removeExcept).toHaveBeenCalledWith(["source-inlineTitle-leaf-1"]);
    });
});
