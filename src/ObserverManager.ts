/**
 * ObserverManager.ts
 *
 * This file provides a utility class for managing MutationObservers and
 * debouncing function calls across the plugin. It helps prevent performance
 * issues by limiting how frequently expensive operations (like DOM updates)
 * can occur when the DOM changes frequently.
 *
 * The ObserverManager tracks all active observers and debounce timers, and
 * provides a single cleanup method to disconnect everything when the plugin
 * unloads, preventing memory leaks.
 */

/**
 * Utility class for managing mutation observers and debouncing
 *
 * This class provides centralized management of MutationObserver instances
 * and debounce timers. It helps prevent performance issues that can occur
 * when the DOM changes frequently (like when files are renamed or added).
 * All observers and timers can be cleaned up with a single method call.
 */
export class ObserverManager {
  private observers: MutationObserver[] = []
  private debounceTimers: Map<string, NodeJS.Timeout> = new Map()

  /**
   * Adds a mutation observer to be managed
   *
   * The observer will be automatically disconnected when cleanup() is called.
   * This ensures proper cleanup to prevent memory leaks.
   *
   * @param observer - The MutationObserver instance to track
   */
  add(observer: MutationObserver): void {
    this.observers.push(observer)
  }

  /**
   * Debounces a function call to prevent excessive updates
   *
   * This is useful when you need to perform an expensive operation in response
   * to frequent events (like DOM mutations). The function will only be called
   * after the specified delay has passed without any new calls to debounce.
   *
   * If the same key is used again before the delay expires, the previous timer
   * is cancelled and a new timer is started. This is useful for scenarios like
   * file lists where many changes might occur in quick succession.
   *
   * @param key - Unique identifier for the debounced function (e.g., "fileexplorer")
   * @param fn - The function to debounce
   * @param delay - The delay in milliseconds before calling the function (default: 100ms)
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
   * Cleans up all observers and timers
   *
   * Disconnects all MutationObservers and clears all debounce timers.
   * This should be called when the plugin unloads to prevent memory leaks
   * and ensure proper cleanup of all resources.
   */
  cleanup(): void {
    this.observers.forEach(observer => observer.disconnect())
    this.observers = []
    this.debounceTimers.forEach(timer => clearTimeout(timer))
    this.debounceTimers.clear()
  }
}
