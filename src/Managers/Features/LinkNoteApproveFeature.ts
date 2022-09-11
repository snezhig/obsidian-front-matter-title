import SI from "@config/inversify.types";
import LoggerInterface from "@src/Components/Debug/LoggerInterface";
import Callback from "@src/Components/EventDispatcher/Callback";
import Event from "@src/Components/EventDispatcher/Event";
import DispatcherInterface from "@src/Components/EventDispatcher/Interfaces/DispatcherInterface";
import { Feature } from "@src/enum";
import FeatureInterface from "@src/Interfaces/FeatureInterface";
import { AppEvents } from "@src/Types";
import ChangeApproveModal from "@src/UI/ChangeApproveModal";
import { inject, injectable, named } from "inversify";

@injectable()
export default class LinkNoteApproveFeature implements FeatureInterface<Feature> {
  private static bound = false;
  private enabled = false;
  constructor(
    @inject(SI.logger)
    @named("link:note:approve")
    private logger: LoggerInterface,
    @inject(SI.dispatcher)
    private dispatcher: DispatcherInterface<AppEvents>,
    @inject(SI["modal:change:approve"])
    private modal: ChangeApproveModal
  ) {
    this.bind();
  }
  async enable(): Promise<void> {
    this.enabled = true;
  }
  async disable(): Promise<void> {
    this.enabled = false;
  }
  getId(): Feature {
    return Feature.FileNoteLinkApproval;
  }

  isEnabled(): boolean {
    return this.enabled;
  }
  private bind(): void {
    if (LinkNoteApproveFeature.bound) return;
    this.dispatcher.addListener(
      "note:link:change:approve",
      new Callback((e) => {
        const { path, changes } = e.get();
        const approve = this.isEnabled() ? new Promise<boolean>((r) => this.modal.create(path, changes, r).open()) : Promise.resolve(false);
        return new Event({ path, changes, approve });
      })
    );
  }
}
