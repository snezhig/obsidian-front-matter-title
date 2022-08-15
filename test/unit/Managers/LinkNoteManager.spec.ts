import LinkNoteManager from "@src/Managers/LinkNoteManager";
import {mock} from "jest-mock-extended";
import ResolverInterface from "@src/Interfaces/ResolverInterface";

describe('Test test change', () => {
    const manager = new LinkNoteManager(jest.fn(), jest.fn(), jest.fn(), mock<ResolverInterface>());
    test('Should be disabled by default', () => expect(manager.isEnabled()).toBeFalsy());
    test('Should be enabled after enable', () => {
        manager.enable();
        expect(manager.isEnabled()).toBeTruthy();
    })
    test('Should be disabled after disable', () => {
        manager.disable();
        expect(manager.isEnabled()).toBeFalsy();
    })
});

test('Should not call factory because of disabled', async () => {
    const factory = jest.fn();
    const manager = new LinkNoteManager(factory, jest.fn(), jest.fn(), mock<ResolverInterface>());
    await expect(manager.update()).resolves.toBeFalsy();
    expect(factory).not.toHaveBeenCalled();
})

describe('Should not call factory', () => {
    const fileModifiableFactory = jest.fn();
    const fileFactory = jest.fn();
    const getter = jest.fn(() => []);
    const resolver = mock<ResolverInterface>();
    const manager = new LinkNoteManager(fileModifiableFactory, fileFactory, getter, resolver);
    const clear = () => {
        fileModifiableFactory.mockClear();
        fileFactory.mockClear();
        getter.mockClear()
    };
    beforeEach(clear);
    afterAll(clear);
    test('Should not call factory because there is not leaf', async () => {
        manager.enable();
        await expect(manager.update()).resolves.toBeFalsy();
        expect(getter).toHaveBeenCalled();
        expect(fileFactory).not.toHaveBeenCalled();
        expect(fileModifiableFactory).not.toHaveBeenCalled();
        expect(resolver).not.toHaveBeenCalled();
    })
    test('Should not call because there is no file', async () => {
        await expect(manager.update()).resolves.toBeFalsy();
        expect(getter).toHaveBeenCalled();
        expect(fileFactory).toHaveBeenCalled();
        expect(fileModifiableFactory).not.toHaveBeenCalled();
        expect(resolver).not.toHaveBeenCalled();
    });
    test('Should not call because there is no modifiable file', async () => {
        await expect(manager.update()).resolves.toBeFalsy();
        expect(getter).toHaveBeenCalled();
        expect(fileFactory).toHaveBeenCalled();
        expect(fileModifiableFactory).toHaveBeenCalled();
        expect(resolver).not.toHaveBeenCalled();
    });
});