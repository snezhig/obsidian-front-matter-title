import SI from "@config/inversify.types";
import Callback from "@src/Components/EventDispatcher/Callback";
import Event from "@src/Components/EventDispatcher/Event";
import DispatcherInterface from "@src/Components/EventDispatcher/Interfaces/DispatcherInterface";
import { Feature } from "@src/enum";
import FeatureInterface from "@src/Interfaces/FeatureInterface";
import { AppEvents } from "@src/Types";
import { inject, injectable } from "inversify";

@injectable()
export default class FileNoteLinkFilterFeature implements FeatureInterface<Feature> {
  private enabled = false;
  private static bound = false;
  constructor(
    @inject(SI.dispatcher)
    private dispatcher: DispatcherInterface<AppEvents>
  ) {
    this.bind();
  }

  private bind(): void {
    if (FileNoteLinkFilterFeature.bound) {
      return;
    }
    this.dispatcher.addListener(
      "note:link:filter",
      new Callback((e) => {
        console.log(this.isEnabled());
        if (!this.isEnabled()) {
          return e;
        }
        return new Event({ links: e.get().links.filter((e) => !/^\[\[.*\|{1,}.*]]$/.test(e.original)) });
      })
    );
  }

  async enable(): Promise<void> {
    this.enabled = true;
  }
  async disable(): Promise<void> {
    this.enabled = false;
  }
  getId(): Feature {
    return Feature.FileNoteLinkFilter;
  }
  isEnabled(): boolean {
    return this.enabled;
  }
}
