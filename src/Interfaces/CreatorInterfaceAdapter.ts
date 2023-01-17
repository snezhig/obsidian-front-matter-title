export default interface CreatorInterfaceAdapter {
    create(path: string): string | null;
}

export interface CreatorInterface {
    create(path: string, template: string): string | null;
}
