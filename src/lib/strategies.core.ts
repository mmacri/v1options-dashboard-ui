import { OptionParams } from "./greeks"

export interface Strategy {
  id: string
  name: string
  payoff: (p: OptionParams) => { price: number; pl: number }[]
  whenToUse: string[]
  keyGreeks: string[]
  legs: string[]
  breakeven: (p: OptionParams) => number | number[]
}

const range = (p: OptionParams) => {
  const start = Math.max(0, p.K - 30)
  const end = p.K + 30
  const arr: number[] = []
  for (let x = start; x <= end; x += 2) arr.push(x)
  return arr
}

export const coreStrategies: Strategy[] = [
  {
    id: "long-call",
    name: "Long Call",
    legs: ["Buy Call"],
    whenToUse: [
      "You expect the stock to rise significantly",
      "Earnings announcement approaching with positive expectations",
      "Technical breakout patterns suggesting upward momentum",
      "Low cost way to participate in upside potential",
    ],
    keyGreeks: ["+Δ", "+ν", "−Θ"],
    breakeven: p => p.K + p.Premium,
    payoff: p =>
      range(p).map(price => ({ price, pl: Math.max(price - p.K, 0) - p.Premium })),
  },
  {
    id: "long-put",
    name: "Long Put",
    legs: ["Buy Put"],
    whenToUse: [
      "You expect the stock to decline significantly",
      "Negative news or poor earnings outlook for the company",
      "Hedging against a long position in the underlying stock",
      "Low cost way to speculate on downside movement",
    ],
    keyGreeks: ["−Δ", "+ν", "−Θ"],
    breakeven: p => p.K - p.Premium,
    payoff: p =>
      range(p).map(price => ({ price, pl: Math.max(p.K - price, 0) - p.Premium })),
  },
  {
    id: "covered-call",
    name: "Covered Call",
    legs: ["Buy Stock", "Sell Call"],
    whenToUse: [
      "You believe the stock will trade sideways",
      "You want to generate income from a long stock position",
      "You are willing to sell your shares at the strike price",
      "You expect moderate price appreciation but want some downside protection",
    ],
    keyGreeks: ["+Δ (tempered)", "−ν", "+Θ"],
    breakeven: p => p.S - p.Premium,
    payoff: p =>
      range(p).map(price => ({
        price,
        pl: price - p.S - Math.max(price - p.K, 0) + p.Premium,
      })),
  },
  {
    id: "protective-put",
    name: "Protective Put",
    legs: ["Buy Stock", "Buy Put"],
    whenToUse: [
      "You own the stock and want downside protection",
      "Volatile market conditions with uncertain outlook",
      "Earnings announcements or macro events could cause large drops",
      "Insurance against a decline while retaining upside exposure",
    ],
    keyGreeks: ["+Δ (tempered)", "+ν", "−Θ"],
    breakeven: p => p.S + p.Premium,
    payoff: p =>
      range(p).map(price => ({
        price,
        pl: price - p.S + Math.max(p.K - price, 0) - p.Premium,
      })),
  },
]
