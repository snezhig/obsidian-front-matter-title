import App from "@src/App";
import Container from "@config/inversify.config";
import SI from "@config/inversify.types";
import DispatcherInterface from "@src/EventDispatcher/Interfaces/DispatcherInterface";
import ObjectHelper from "@src/Utils/ObjectHelper";
import Event from "@src/EventDispatcher/Event";
import BlackWhiteListInterface from "@src/Components/BlackWhiteList/BlackWhiteListInterface";
import BlackWhiteList from "@src/Components/BlackWhiteList/BlackWhiteList";
import {SettingsEvent, SettingsType} from "@src/Settings/SettingsType";


const spy = {
    addListener: jest.spyOn<DispatcherInterface<any>, 'addListener'>(Container.get(SI.dispatcher), 'addListener'),
    dispatch: jest.spyOn<DispatcherInterface<any>, 'dispatch'>(Container.get(SI.dispatcher), 'dispatch'),
    compare: jest.spyOn(ObjectHelper, 'compare'),
    list: {
        setMode: jest.spyOn<BlackWhiteListInterface, 'setMode'>(BlackWhiteList.prototype, 'setMode'),
        setList: jest.spyOn<BlackWhiteListInterface, 'setList'>(BlackWhiteList.prototype, 'setList'),
    }
}

const dispatcher = Container.get<DispatcherInterface<SettingsEvent>>(SI.dispatcher);
const createDefaultSettings = (): SettingsType => ({
    template: '',
    managers: {
        quick_switcher: false,
        header: false,
        graph: false,
        explorer: false
    },
    rules: {
        paths: {mode: "black", values: []},
        delimiter: {enabled: false, value: ''}
    }
});
describe('Test App', () => {
    new App();
    test('Template should not exist', () => {
        expect(Container.isBound(SI.template)).toBeFalsy();
    })
    test('Delimiter should not exist', () => {
        expect(Container.isBound(SI.delimiter)).toBeFalsy();
    })
    test('Should subscribe on events', () => {
        expect(spy.addListener).toHaveBeenCalledWith('settings.changed', expect.anything());
        expect(spy.addListener).toHaveBeenCalledWith('settings.loaded', expect.anything());
    })

    describe('Test "settings.loaded" event', () => {
        beforeAll(() => spy.dispatch.mockClear());
        afterAll(() => {
            spy.dispatch.mockClear()
            spy.list.setMode.mockClear();
            spy.list.setList.mockClear();
        });
        test('Dispatch event', () => {
            const settings = createDefaultSettings();
            settings.template = 'title';
            settings.rules.paths = {values: ['foo'], mode: "black"};
            dispatcher.dispatch('settings.loaded', new Event({settings}));
        })
        test('Should bind template', () => {
            expect(Container.get(SI.template)).toEqual('title');
        })
        test('Should set mode for list', () => {
            expect(spy.list.setMode).toHaveBeenCalledTimes(1);
            expect(spy.list.setMode).toHaveBeenCalledWith('black');
        })
        test('Should set list for list', () => {
            expect(spy.list.setList).toHaveBeenCalledTimes(1);
            expect(spy.list.setList).toHaveBeenCalledWith(['foo']);
        })
        test('Should bind delimiter', () => {
            expect(Container.isBound(SI.delimiter)).toBeTruthy();
            expect(Container.get(SI.delimiter)).toEqual({enabled: false, value: ''});
        })
    })

    describe('Test "settings.changed event"', () => {
        afterEach(() => spy.dispatch.mockClear())
        beforeAll(() => spy.dispatch.mockClear())
        test('Should change template and dispatch new event', () => {
            const old = createDefaultSettings();
            const actual = createDefaultSettings();
            actual.template = 'actual_title';
            dispatcher.dispatch('settings.changed', new Event({old, actual}));
            expect(Container.get<string>(SI.template)).toEqual('actual_title');
            expect(spy.dispatch).toHaveBeenCalledWith('template:changed', new Event({
                old: '',
                new: 'actual_title'
            }));
            expect(spy.dispatch).toHaveBeenCalledWith('resolver.clear', new Event({all: true}));
            expect(spy.dispatch).toHaveBeenCalledTimes(3);
        })

        test('Should change list mode and dispatch new event', () => {
            const old = createDefaultSettings();
            old.rules.paths.mode = 'black';
            const actual = createDefaultSettings();
            actual.rules.paths.mode = 'white';
            dispatcher.dispatch('settings.changed', new Event({old, actual}));
            expect(spy.list.setMode).toHaveBeenCalledTimes(1);
            expect(spy.list.setMode).toHaveBeenCalledWith('white');
            expect(spy.list.setList).not.toHaveBeenCalled();
            expect(spy.dispatch).toHaveBeenCalledTimes(2);
            expect(spy.dispatch).toHaveBeenCalledWith('resolver.clear', new Event({all: true}));
        })

        test('Should change list values and dispatch new event', () => {
            spy.list.setMode.mockClear();
            const old = createDefaultSettings();
            old.rules.paths.values = [];
            const actual = createDefaultSettings();
            actual.rules.paths.values = ['foo', 'bar'];
            dispatcher.dispatch('settings.changed', new Event({old, actual}));
            expect(spy.list.setList).toHaveBeenCalledTimes(1);
            expect(spy.list.setList).toHaveBeenCalledWith(['foo', 'bar']);
            expect(spy.list.setMode).not.toHaveBeenCalled();
            expect(spy.dispatch).toHaveBeenCalledTimes(2);
            expect(spy.dispatch).toHaveBeenCalledWith('resolver.clear', new Event({all: true}));
        })
    })
})