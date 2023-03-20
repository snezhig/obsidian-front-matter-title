export enum Leaves {
    FE = "file-explorer",
    G = "graph",
    LG = "localgraph",
    MD = "markdown",
}

export enum Feature {
    Explorer = "explorer",
    ExplorerSort = "explorer:sort",
    Graph = "graph",
    Header = "header",
    Starred = "starred",
    Search = "search",
    Tab = "tab",
    Alias = "alias",
    Suggest = "suggest",
    InlineTitle = "inlineTitle",
    Canvas = "canvas",
    Backlink = "backlink",
}

export const Managers = Object.values(Feature).filter(
    e => ![Feature.ExplorerSort, Feature.Suggest, Feature.Backlink, Feature.Alias].includes(e)
);
