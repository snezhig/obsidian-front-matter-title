import { injectable } from "inversify";

@injectable()
export default class FakeTitleElementService {
    handleHoverEvents: boolean = false;

    addFakeTitleElement(originalElement: HTMLElement, title: string): void {
        if (!originalElement) {
            return;
        }

        const container = originalElement.parentElement;

        if (!container || !title) {
            this.removeFakeTitleElement(originalElement);
            return;
        }

        let fakeTitleElement = this.fakeTitleElementMap.get(originalElement);

        if (fakeTitleElement?.innerText === title) {
            return;
        }

        if (!fakeTitleElement) {
            fakeTitleElement = document.createElement("div");
            this.fakeTitleElementMap.set(originalElement, fakeTitleElement);
            fakeTitleElement.className = originalElement.className;
            fakeTitleElement.innerText = title;

            if (this.handleHoverEvents) {
                originalElement.addEventListener("mouseenter", this.mouseEnterHandler);
                originalElement.addEventListener("mouseleave", this.mouseLeaveHandler);
            }

            originalElement.addEventListener("blur", this.blurHandler);

            fakeTitleElement.addEventListener("click", () => {
                fakeTitleElement.hidden = true;
                originalElement.hidden = false;
                originalElement.focus();
            });
            container.insertBefore(fakeTitleElement, originalElement);
        }

        fakeTitleElement.innerText = title;
        this.showFakeTitleElement(originalElement);
    }

    removeFakeTitleElements(): void {
        for (const originalElement of this.fakeTitleElementMap.keys()) {
            this.removeFakeTitleElement(originalElement);
        }
    }

    private fakeTitleElementMap = new Map<HTMLElement, HTMLElement>();

    private showFakeTitleElement(originalElement: HTMLElement) {
        const fakeTitleElement = this.fakeTitleElementMap.get(originalElement);
        originalElement.hidden = true;
        fakeTitleElement.hidden = false;
    };

    private mouseEnterHandler = ((event: MouseEvent) => {
        const srcElement = event.target as HTMLElement
        srcElement.dataset['hovered'] = 'true';
    }).bind(this);

    private mouseLeaveHandler = ((event: MouseEvent) => {
        const srcElement = event.target as HTMLElement
        srcElement.dataset['hovered'] = 'false';
        setTimeout(() => {
            this.restoreFakeTitleElement(srcElement);
        }, 500);
    }).bind(this);

    private restoreFakeTitleElement(srcElement: HTMLElement) {
        if (srcElement.dataset['hovered'] === 'false') {
            if (document.activeElement !== srcElement) {
                this.showFakeTitleElement(srcElement);
            } else {
                setTimeout(() => {
                    this.restoreFakeTitleElement(srcElement);
                }, 500);
            }
        }
    }

    private blurHandler = ((event: MouseEvent) => {
        const srcElement = event.target as HTMLElement
        this.showFakeTitleElement(srcElement);
    }).bind(this);

    private removeFakeTitleElement(originalElement: HTMLElement): void {
        if (!originalElement) {
            return;
        }

        originalElement.hidden = false;

        const fakeTitleElement = this.fakeTitleElementMap.get(originalElement);

        if (fakeTitleElement) {
            fakeTitleElement.remove();
            this.fakeTitleElementMap.delete(originalElement);
        }

        if (this.handleHoverEvents) {
            originalElement.removeEventListener("mouseenter", this.mouseEnterHandler);
            originalElement.removeEventListener("mouseleave", this.mouseLeaveHandler);
        }

        originalElement.removeEventListener("blur", this.blurHandler);
    }
}
