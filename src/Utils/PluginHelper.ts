import { SettingsType } from "@src/Settings/SettingsType";
import { Feature } from "@src/enum";

export default class PluginHelper {
  public static createDefaultSettings(): SettingsType {
    return {
      templates: [],
      managers: {
        explorer: false,
        graph: false,
        header: false,
        quick_switcher: false,
        file_note_link: false,
      },
      rules: {
        paths: {
          mode: "black",
          values: [],
        },
        delimiter: {
          enabled: false,
          value: "",
        },
          file_note_link: {
            replace_all: false
          }
      },
      debug: false,
      boot: {
        delay: 0,
      },
      features: {
        [Feature.ExplorerSort]: { enabled: false },
        [Feature.FileNoteLinkApproval]: { enabled: false },
      },
    };
  }
}
