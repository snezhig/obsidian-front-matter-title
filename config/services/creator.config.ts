import { ContainerModule, interfaces } from "inversify";
import SI from "../inversify.types";
import TemplateFactory from "../../src/Creator/Template/Factory";
import Simple from "../../src/Creator/Template/Simple";
import MetaPlaceholder from "../../src/Creator/Template/Placeholders/MetaPlaceholder";
import Creator from "../../src/Creator/Creator";
import PlaceholderFactory from "../../src/Creator/Template/Placeholders/Factory";
import Composite from "@src/Creator/Template/Composite";
import BracketsPlaceholder from "@src/Creator/Template/Placeholders/BracketsPlaceholder";
import FilePlaceholder from "@src/Creator/Template/Placeholders/FilePlaceholder";
import HeadingPlaceholder from "@src/Creator/Template/Placeholders/HeadingPlaceholder";
import { CreatorInterface, TemplateInterface, TemplatePlaceholderInterface } from "@src/Creator/Interfaces";
import AbstractPlaceholder from "@src/Creator/Template/Placeholders/AbstractPlaceholder";
import LogicPlaceholder from "@src/Creator/Template/Placeholders/LogicPlaceholder";

export default new ContainerModule(bind => {
    bind<TemplateFactory>(SI["factory:creator:template"]).to(TemplateFactory);

    bind<interfaces.Factory<TemplateInterface>>(SI["factory:template:resolver"]).toAutoNamedFactory<TemplateInterface>(
        SI["creator:template"]
    );

    bind<TemplateInterface>(SI["creator:template"]).to(Simple).whenTargetNamed("simple");

    bind<TemplateInterface>(SI["creator:template"]).to(Composite).whenTargetNamed("composite");

    bind<TemplatePlaceholderInterface>(SI.placeholder).to(MetaPlaceholder).whenTargetNamed(AbstractPlaceholder.META);
    bind<TemplatePlaceholderInterface>(SI.placeholder).to(FilePlaceholder).whenTargetNamed(AbstractPlaceholder.FILE);
    bind<TemplatePlaceholderInterface>(SI.placeholder)
        .to(BracketsPlaceholder)
        .whenTargetNamed(AbstractPlaceholder.BRACKETS);
    bind<TemplatePlaceholderInterface>(SI.placeholder)
        .to(HeadingPlaceholder)
        .whenTargetNamed(AbstractPlaceholder.HEADING);
    bind<TemplatePlaceholderInterface>(SI.placeholder).to(LogicPlaceholder).whenTargetNamed(AbstractPlaceholder.LOGIC);

    bind<CreatorInterface>(SI["creator:creator"]).to(Creator);

    bind<interfaces.Factory<TemplatePlaceholderInterface>>(SI["factory:placeholder:resolver"]).toAutoNamedFactory(
        SI.placeholder
    );

    bind(SI["getter:delimiter"]).toDynamicValue(c => () => c.container.get(SI.delimiter));
    bind<PlaceholderFactory>(SI["factory:placeholder"]).to(PlaceholderFactory).inSingletonScope();
});
