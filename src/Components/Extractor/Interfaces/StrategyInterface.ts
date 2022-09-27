export default interface StrategyInterface {
    support(type: string): boolean;

    process(v: any): string | null;
}
