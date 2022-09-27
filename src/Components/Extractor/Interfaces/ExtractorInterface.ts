export default interface ExtractorInterface {
    /**
     * @throws {PathNotFoundException}
     * @throws {TypeNotSupportedException}
     * @param path
     * @param obj
     */
    extract(path: string, obj: { [k: string]: any }): string | null | never;
}
