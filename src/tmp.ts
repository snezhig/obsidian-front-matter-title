import Container from '../config/inversify.config';
import PlaceholderFactory from "./Creator/Template/Placeholders/Factory";
import TemplateInterface from "./Interfaces/TemplateInterface";
import Factory from "./Creator/Template/Factory";
import CreatorInterface from "./Interfaces/CreatorInterface";
import TYPES from "../config/inversify.types";

const d = Container.get(TYPES.dispatcher);
console.log(d);

const s = Container.get(TYPES.creator);
console.log(s);

console.log(Container.get<CreatorInterface>(TYPES.creator));