import {  ContainerModule } from "inversify";
import Api from "../../src/Components/ApiAdapter/Api";
import Defer from "../../src/Components/ApiAdapter/Defer";
import SI from "../inversify.types";

export default new ContainerModule(bind => {
    bind(SI.api).to(Api).inSingletonScope();
    bind(SI["factory:api"]).toFactory(c => () => c.container.get(SI.api));
    bind(SI.defer).to(Defer).inSingletonScope();
});