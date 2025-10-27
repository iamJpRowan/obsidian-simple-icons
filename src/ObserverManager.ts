/**
 * Manages mutation observers and debouncing for performance
 */
export class ObserverManager {
  private observers: MutationObserver[] = []
  private debounceTimers: Map<string, NodeJS.Timeout> = new Map()

  /**
   * Add an observer to be managed
   */
  add(observer: MutationObserver): void {
    this.observers.push(observer)
  }

  /**
   * Debounce a function call to prevent excessive updates
   */
  debounce(key: string, fn: () => void, delay: number = 100): void {
    const existingTimer = this.debounceTimers.get(key)
    if (existingTimer) {
      clearTimeout(existingTimer)
    }

    const timer = setTimeout(() => {
      fn()
      this.debounceTimers.delete(key)
    }, delay)

    this.debounceTimers.set(key, timer)
  }

  /**
   * Clean up all observers and timers
   */
  cleanup(): void {
    this.observers.forEach(observer => observer.disconnect())
    this.observers = []
    this.debounceTimers.forEach(timer => clearTimeout(timer))
    this.debounceTimers.clear()
  }
}
