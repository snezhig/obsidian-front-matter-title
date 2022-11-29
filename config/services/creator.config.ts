import {ContainerModule, interfaces} from "inversify";
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
import FilePlaceholder from "@src/Creator/Template/Placeholders/FilePlaceholder";
import HeadingPlaceholder from "@src/Creator/Template/Placeholders/HeadingPlaceholder";

export default new ContainerModule((bind) => {

    bind<TemplateInterface>(SI["factory:creator:templates"])
        .toFactory<TemplateInterface[]>(context => () =>
            context.container.get<string[]>(SI.templates)
                .filter(e => e)
                .map(e => context.container.get<TemplateFactory>(SI["factory:template"]).create(e))
        );
    bind<TemplateFactory>(SI['factory:template']).to(TemplateFactory);

    bind<interfaces.Factory<TemplateInterface>>(SI['factory:template:resolver'])
        .toAutoNamedFactory<TemplateInterface>(SI['creator:template']);

    bind<TemplateInterface>(SI["creator:template"]).to(Simple).whenTargetNamed('simple');

    bind<TemplateInterface>(SI["creator:template"]).to(Composite).whenTargetNamed('composite');

    bind<TemplatePlaceholderInterface>(SI.placeholder).to(MetaPlaceholder).whenTargetNamed('meta');
    bind<TemplatePlaceholderInterface>(SI.placeholder).to(FilePlaceholder).whenTargetNamed('file');
    bind<TemplatePlaceholderInterface>(SI.placeholder).to(BracketsPlaceholder).whenTargetNamed('brackets');
    bind<TemplatePlaceholderInterface>(SI.placeholder).to(HeadingPlaceholder).whenTargetNamed('heading');

    bind<CreatorInterface>(SI.creator).to(Creator);

    bind<interfaces.Factory<TemplatePlaceholderInterface>>(SI["factory:placeholder:resolver"])
        .toFactory<TemplatePlaceholderInterface, [string, string]>(context => (type: string, placeholder: string) => {
            const item = context.container.getNamed<TemplatePlaceholderInterface>(SI.placeholder, type);
            item.setPlaceholder(placeholder);
            return item;
        });

    bind(SI['getter:delimiter']).toDynamicValue((c) => () => c.container.get(SI.delimiter));
    bind<PlaceholderFactory>(SI['factory:placeholder']).to(PlaceholderFactory).inSingletonScope();
});
