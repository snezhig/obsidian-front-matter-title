export enum Plugins {
    Search = "global-search",
    FileExplorer = "file-explorer",
    Backlink = "backlink",
}

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
    Feature.Explorer,
    Feature.Graph,
    Feature.Header,
    Feature.Tab,
    Feature.InlineTitle,
    Feature.Canvas,
];

export const GITHUB_DOCS = "https://github.com/snezhig/obsidian-front-matter-title/blob/master/docs/";
