import FileNoteLinkManager from "@src/Managers/FileNoteLinkManager";
import { mock } from "jest-mock-extended";
import ResolverInterface from "@src/Interfaces/ResolverInterface";
import ObsidianFacade from "@src/Obsidian/ObsidianFacade";
import { LinkCache, MarkdownView, TFile, View, WorkspaceLeaf } from "obsidian";
import FileNoteLinkService from "@src/Utils/FileNoteLinkService";
import DispatcherInterface from "@src/Components/EventDispatcher/Interfaces/DispatcherInterface";
import { AppEvents } from "@src/Types";
import LoggerInterface from "@src/Components/Debug/LoggerInterface";
import Event from "@src/Components/EventDispatcher/Event";

const mockService = mock<FileNoteLinkService>();
const mockDispatcher = mock<DispatcherInterface<AppEvents>>();
const mockResolver = mock<ResolverInterface>();
const mockFacade = mock<ObsidianFacade>();

mockDispatcher.dispatch.mockImplementation((name, e) => e);

const createManager = () => new FileNoteLinkManager(mockFacade, mockResolver, mockService, mockDispatcher, mock<LoggerInterface>());

describe("Test chage state", () => {
  test("Should be disabled by default", () => expect(createManager().isEnabled()).toBeFalsy());
  test("Should be enabled after enable", () => {
    const manager = createManager();
    manager.enable();
    expect(manager.isEnabled()).toBeTruthy();
  });
  test("Should be disabled after disable", () => {
    const manager = createManager();
    manager.disable();
    expect(manager.isEnabled()).toBeFalsy();
  });
});

test("Should not call factory because of disabled", async () => {
  const factory = jest.fn();
  const manager = createManager();
  await expect(manager.update()).resolves.toBeFalsy();
  expect(factory).not.toHaveBeenCalled();
});

describe("Should not call resolved", () => {
  const path = "/path/to/file.md";
  const view = mock<MarkdownView>();
  view.file = { path } as TFile;
  mockFacade.getViewsOfType.mockReturnValue([]);
  const manager = createManager();
  const clear = () => {
    mockFacade.getViewsOfType.mockClear();
    mockFacade.getFirstLinkpathDest.mockClear();
    mockService.getNoteLinks.mockClear();
    mockDispatcher.dispatch.mockClear();
    mockResolver.resolve.mockClear();
  };
  beforeEach(clear);
  afterAll(clear);
  test("Should not call resolver and service because there is no leaf", async () => {
    manager.enable();
    await expect(manager.update()).resolves.toBeFalsy();
    expect(mockFacade.getViewsOfType).toHaveBeenCalledTimes(1);
    expect(mockService.getNoteLinks).not.toHaveBeenCalled();
    expect(mockResolver.resolve).not.toHaveBeenCalled();
  });
  test("Should not call resolver and service because there is no file", async () => {
    mockFacade.getViewsOfType.mockReturnValueOnce([{}] as View[]);
    await expect(manager.update()).resolves.toBeFalsy();
    expect(mockFacade.getViewsOfType).toHaveBeenCalledTimes(1);
    expect(mockService.getNoteLinks).not.toHaveBeenCalled();
    expect(mockResolver.resolve).not.toHaveBeenCalled();
  });
  test("Should not call resolver and dispatcher because there is no links", async () => {
    mockFacade.getViewsOfType.mockReturnValueOnce([view]);
    mockService.getNoteLinks.mockReturnValueOnce([]);

    await expect(manager.update()).resolves.toBeFalsy();
    expect(mockFacade.getViewsOfType).toHaveBeenCalledTimes(1);
    expect(mockService.getNoteLinks).toHaveBeenCalledWith(path);
    expect(mockResolver.resolve).not.toHaveBeenCalled();
  });

  test("Should not change file, because changes had been rejected", async () => {
    const title = "resolved-title";
    mockService.getNoteLinks.mockReturnValueOnce([{ dest: "/path/to/linkfile.md", link: "link-to-file", original: "[[original-link]]" }]);
    mockResolver.resolve.mockReturnValueOnce(title);
    mockFacade.getViewsOfType.mockReturnValueOnce([view]);
    await manager.update();
    expect(mockFacade.getViewsOfType).toHaveBeenCalledTimes(1);
    expect(mockService.getNoteLinks).toHaveBeenCalledTimes(1);
    expect(mockResolver.resolve).toHaveBeenCalledTimes(1);
    expect(mockDispatcher.dispatch).toHaveBeenCalledWith("note:link:change:approve", expect.anything());
    expect(mockFacade.getFileContent).not.toHaveBeenCalled();
  });

  test("Should change file", async () => {
    const before = `some text with [[foo]], [[bar|but_with_name]] and
    [[bar]].
    [[quote]]
    [[foo]]
    `;
    const after = `some text with [[foo|foo_alias]], [[bar|but_with_name]] and
    [[bar|bar_alias]].
    [[quote]]
    [[foo|foo_alias]]
    `;

    const links = [
      { dest: "foo", link: "foo", original: "[[foo]]" },
      { dest: "bar", link: "bar", original: "[[bar|but_with_name]]" },
      { dest: "bar", link: "bar", original: "[[bar]]" },
      { dest: "quote", link: "quote", original: "[[quote]]" },
      { dest: "foo", link: "foo", original: "[[foo]]" },
    ];

    mockDispatcher.dispatch.mockImplementationOnce(
      (name: string, e: Event<AppEvents["note:link:change:approve"]>) => new Event({ ...e.get(), approve: Promise.resolve(true) })
    );
    mockFacade.getFileContent.mockResolvedValueOnce(before);
    mockService.getNoteLinks.mockReturnValueOnce(links);
    mockResolver.resolve.mockImplementation((e) => (e === "quote" ? null : `${e}_alias`));
    mockFacade.getViewsOfType.mockReturnValueOnce([view]);

    await manager.update();

    expect(mockFacade.getViewsOfType).toHaveBeenCalledTimes(1);
    expect(mockService.getNoteLinks).toHaveBeenCalledTimes(1);
    expect(mockResolver.resolve).toHaveBeenCalledTimes(3);
    expect(mockDispatcher.dispatch).toHaveBeenCalledWith("note:link:change:approve", expect.anything());
    expect(mockDispatcher.dispatch).toHaveBeenCalledTimes(1);
    expect(mockFacade.getFileContent).toHaveBeenCalledTimes(1);
    expect(mockFacade.modifyFile).toHaveBeenCalledWith(expect.anything(), after);
    expect(mockFacade.modifyFile).toHaveBeenCalledTimes(1);
  });
});
