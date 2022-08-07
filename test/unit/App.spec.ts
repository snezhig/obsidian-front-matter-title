import App from "@src/App";
import Container from "@config/inversify.config";
import SI from "@config/inversify.types";
import {interfaces} from "inversify";
import Simple from "@src/Creator/Template/Simple";
import DispatcherInterface from "@src/EventDispatcher/Interfaces/DispatcherInterface";
import ObjectHelper from "@src/Utils/ObjectHelper";
import Event from "@src/EventDispatcher/Event";
import BlackWhiteListInterface from "@src/Components/BlackWhiteList/BlackWhiteListInterface";
import BlackWhiteList from "@src/Components/BlackWhiteList/BlackWhiteList";

Container.rebind(SI.template).toConstantValue('title');

const spy = {
    addListener: jest.spyOn<DispatcherInterface<any>, 'addListener'>(Container.get(SI.dispatcher), 'addListener'),
    dispatch: jest.spyOn<DispatcherInterface<any>, 'dispatch'>(Container.get(SI.dispatcher), 'dispatch'),
    compare: jest.spyOn(ObjectHelper, 'compare'),
    list: {
        setMode: jest.spyOn<BlackWhiteListInterface, 'setMode'>(BlackWhiteList.prototype, 'setMode'),
        setList: jest.spyOn<BlackWhiteListInterface, 'setList'>(BlackWhiteList.prototype, 'setList'),
    }
}
const factory = {
    meta: jest.fn((context: interfaces.Context): any => (path: string) => ({title: 'resolved_title'}))
}
Container.rebind<interfaces.Factory<string[]>>(SI['factory.meta']).toFactory(factory.meta);
const dispatcher = Container.get<DispatcherInterface<any>>(SI.dispatcher);
describe('Test App', () => {
    new App();
    test('Should subscribe on events', () => {
        expect(spy.addListener).toHaveBeenCalledWith('settings.changed', expect.anything());
    })

    describe('Test "settings.changed event"', () => {
        afterEach(() => spy.dispatch.mockClear())
        beforeAll(() => spy.dispatch.mockClear())
        test('Should change template and dispatch new event', () => {
            dispatcher.dispatch('settings.changed', new Event({old: {path: 'title'}, actual: {path: 'actual_title'}}));
            expect(Container.get<string>(SI.template)).toEqual('actual_title');
            expect(spy.dispatch).toHaveBeenCalledWith('template:changed', new Event({
                old: 'title',
                new: 'actual_title'
            }));
            expect(spy.dispatch).toHaveBeenCalledWith('resolver.clear', new Event({all: true}));
            expect(spy.dispatch).toHaveBeenCalledTimes(3);
        })

        test('Should change list mode and dispatch new event', () => {
            dispatcher.dispatch('settings.changed', new Event({
                old: {rules: {paths: {mode: 'black'}}},
                actual: {rules: {paths: {mode: 'white'}}}
            }));
            expect(spy.list.setMode).toHaveBeenCalledTimes(1);
            expect(spy.list.setMode).toHaveBeenCalledWith('white');
            expect(spy.list.setList).not.toHaveBeenCalled();
            expect(spy.dispatch).toHaveBeenCalledTimes(2);
            expect(spy.dispatch).toHaveBeenCalledWith('resolver.clear', new Event({all: true}));
        })

        test('Should change list values and dispatch new event', () => {
            spy.list.setMode.mockClear();
            dispatcher.dispatch('settings.changed', new Event({
                old: {rules: {paths: {values: []}}},
                actual: {rules: {paths: {values: ['foo', 'bar']}}}
            }));
            expect(spy.list.setList).toHaveBeenCalledTimes(1);
            expect(spy.list.setList).toHaveBeenCalledWith(['foo', 'bar']);
            expect(spy.list.setMode).not.toHaveBeenCalled();
            expect(spy.dispatch).toHaveBeenCalledTimes(2);
            expect(spy.dispatch).toHaveBeenCalledWith('resolver.clear', new Event({all: true}));
        })
    })
})