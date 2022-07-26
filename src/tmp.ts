import Container from '../config/inversify.config';
import CreatorInterface from "./Interfaces/CreatorInterface";
import TYPES from "@config/inversify.types";
const d = Container.get(TYPES.dispatcher);
console.log(d);

const s = Container.get(TYPES.creator);
console.log(s);

console.log(Container.get<CreatorInterface>(TYPES.creator));