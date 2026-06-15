export interface IRandomProvider {
  nextNumber(): number
  nextNumberInRange(min: number, max: number): number
  nextColor(): number
  pickOne<T>(items: readonly T[]): T
}
