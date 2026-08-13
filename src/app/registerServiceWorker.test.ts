import { beforeEach, describe, expect, it, vi } from 'vitest'
import { registerServiceWorker } from './registerServiceWorker'

describe('registerServiceWorker', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('waits until window load before registering', () => {
    const register = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'serviceWorker', {
      configurable: true,
      value: { register },
    })

    registerServiceWorker()
    expect(register).not.toHaveBeenCalled()

    window.dispatchEvent(new Event('load'))
    expect(register).toHaveBeenCalledWith('/GYM-APP/sw.js', {
      scope: '/GYM-APP/',
      updateViaCache: 'none',
    })
  })

  it('does not throw when service worker registration is refused', async () => {
    const register = vi.fn().mockRejectedValue(new Error('blocked'))
    Object.defineProperty(navigator, 'serviceWorker', {
      configurable: true,
      value: { register },
    })

    expect(() => registerServiceWorker()).not.toThrow()
    window.dispatchEvent(new Event('load'))
    await Promise.resolve()
    expect(register).toHaveBeenCalled()
  })
})
