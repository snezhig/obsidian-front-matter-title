export default class ResolverItem {
    private title: string | null;
    private promise: Promise<string | null> | null;


    public process(promise: Promise<string | null>): void {
        this.promise = new Promise<string | null>(async (r, reject) => {
            try {
                let title = await promise;
                title = (title === null || title === '') ? null : title;

                this.title = title;
                this.promise = null;

                r(this.title);
            } catch (e) {
                reject(e);
            }
        })

        return;
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