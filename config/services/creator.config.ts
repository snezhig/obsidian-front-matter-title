import {interfaces} from "inversify";
import Container = interfaces.Container;
import TemplateInterface from "../../src/Interfaces/TemplateInterface";
import SI from "../inversify.types";
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
    container.bind<TemplateInterface>(SI["creator:template"])
        .toFactory<TemplateInterface>(context => () => context.container.get<TemplateFactory>(SI["factory:template"]).create())
        .whenTargetNamed('callback')
    container.bind<TemplateFactory>(SI['factory:template']).to(TemplateFactory);
    container
        .bind<interfaces.Factory<TemplateInterface>>(SI['factory:template:resolver'])
        .toAutoNamedFactory<TemplateInterface>(SI['creator:template']);

    container.bind<TemplateInterface>(SI["creator:template"]).to(Simple).whenTargetNamed('simple');

    container.bind<TemplateInterface>(SI["creator:template"]).to(Composite).whenTargetNamed('composite');

    container.bind<TemplatePlaceholderInterface>(SI.placeholder).to(MetaPlaceholder).whenTargetNamed('meta');
    container.bind<TemplatePlaceholderInterface>(SI.placeholder).to(BracketsPlaceholder).whenTargetNamed('brackets');

    container.bind<CreatorInterface>(SI.creator).to(Creator);

    container
        .bind<interfaces.Factory<TemplatePlaceholderInterface>>(SI["factory:placeholder:resolver"])
        .toFactory<TemplatePlaceholderInterface, [string, string]>(context => (type: string, placeholder: string) => {
            const item = context.container.getNamed<TemplatePlaceholderInterface>(SI.placeholder, type);
            item.setPlaceholder(placeholder);
            return item;
        });

    container.bind<PlaceholderFactory>(SI['factory:placeholder']).to(PlaceholderFactory).inSingletonScope();
}