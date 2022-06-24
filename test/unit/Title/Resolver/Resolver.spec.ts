import Resolver from "../../../../src/Title/Resolver/Resolver";
import {CachedMetadata, MetadataCache, Vault} from "obsidian";
import FrontMatterParser from "../../../../src/Title/FrontMatterParser";
import {expect} from "@jest/globals";
import VaultFacade from "../../../../src/Obsidian/VaultFacade";

const getCache = jest.spyOn<MetadataCache, any>(MetadataCache.prototype, 'getCache').mockImplementation(() => null);
const parse = jest.spyOn<FrontMatterParser, 'parse'>(FrontMatterParser.prototype, "parse");

const Options = {
    metaPath: 'title',
    excluded: [] as string[]
};
const vault = new Vault();
const vaultFacade = new VaultFacade(vault);

const onUnresolvedHandler = jest.fn();
let resolver = new Resolver(new MetadataCache(), new FrontMatterParser(), vaultFacade, Options);
resolver.on('unresolved', onUnresolvedHandler);

describe('File Title Resolver Test', () => {
    const getRandomPath = (extension: string = '.md') => Math.random().toString() + extension;
    beforeEach(() => {
        jest.clearAllMocks();
        parse.mockClear();
    })

    describe('Test options', () => {
        describe('Test option [path]', () => {
            const meta: { [s: string]: string } = {
                title: 'simple_title',
            };

            beforeAll(() => {
                parse.mockImplementation((path: string) => {
                    return meta[path] ?? null;
                })
            })

            const testTitleIsEqual = (title: string) => expect(title).toEqual(meta[Options.metaPath]);

            test('Parse called with meta path and null and returns title', async () => {
                const title = await resolver.resolve(getRandomPath());
                expect(parse).toHaveBeenCalledWith(Options.metaPath, {});
                testTitleIsEqual(title);
            })

            test('Resolve return null', async () => {
                resolver.changePath('not.exists.path');
                const title = await resolver.resolve(getRandomPath());
                expect(title).toBeNull();
            })
        });

        test('Resolve reserved paths', async () => {
            const file = vaultFacade.getTFile('path_reserved.md');
            parse.mockReturnValueOnce('fronttitle');
            getCache.mockReturnValueOnce({});
            resolver.changePath('{{ title }} and {{ _path }} {{ _basename }} {{ _name }}');
            const title = await resolver.resolve(file);
            expect(title).toEqual(`fronttitle and ${file.path} ${file.basename} ${file.name}`);
        })

        describe('Test option [excluded]', () => {
            const title = 'title_test_excluded';
            const path = 'path/to/stub.md';
            beforeAll(() => {
                resolver.changePath('title');
                parse.mockImplementation(() => title);
            })
            test('Title will be resolved', async () => {
                await expect(resolver.resolve(path)).resolves.toEqual(title);
            })

            test('Title is resolved', () => {
                expect(resolver.isResolved(path)).toBeTruthy();
            })

            test('Title is resolved after excluded option update', async () => {
                resolver.setExcluded(['doc']);
                expect(onUnresolvedHandler).not.toHaveBeenCalled();
                expect(resolver.isResolved(path)).toBeTruthy();
            })

            test('Title is not resolved because file is on excluded path', () => {
                resolver.setExcluded(['path']);
                expect(onUnresolvedHandler).toHaveBeenCalled();
                expect(resolver.isResolved(path)).toBeFalsy();
            })

            test('Title won`t be resolved', async () => {
                await expect(resolver.resolve(path)).resolves.toBeNull();
                expect(parse).not.toHaveBeenCalled();
            })
            test('Title will be resolved because file is not ignored already', async () => {
                resolver.setExcluded(['path/to/not']);
                await expect(resolver.resolve(path)).resolves.toEqual(title);
                expect(parse).toHaveBeenCalled();
            })
        })
    })

    describe('Title multiple resolving', () => {
        beforeEach(() => {
            parse.mockImplementation(() => (Math.random() * Math.random()).toString());
        })
        let title: string = null;
        const file = vault.getAbstractFileByPath('mock_path.md');

        const testTitleResolved = async () => {
            expect(await resolver.resolve(file.path)).toEqual(title);
            expect(parse).not.toHaveBeenCalled();
        };
        const testThatPasseCalledAndTitleEqual = async () => {
            const newTitle = await resolver.resolve(file.path);
            expect(newTitle).not.toEqual(title);
            expect(parse).toHaveBeenCalled();
            title = newTitle;
        }

        test('PathTemplate must be called', async () => {
            title = await resolver.resolve(file.path);
            expect(parse).toHaveBeenCalled();
        });

        test('Get title without parse', testTitleResolved)

        test('Parse after edit', async () => {
            resolver.revoke(file);
            await testThatPasseCalledAndTitleEqual();
        })

        test('Get title without parse after edit', testTitleResolved)

        test('Parse after delete', async () => {
            resolver.revoke(file);
            await testThatPasseCalledAndTitleEqual()
        });

        test('Get title without parse after edit', testTitleResolved)
    });

    describe('Test concurrent resolving', () => {
        const path = 'concurrent.md';
        const expected = 'resolved_title';

        beforeAll(() => {
            parse.mockImplementation(() => expected);
        });

        beforeEach(() => {
            getCache.mockClear();
        })

        test('Title is not resolved and returns null', () => {
            expect(resolver.isResolved(path)).toBeFalsy();
            expect(resolver.getResolved(path)).toBeNull();
        })

        test('Resolve title twice, but parse only once', async () => {
            const firstPromise = resolver.resolve(path);
            const secondPromise = resolver.resolve(path);

            const firstTitle = await firstPromise;
            const secondTitle = await secondPromise;

            expect(firstTitle).toEqual(expected);
            expect(secondTitle).toEqual(expected);

            expect(parse).toHaveBeenCalledTimes(1);


            expect(getCache).toHaveBeenCalledTimes(1);
            expect(parse).toHaveBeenCalledTimes(1);
        })

        test('Title is resolved and return expected', () => {
            expect(resolver.isResolved(path)).toBeTruthy();
            expect(resolver.getResolved(path)).toEqual(expected);
        })
    })

    describe('Test exceptions', () => {
        test('Return null because of non valid meta-value', async () => {
            const path = 'object_title';
            parse.mockRestore();
            getCache.mockImplementationOnce((): CachedMetadata => ({frontmatter: {[path]: {}} as any}))
            resolver.changePath(path);
            await expect(resolver.resolve(getRandomPath())).rejects.toBeInstanceOf(Error);
        })
    })
});
