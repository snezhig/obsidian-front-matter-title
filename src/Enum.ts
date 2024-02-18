import ExplorerManager from "@src/Feature/Explorer/ExplorerManager";
import GraphManager from "@src/Feature/Graph/GraphManager";
import { MarkdownHeaderManager } from "@src/Feature/MarkdownHeader/MarkdownHeaderManager";
import TabManager from "@src/Feature/Tab/TabManager";
import { InlineTitleManager } from "@src/Feature/InlineTitle/InlineTitleManager";
import { CanvasManager } from "@src/Feature/Canvas/CanvasManager";

export enum Leaves {
    FE = "file-explorer",
    G = "graph",
    LG = "localgraph",
    MD = "markdown",
    BL = "backlink",
    S = "search",
    Bookmarks = "bookmarks",
    CV = "canvas",
}

export enum Feature {
    Explorer = "explorer",
    Graph = "graph",
    Header = "header",
    Bookmarks = "bookmarks",
    Search = Leaves.S,
    Tab = "tab",
    Alias = "alias",
    Suggest = "suggest",
    InlineTitle = "inlineTitle",
    Canvas = "canvas",
    Backlink = Leaves.BL,
    NoteLink = "noteLink",
    WindowFrame = "windowFrame",
}

export const Managers = [
    ExplorerManager.getId(),
    GraphManager.getId(),
    MarkdownHeaderManager.getId(),
    TabManager.getId(),
    InlineTitleManager.getId(),
    CanvasManager.getId(),
];

export const GITHUB_DOCS = "https://github.com/snezhig/obsidian-front-matter-title/blob/master/docs/";
