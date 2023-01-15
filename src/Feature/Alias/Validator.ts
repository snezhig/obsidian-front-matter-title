import { CachedMetadata } from "obsidian";
import { ValidatorInterface } from "./Interfaces";
import { injectable } from "inversify";

@injectable()
export class ValidatorRequired implements ValidatorInterface {
    validate(metadata: CachedMetadata): boolean {
        return metadata.frontmatter ? true : false;
    }
}

@injectable()
export class ValidatorAuto implements ValidatorInterface {
    validate(metadata: CachedMetadata): boolean {
        if (!metadata.frontmatter) {
            metadata.frontmatter = {
                position: {
                    end: {
                        col: 0,
                        line: 0,
                        offset: 0,
                    },
                    start: {
                        col: 0,
                        line: 0,
                        offset: 0,
                    },
                },
            };
        }
        return true;
    }
}
