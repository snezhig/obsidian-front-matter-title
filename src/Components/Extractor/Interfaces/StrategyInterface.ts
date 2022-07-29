export default interface StrategyInterface {
    support(): boolean;

    process(v: any): string | null;
}