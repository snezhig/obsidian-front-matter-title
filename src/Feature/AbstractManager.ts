import { injectable } from "inversify";
import AbstractFeature from "@src/Feature/AbstractFeature";
import ManagerFeatureInterface from "@src/Interfaces/ManagerFeatureInterface";
import { Feature } from "@src/enum";

@injectable()
export default abstract class AbstractManager extends AbstractFeature<Feature> implements ManagerFeatureInterface {
    disable(): void {
        if (this.isEnabled()) {
            this.removeFakeTitleElements();
            this.doDisable();
        }
    }

    enable(): void {
        !this.isEnabled() && this.doEnable();
    }

    async update(path: string): Promise<boolean> {
        if (!this.isEnabled()) {
            return false;
        }
        return this.doUpdate(path);
    }

    async refresh(): Promise<{ [k: string]: boolean }> {
        if (this.isEnabled()) {
            return this.doRefresh();
        }
    }

    abstract isEnabled(): boolean;

    protected abstract doEnable(): void;

    protected abstract doDisable(): void;

    protected abstract doUpdate(path: string): Promise<boolean>;

    protected abstract doRefresh(): Promise<{ [k: string]: boolean }>;

    private fakeTitleElementMap = new Map<HTMLElement, HTMLElement>();

    protected addFakeTitleElement(originalElement: HTMLElement, title: string): void {
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

            originalElement.addEventListener("mouseenter", this.mouseEnterHandler);
            originalElement.addEventListener("mouseleave", this.mouseLeaveHandler);
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

    private removeFakeTitleElements(): void {
        for (const originalElement of this.fakeTitleElementMap.keys()) {
            this.removeFakeTitleElement(originalElement);
        }
    }

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

        originalElement.removeEventListener("mouseenter", this.mouseEnterHandler);
        originalElement.removeEventListener("mouseleave", this.mouseLeaveHandler);
        originalElement.removeEventListener("blur", this.blurHandler);
    }
}
