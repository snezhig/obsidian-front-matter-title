    export default interface PathTemplateInterface {
        getMetaPaths(): string[];

        /**
         * @throws TemplateTitleUndefinedError
         * @param titles
         */
        buildTitle(titles: { [k: string]: string | null }): string | null;
    }
