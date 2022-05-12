import TitleResolver from "../../../../src/Title/Resolver/TitleResolver";
import {MetadataCache, Vault} from "obsidian";
import MetaTitleParser from "../../../../src/MetaTitleParser";

jest.mock('../../../../src/MetaTitleParser');
const read = jest.spyOn<MetadataCache, any>(MetadataCache.prototype, 'getCache').mockImplementation(() => null);
const parse = jest.spyOn(MetaTitleParser, "parse");

const Options = {
    metaPath: 'title',
    excluded: [] as string[]
};
const vault = new Vault();

const onUnresolvedHandler = jest.fn();
let resolver = new TitleResolver(new MetadataCache(), Options);
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
                parse.mockImplementation(async (path: string) => {
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
                resolver.setMetaPath('not.exists.path');
                const title = await resolver.resolve(getRandomPath());
                expect(title).toBeNull();
            })
        });

        describe('Test option [excluded]', () => {
            const title = 'title_test_excluded';
            const path = 'path/to/stub.md';
            beforeAll(() => {
                parse.mockImplementation(async () => title);
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
            parse.mockImplementation(async () => (Math.random() * Math.random()).toString());
        })
        let title: string = null;
        const path = 'mock_path.md';

        const testTitleResolved = async () => {
            expect(await resolver.resolve(path)).toEqual(title);
            expect(parse).not.toHaveBeenCalled();
        };
        const testThatPasseCalledAndTitleEqual = async () => {
            const newTitle = await resolver.resolve(path);
            expect(newTitle).not.toEqual(title);
            expect(parse).toHaveBeenCalled();
            title = newTitle;
        }

        test('Parser must be called', async () => {
            title = await resolver.resolve(path);
            expect(parse).toHaveBeenCalled();
        });

        test('Get title without parse', testTitleResolved)

        test('Parse after edit', async () => {
            resolver.revoke(vault.getAbstractFileByPath(path));
            await testThatPasseCalledAndTitleEqual();
        })

        test('Get title without parse after edit', testTitleResolved)

        test('Parse after delete', async () => {
            resolver.revoke(vault.getAbstractFileByPath(path));
            await testThatPasseCalledAndTitleEqual()
        });

        test('Get title without parse after edit', testTitleResolved)

    });

    describe('Test concurrent resolving', () => {
        let resolve: Function = null;
        const path = 'concurrent.md';
        const expected = 'resolved_title';

        beforeAll(() => {
            parse.mockImplementation(async () => new Promise(r => {
                const timer = setInterval(() => {
                    if (resolve) {
                        r(resolve());
                        clearInterval(timer);
                    }
                }, 1)
            }));
        })

        beforeEach(() => {
            read.mockClear();
        })

        test('Title is not resolved and returns null', () => {
            expect(resolver.isResolved(path)).toBeFalsy();
            expect(resolver.getResolved(path)).toBeNull();
        })

        test('Resolve title twice, but parse only once', async () => {
            const firstPromise = resolver.resolve(path);
            const secondPromise = resolver.resolve(path);
            resolve = () => expected;

            const firstTitle = await firstPromise;
            const secondTitle = await secondPromise;
            expect(firstTitle).toEqual(expected);
            expect(secondTitle).toEqual(expected);


            expect(read).toHaveBeenCalledTimes(1);
            expect(parse).toHaveBeenCalledTimes(1);
        })

        test('Title is resolved and return expected', () => {
            expect(resolver.isResolved(path)).toBeTruthy();
            expect(resolver.getResolved(path)).toEqual(expected);
        })
    })
});
