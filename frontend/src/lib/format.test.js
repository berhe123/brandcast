import { describe, it, expect } from 'vitest'
import { socialHandle, initials, relativeTime } from './format'

describe('socialHandle', () => {
  it('lowercases and strips non-alphanumerics', () => {
    expect(socialHandle('Aura & Co.')).toBe('@auraco')
  })
  it('falls back to @brand when empty', () => {
    expect(socialHandle('')).toBe('@brand')
    expect(socialHandle(undefined)).toBe('@brand')
  })
})

describe('initials', () => {
  it('uses the name first', () => {
    expect(initials({ name: 'Maya Rivera' })).toBe('MA')
  })
  it('falls back to email, then ?', () => {
    expect(initials({ email: 'jo@x.com' })).toBe('JO')
    expect(initials({})).toBe('?')
  })
})

describe('relativeTime', () => {
  it('reports just now for the present', () => {
    expect(relativeTime(new Date().toISOString())).toBe('just now')
  })
  it('reports minutes and hours', () => {
    expect(relativeTime(new Date(Date.now() - 5 * 60000).toISOString())).toBe('5m ago')
    expect(relativeTime(new Date(Date.now() - 3 * 3600000).toISOString())).toBe('3h ago')
  })
  it('returns empty string for invalid input', () => {
    expect(relativeTime('nonsense')).toBe('')
  })
})
