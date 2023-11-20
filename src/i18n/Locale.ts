import { moment } from "obsidian";
import en from "./en";
import ru from "./ru";
import i18next from "i18next";
import zh from "./zh";
import zh_tw from "./zh-tw";
import ko from "./ko";
import it from "./it";
import id from "./id";
import ro from "./ro";
import pl from "./pl";
import cs from "./cs";
import de from "./de";
import es from "./es";
import fr from "./fr";
import no from "./no";
import pr_br from "./pr-br";
import pt from "./pt";
import ja from "./ja";
import da from "./da";
import uk from "./uk";
import sq from "./sq";
import th from "./th";
import fa from "./fa";
import tr from "./tr";
import nl from "./nl";
import am from "./am";
import ms from "./ms";

type DeepPartial<T> = { [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K] };

//https://stackoverflow.com/questions/73159893/typescript-string-dot-notation-of-nested-generic-type-that-belongs-to-property-o
type Dot<T extends string, U extends string> = "" extends U ? T : `${T}.${U}`;

type DotNot<T> = T extends string
    ? ""
    : {
          [K in Extract<keyof T, string>]: Dot<K, DotNot<T[K]>>;
      }[Extract<keyof T, string>];

const defaultLocale = "en";
const locale = moment.locale();

i18next.init({
    lng: locale,
    fallbackLng: defaultLocale,
    resources: {
        en: { translation: en },
        ru: { translation: ru },
        zh: { translation: zh },
        "zh-TW": { translation: zh_tw },
        ko: { translation: ko },
        it: { translation: it },
        id: { translation: id },
        ro: { translation: ro },
        "pt-BR": { translation: pr_br },
        cs: { translation: cs },
        de: { translation: de },
        es: { translation: es },
        fr: { translation: fr },
        no: { translation: no },
        pl: { translation: pl },
        pt: { translation: pt },
        ja: { translation: ja },
        da: { translation: da },
        uk: { translation: uk },
        sq: { translation: sq },
        th: { translation: th },
        fa: { translation: fa },
        tr: { translation: tr },
        nl: { translation: nl },
        am: { translation: am },
        ms: { translation: ms },
    },
    nsSeparator: "|",
});
const resolved = i18next.resolvedLanguage;
if (resolved !== locale) {
    if (i18next.languages.includes(locale)) {
        /* eslint-stop-next-line no-console  */
        console.warn(`Locale ${locale} empty. Resolved ${resolved}`);
    } else {
        /* eslint-stop-next-line no-console  */
        console.warn(`Locale ${locale} does not exist. Resolved ${resolved}`);
    }
}
export type Translation = DeepPartial<typeof en>;

export const t = (path: DotNot<typeof en>, params?: object): string => {
    return i18next.t(path, params);
};
