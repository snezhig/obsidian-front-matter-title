import App from "@src/App";
import Container from "@config/inversify.config";
import SI from "@config/inversify.types";
import {interfaces} from "inversify";
import Simple from "@src/Creator/Template/Simple";
import DispatcherInterface from "@src/EventDispatcher/Interfaces/DispatcherInterface";

Container.rebind(SI.template).toConstantValue('title');

const spy = {
    addListener: jest.spyOn<DispatcherInterface<any>, 'addListener'>(Container.get(SI.dispatcher), 'addListener')
}
const factory = {
    meta: jest.fn((context: interfaces.Context): any => (path: string) => ({title: 'resolved_title'}))
}
Container.rebind<interfaces.Factory<string[]>>(SI['factory.meta']).toFactory(factory.meta);

describe('Test App', () => {
    new App();
    test('Should subscribe on events', () => {
        expect(spy.addListener).toHaveBeenCalledWith('settings.changed', expect.anything());
    })

})