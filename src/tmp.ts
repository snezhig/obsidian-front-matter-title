import Container from '../config/inversify.config';
import ResolverInterface from "@src/Interfaces/ResolverInterface";
import SI from "@config/inversify.types";

const resolver = Container.getNamed<ResolverInterface>(SI.resolver, 'sync');
resolver.resolve('/test.md');
console.log(resolver);