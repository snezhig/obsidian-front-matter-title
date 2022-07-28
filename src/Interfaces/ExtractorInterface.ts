export default interface ExtractorInterface {
    extract(path: string, obj: {[k: string]: any}): string|null;
}