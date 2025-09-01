export interface OptionParams {
  S: number
  K: number
  Premium: number
  T: number // days to expiry
  IV: number
  r: number
  q: number
}

const toTime = (T: number) => T / 365

export function calculateGreeks(p: OptionParams) {
  const m = p.S / p.K
  const t = toTime(p.T)
  const deltaCall = m > 1 ? 0.7 : m > 0.95 ? 0.5 : 0.3
  const deltaPut = m < 1 ? -0.7 : m < 1.05 ? -0.5 : -0.3
  const gamma = Math.max(0.1, 0.3 * Math.exp(-Math.abs(m - 1) * 5))
  const theta = -p.Premium * 0.03 * (30 / p.T)
  const vega = p.Premium * 0.2 * Math.sqrt(t)
  const rhoCall = p.Premium * 0.01
  const rhoPut = -p.Premium * 0.01
  return { deltaCall, deltaPut, gamma, theta, vega, rhoCall, rhoPut }
}
