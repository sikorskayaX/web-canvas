import type { IRandomProvider } from './IRandomProvider.ts'

const MAX_RGB_COLOR = 0xffffff

export class MathRandomProvider implements IRandomProvider {
  nextNumber(): number {
    return Math.random()
  }

  nextNumberInRange(min: number, max: number): number {
    return min + this.nextNumber() * (max - min)
  }

  nextColor(): number {
    return Math.floor(this.nextNumber() * MAX_RGB_COLOR)
  }

  pickOne<T>(items: readonly T[]): T {
    const index = Math.floor(this.nextNumber() * items.length)
    const item = items[index]
    if (item === undefined) {
      throw new Error('Cannot pick item from an empty collection')
    }
    return item
  }
}
