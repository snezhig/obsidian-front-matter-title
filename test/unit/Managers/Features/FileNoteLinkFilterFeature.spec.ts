import {mock} from "jest-mock-extended";
import DispatcherInterface from "@src/Components/EventDispatcher/Interfaces/DispatcherInterface";
import {AppEvents} from "@src/Types";
import FileNoteLinkFilterFeature from "@src/Managers/Features/FileNoteLinkFilterFeature";
import CallbackInterface from "@src/Components/EventDispatcher/Interfaces/CallbackInterface";
import Event from "@src/Components/EventDispatcher/Event";
import {Feature} from "@src/enum";
import { NoteLink } from "@src/Utils/FileNoteLinkService";

const mockDispatcher = mock<DispatcherInterface<AppEvents>>();
const feature = new FileNoteLinkFilterFeature(mockDispatcher);
let cb: CallbackInterface<AppEvents["note:link:filter"]> = null;

test('Should return right id', () => {
    expect(FileNoteLinkFilterFeature.id()).toEqual(Feature.FileNoteLinkFilter);
    expect(feature.getId()).toEqual(Feature.FileNoteLinkFilter);
})

test('Should not add listener', () => {
    expect(mockDispatcher.addListener).not.toHaveBeenCalled();
})

test('Should add listener and be enabled', async () => {
    mockDispatcher.addListener.mockImplementationOnce((n, c: CallbackInterface<AppEvents["note:link:filter"]>) => cb = c);
    await feature.enable();
    expect(feature.isEnabled()).toBeTruthy();
    expect(mockDispatcher.addListener).toHaveBeenCalledTimes(1);
    expect(mockDispatcher.addListener).toHaveBeenCalledWith("note:link:filter", cb);
})

test('Should not add listener twice', async () => {
    await feature.enable();
    expect(mockDispatcher.addListener).toHaveBeenCalledTimes(1);
})
describe('Test callback', () => {
    const foo: NoteLink = {link: 'foo_link', original: "[[link]]", dest: '', alias: null}
    const bar: NoteLink = {link: 'bar_link', original: "[[bar|alias]]", dest: '', alias: null}
    const quote: NoteLink = {link: 'quote_link', original: "[[quote|]]", dest: '', alias: null}
    const baz: NoteLink = {link: 'baz_link', original: "[[baz]]", dest: '', alias: null}

    const event = new Event<AppEvents["note:link:filter"]>({links: [foo, bar, quote, baz]});
    test('Should filter links', () => {
        const actual = cb.execute(event).get().links;
        expect(actual).toEqual([foo, baz]);
    })
    test('Should remove listener and be disabled', async() => {
        await feature.disable();
        expect(feature.isEnabled()).toBeFalsy();
        expect(mockDispatcher.removeListener).toHaveBeenCalledWith("note:link:filter", cb);
    })
    test('Should not filter links because disabled', () => {
        const actual = cb.execute(event).get().links;
        expect(actual).toEqual([foo, bar, quote,baz]);
    })
});

test('Should not dispatch anything and only 1 listener has been added', () => {
    expect(mockDispatcher.dispatch).not.toHaveBeenCalled();
    expect(mockDispatcher.addListener).toHaveBeenCalledTimes(1);
})