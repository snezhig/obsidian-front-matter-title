import {interfaces} from "inversify";
import Container = interfaces.Container;
import TemplateInterface from "../../src/Interfaces/TemplateInterface";
import TYPES from "../inversify.types";
import TemplateFactory from "../../src/Creator/Template/Factory";
import Simple from "../../src/Creator/Template/Simple";
import TemplatePlaceholderInterface from "../../src/Interfaces/TemplatePlaceholderInterface";
import MetaPlaceholder from "../../src/Creator/Template/Placeholders/MetaPlaceholder";
import CreatorInterface from "../../src/Interfaces/CreatorInterface";
import Creator from "../../src/Creator/Creator";
import PlaceholderFactory from "../../src/Creator/Template/Placeholders/Factory";
import Composite from "@src/Creator/Template/Composite";
import BracketsPlaceholder from "@src/Creator/Template/Placeholders/BracketsPlaceholder";

export default (container: Container) => {
    container.bind<TemplateInterface>(TYPES["creator.template"])
        .toDynamicValue(context => context.container.get<TemplateFactory>(TYPES["creator.template.factory"]).create())
        .whenTargetNamed('auto');

    container
        .bind<interfaces.Factory<TemplateInterface>>(TYPES['creator.template.factory.resolver'])
        .toAutoNamedFactory<TemplateInterface>(TYPES['creator.template']);

    container.bind<TemplateFactory>(TYPES['creator.template.factory']).to(TemplateFactory).inSingletonScope();
    container.bind<TemplateInterface>(TYPES["creator.template"]).to(Simple).whenTargetNamed('simple');

    container.bind<TemplateInterface>(TYPES["creator.template"]).to(Composite).whenTargetNamed('composite');

    container.bind<TemplatePlaceholderInterface>(TYPES.placeholder).to(MetaPlaceholder).whenTargetNamed('meta');
    container.bind<TemplatePlaceholderInterface>(TYPES.placeholder).to(BracketsPlaceholder).whenTargetNamed('brackets');

    container.bind<CreatorInterface>(TYPES.creator).to(Creator);

    container
        .bind<interfaces.Factory<TemplatePlaceholderInterface>>(TYPES["creator.template.placeholder.factory.resolver"])
        .toFactory<TemplatePlaceholderInterface, [string, string]>(context => (type: string, placeholder: string) => {
            const item = context.container.getNamed<TemplatePlaceholderInterface>(TYPES.placeholder, type);
            item.setPlaceholder(placeholder);
            return item;
        });

    container.bind<PlaceholderFactory>(TYPES['creator.template.placeholder.factory']).to(PlaceholderFactory).inSingletonScope();
}