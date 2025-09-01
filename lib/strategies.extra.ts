import { OptionParams } from "./greeks"
import { Strategy } from "./strategies.core"

const range = (p: OptionParams) => {
  const start = Math.max(0, p.K - 30)
  const end = p.K + 30
  const arr: number[] = []
  for (let x = start; x <= end; x += 2) arr.push(x)
  return arr
}

export const extraStrategies: Strategy[] = [
  {
    id: "bull-call-spread",
    name: "Bull Call Spread",
    legs: ["Buy Call K1", "Sell Call K2"],
    whenToUse: ["Moderate bullish view", "Reduce cost vs Long Call", "Accept capped upside"],
    keyGreeks: ["+Δ", "−Θ (small)", "ν depends"],
    breakeven: p => p.K + p.Premium,
    payoff: p => range(p).map(price => ({
      price,
      pl:
        Math.max(price - p.K, 0) -
        Math.max(price - (p.K + 10), 0) -
        p.Premium,
    })),
  },
  {
    id: "bear-put-spread",
    name: "Bear Put Spread",
    legs: ["Buy Put K2", "Sell Put K1"],
    whenToUse: ["Moderate bearish view", "Cheaper than Long Put", "Capped payoff"],
    keyGreeks: ["−Δ", "−Θ (small)", "ν mixed"],
    breakeven: p => p.K - p.Premium,
    payoff: p => range(p).map(price => ({
      price,
      pl:
        Math.max(p.K - price, 0) -
        Math.max(p.K - 10 - price, 0) -
        p.Premium,
    })),
  },
  {
    id: "long-straddle",
    name: "Long Straddle",
    legs: ["Buy Call", "Buy Put"],
    whenToUse: ["Expect big move", "Pre-earnings/events"],
    keyGreeks: ["±Δ≈0", "+ν", "−Θ"],
    breakeven: p => [p.K + p.Premium, p.K - p.Premium],
    payoff: p => range(p).map(price => ({
      price,
      pl:
        Math.max(price - p.K, 0) +
        Math.max(p.K - price, 0) -
        2 * p.Premium,
    })),
  },
  {
    id: "long-strangle",
    name: "Long Strangle",
    legs: ["Buy Call Kc", "Buy Put Kp"],
    whenToUse: ["Expect very large move", "Cheaper than straddle"],
    keyGreeks: ["+ν", "−Θ"],
    breakeven: p => [p.K + 10 + p.Premium, p.K - 10 - p.Premium],
    payoff: p => range(p).map(price => ({
      price,
      pl:
        Math.max(price - (p.K + 10), 0) +
        Math.max((p.K - 10) - price, 0) -
        2 * p.Premium,
    })),
  },
  {
    id: "short-straddle",
    name: "Short Straddle",
    legs: ["Sell Call", "Sell Put"],
    whenToUse: ["Expect flat/stable price", "Very high conviction/risk"],
    keyGreeks: ["−ν", "+Θ", "short Γ"],
    breakeven: p => [p.K + p.Premium, p.K - p.Premium],
    payoff: p => range(p).map(price => ({
      price,
      pl:
        2 * p.Premium -
        Math.max(price - p.K, 0) -
        Math.max(p.K - price, 0),
    })),
  },
  {
    id: "short-strangle",
    name: "Short Strangle",
    legs: ["Sell Call Kc", "Sell Put Kp"],
    whenToUse: ["Expect range-bound", "Lower credit for wider safety"],
    keyGreeks: ["−ν", "+Θ", "short Γ"],
    breakeven: p => [p.K + 10 + p.Premium, p.K - 10 - p.Premium],
    payoff: p => range(p).map(price => ({
      price,
      pl:
        2 * p.Premium -
        Math.max(price - (p.K + 10), 0) -
        Math.max((p.K - 10) - price, 0),
    })),
  },
  {
    id: "iron-condor",
    name: "Iron Condor",
    legs: ["Short Call", "Long Call", "Short Put", "Long Put"],
    whenToUse: ["Expect low volatility", "Mean-reversion"],
    keyGreeks: ["−ν", "+Θ", "limited risk"],
    breakeven: p => [p.K + p.Premium, p.K - p.Premium],
    payoff: p => range(p).map(price => ({
      price,
      pl:
        p.Premium -
        Math.max(price - (p.K + 10), 0) +
        Math.max(price - (p.K + 20), 0) -
        Math.max((p.K - 10) - price, 0) +
        Math.max((p.K - 20) - price, 0),
    })),
  },
  {
    id: "butterfly",
    name: "Butterfly Spread",
    legs: ["Buy Call K1", "Sell 2 Calls K2", "Buy Call K3"],
    whenToUse: ["Expect price near middle strike"],
    keyGreeks: ["−ν", "+Θ near center"],
    breakeven: p => [p.K - p.Premium, p.K + p.Premium],
    payoff: p => range(p).map(price => ({
      price,
      pl:
        Math.max(price - (p.K - 10), 0) -
        2 * Math.max(price - p.K, 0) +
        Math.max(price - (p.K + 10), 0) -
        p.Premium,
    })),
  },
]
