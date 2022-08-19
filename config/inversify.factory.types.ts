export type ObsidianFileFactory<T = any> = (path: string) => T;
export type ObsidianMetaFactory<T = any> = (path: string, type: 'frontmatter' | 'headings') => T;
