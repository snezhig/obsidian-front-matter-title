import {Resolving} from "@src/Interfaces/ResolverInterface";
import ResolverSync from "@src/Resolver/ResolverSync";
import App from "@src/App";
import Container from "@config/inversify.config";
import SI from "@config/inversify.types";
import {interfaces} from "inversify";

Container.rebind(SI.template).toConstantValue('title');
const factory = {
    meta: jest.fn((context: interfaces.Context): any => (path: string) => ({title: 'resolved_title'}))
}
Container.rebind<interfaces.Factory<string[]>>(SI['factory.meta']).toFactory(factory.meta);
const app = new App();

describe('Test default state', () => {
    describe('Test resolvers', () => {
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