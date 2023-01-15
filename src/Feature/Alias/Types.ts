import { StrategyInterface, ValidatorInterface } from "./Interfaces";

export enum ValidatorType {
    FrontmatterRequired = "fr",
    FrontmatterAuto = "fa",
}

export enum StrategyType {
    Ensure = "ensure",
    Adjust = "adjust",
    Replace = "replace",
}

export type StrategyFactory = (type: StrategyType) => StrategyInterface;

export type ValidatorFactory = (type: ValidatorType) => ValidatorInterface;
