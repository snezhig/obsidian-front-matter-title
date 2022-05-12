export default class TitleResolverItem {
    private title: string | null;
    private promise: Promise<string | null> | null;


    public process(promise: Promise<string | null>): Promise<string | null> {
        this.promise = new Promise<string | null>(async (r) => {
            let title = await promise;
            title = (title === null || title === '') ? null : title;

            this.title = title;
            this.promise = null;

            r(this.title);
        })

        return this.promise;
    }

    public async await(): Promise<string | null> {
        return this.promise ?? this.title;
    }

    public isResolved(): boolean {
        return this.promise === null;
    }

    public getResolved(): string | null {
        return this.title;
    }

}