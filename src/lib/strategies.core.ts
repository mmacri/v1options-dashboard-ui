import { OptionParams } from "./greeks"

export interface Strategy {
  id: string
  name: string
  outlook: string
  explanation: string
  example: {
    scenario: string
    entry: string
    profit: string
    loss: string
  }
  pros: string[]
  cons: string[]
  payoff: (p: OptionParams) => { price: number; pl: number }[]
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
    outlook: "Strongly Bullish",
    explanation: "A Long Call is the simplest way to bet on a stock's price going up. You buy the right, but not the obligation, to purchase a stock at a specific price (the strike price) before a set date (the expiration). Your risk is limited to the premium you pay for the option.",
    example: {
      scenario: "You believe stock XYZ, currently trading at $50, is going to rise sharply after its upcoming product launch.",
      entry: "You buy one call option with a strike price of $55 that expires in one month. You pay a premium of $2.00 per share, for a total cost and maximum risk of $200 ($2.00 x 100 shares).",
      profit: "XYZ rallies to $60 before expiration. Your option is now worth at least $5.00 ($60 stock price - $55 strike price). You sell your option for a profit of $300 ($500 sale price - $200 cost).",
      loss: "XYZ stays below $55 at expiration. The option expires worthless, and you lose your initial $200 investment.",
    },
    pros: ["Unlimited profit potential", "Limited and defined risk", "Less capital required than buying stock"],
    cons: ["You can lose 100% of your investment", "Time decay (Theta) works against you every day"],
    legs: ["Buy Call"],
    breakeven: p => p.K + p.Premium,
    payoff: p =>
      range(p).map(price => ({ price, pl: Math.max(price - p.K, 0) - p.Premium })),
  },
  {
    id: "long-put",
    name: "Long Put",
    outlook: "Strongly Bearish",
    explanation: "A Long Put is the simplest way to bet on a stock's price going down. You buy the right, but not the obligation, to sell a stock at a specific price (the strike price) before a set date (the expiration). It's often used to speculate on a price decline or to hedge a long stock position.",
    example: {
      scenario: "You believe stock XYZ, currently at $50, will fall after a poor earnings report.",
      entry: "You buy one put option with a strike price of $45 for a premium of $2.00 per share. Your total cost and maximum risk is $200.",
      profit: "XYZ drops to $40. Your put option is now worth at least $5.00 ($45 strike - $40 stock price). You sell your option for a profit of $300 ($500 sale price - $200 cost).",
      loss: "XYZ stays above $45 at expiration. The option expires worthless, and you lose your initial $200 investment.",
    },
    pros: ["Substantial profit potential in a downturn", "Limited and defined risk", "Can be used to hedge existing long positions"],
    cons: ["You can lose 100% of your investment", "Time decay (Theta) works against you", "If the stock doesn't move, you lose"],
    legs: ["Buy Put"],
    breakeven: p => p.K - p.Premium,
    payoff: p =>
      range(p).map(price => ({ price, pl: Math.max(p.K - price, 0) - p.Premium })),
  },
  {
    id: "covered-call",
    name: "Covered Call",
    outlook: "Neutral to Moderately Bullish",
    explanation: "A Covered Call is an income-generating strategy where you sell a call option against a stock you already own (at least 100 shares). You collect the premium from the call option, which provides income and some downside protection. However, you cap your potential upside.",
    example: {
      scenario: "You own 100 shares of XYZ, which you bought at $48. It's now trading at $50, and you don't expect it to move much in the next month.",
      entry: "You sell one call option with a strike price of $55 for a premium of $2.00 per share, receiving $200 in cash.",
      profit: "If XYZ stays below $55, the option expires worthless. You keep the $200 premium and your 100 shares. Your effective sale price if called away is $57 ($55 strike + $2 premium).",
      loss: "Your breakeven is $48 (your stock cost basis) - $2 (premium) = $46. You only start losing money if the stock drops below $46. The risk is owning the stock, but it's 'covered' by the premium.",
    },
    pros: ["Generates consistent income", "Lowers the cost basis of your stock holding", "Provides some downside protection"],
    cons: ["Caps your upside profit potential", "Still exposed to significant downside risk from owning the stock"],
    legs: ["Buy Stock", "Sell Call"],
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
    outlook: "Bullish but Cautious (Hedging)",
    explanation: "A Protective Put is like an insurance policy for your stocks. You buy a put option for a stock you already own (at least 100 shares). This gives you the right to sell your shares at the put's strike price, limiting your potential losses if the stock price falls dramatically.",
    example: {
      scenario: "You own 100 shares of XYZ at $50 and are worried about a potential market downturn, but you don't want to sell your shares.",
      entry: "You buy one put option with a strike price of $45 for a premium of $2.00 per share. This costs you $200, but it acts as your insurance.",
      profit: "If XYZ continues to rise, your profit is unlimited, minus the $200 cost of the put. You have full upside participation.",
      loss: "If XYZ crashes to $30, you can exercise your put and sell your shares at $45, limiting your loss on the stock to $5 per share, plus the $2 premium cost. Your maximum loss is fixed.",
    },
    pros: ["Provides a hard limit on your downside risk", "Allows you to keep your long-term stock position", "Retains unlimited upside potential (minus the premium cost)"],
    cons: ["The cost of the put (the premium) eats into your potential profits", "If the stock doesn't fall, the put expires worthless and you lose the premium"],
    legs: ["Buy Stock", "Buy Put"],
    breakeven: p => p.S + p.Premium,
    payoff: p =>
      range(p).map(price => ({
        price,
        pl: price - p.S + Math.max(p.K - price, 0) - p.Premium,
      })),
  },
]
