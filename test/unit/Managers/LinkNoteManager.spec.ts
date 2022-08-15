import LinkNoteManager from "@src/Managers/LinkNoteManager";


describe('Test test change', () => {
    const manager = new LinkNoteManager(jest.fn());
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
    const factory = jest.fn(() => null);
    const manager = new LinkNoteManager(factory);
    await expect(manager.update()).resolves.toBeFalsy();
    expect(factory).not.toHaveBeenCalled();
})

describe('Should not call factory', () => {
    test('Should not call factory because there is not leaf', async () => {
        const factory = jest.fn(() => null);
        const manager = new LinkNoteManager(factory);
        manager.enable();
        await expect(manager.update()).resolves.toBeFalsy();
        expect(factory).not.toHaveBeenCalled();
    })
});