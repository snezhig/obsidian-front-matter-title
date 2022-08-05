import {Resolving} from "@src/Interfaces/ResolverInterface";
import ResolverSync from "@src/Resolver/ResolverSync";
import App from "@src/App";
import Container from "@config/inversify.config";
import SI from "@config/inversify.types";
import {interfaces} from "inversify";
import Factory from "@src/Creator/Template/Factory";
import Simple from "@src/Creator/Template/Simple";
import DispatcherInterface from "@src/EventDispatcher/Interfaces/DispatcherInterface";
import {ResolverEvents} from "@src/Resolver/ResolverType";
import {SettingsEvent} from "@src/Settings/SettingsType";

Container.rebind(SI.template).toConstantValue('title');

const spy = {
    'factory:template': jest.spyOn<Factory, 'create'>(Factory.prototype, 'create'),
    addListener: jest.spyOn<DispatcherInterface<any>, 'addListener'>(Container.get(SI.dispatcher), 'addListener')
}
const factory = {
    meta: jest.fn((context: interfaces.Context): any => (path: string) => ({title: 'resolved_title'}))
}
Container.rebind<interfaces.Factory<string[]>>(SI['factory.meta']).toFactory(factory.meta);
const app = new App();

describe('Test default state', () => {
    test('Should create simple template', () => {
        expect(spy["factory:template"]).toHaveBeenCalledTimes(1);
        expect(spy["factory:template"]).toHaveReturnedWith(expect.any(Simple))
    })
    test('Should subscribe on events', () => {
        expect(spy.addListener).toHaveBeenCalledWith('settings.changed', expect.anything());
    })
    describe('Test dependencies for resolve', () => {
        describe('Test sync resolver', () => {
            const resolver = app.getResolver(Resolving.Sync);
            test('Should be instance of sync resolver', () => {
                expect(resolver).toBeInstanceOf(ResolverSync);
            })
            test('Should return value by meta placeholder', () => {
                expect(resolver.resolve('/path/to/file.md')).toEqual('resolved_title');
                expect(factory.meta).toHaveBeenCalledTimes(1);
            })
        })
    })
})