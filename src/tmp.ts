import Container from '../config/inversify.config';
import ResolverInterface from "@src/Interfaces/ResolverInterface";
import TYPES from "@config/inversify.types";

const resolver = Container.getNamed<ResolverInterface>(TYPES.resolver, 'sync');
resolver.resolve('/test.md');
console.log(resolver);