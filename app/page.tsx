"use client"

import { ChartContainer } from "@/components/ui/chart"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea,
} from "recharts"
import { ArrowUpRight, ArrowDownRight, TrendingUp, Info, Target, BarChart3, Settings, Zap } from "lucide-react"

export default function OptionsTradesDashboard() {
  const [selectedStrategy, setSelectedStrategy] = useState("long-call")
  const [stockPrice, setStockPrice] = useState([150])
  const [strikePrice, setStrikePrice] = useState([155])
  const [timeToExpiry, setTimeToExpiry] = useState([30])
  const [volatility, setVolatility] = useState([25])
  const [riskFreeRate, setRiskFreeRate] = useState([5])
  const [ownsStock, setOwnsStock] = useState(false)

  const blackScholes = (S: number, K: number, T: number, r: number, sigma: number, type: "call" | "put") => {
    const d1 = (Math.log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * Math.sqrt(T))
    const d2 = d1 - sigma * Math.sqrt(T)

    const normCDF = (x: number) => {
      return 0.5 * (1 + Math.sign(x) * Math.sqrt(1 - Math.exp((-2 * x * x) / Math.PI)))
    }

    if (type === "call") {
      return S * normCDF(d1) - K * Math.exp(-r * T) * normCDF(d2)
    } else {
      return K * Math.exp(-r * T) * normCDF(-d2) - S * normCDF(-d1)
    }
  }

  const callPrice = blackScholes(
    stockPrice[0],
    strikePrice[0],
    timeToExpiry[0] / 365,
    riskFreeRate[0] / 100,
    volatility[0] / 100,
    "call",
  )
  const putPrice = blackScholes(
    stockPrice[0],
    strikePrice[0],
    timeToExpiry[0] / 365,
    riskFreeRate[0] / 100,
    volatility[0] / 100,
    "put",
  )

  const delta = stockPrice[0] > strikePrice[0] ? 0.65 : 0.35
  const gamma = 0.025 * (volatility[0] / 25)
  const theta = -0.15 * (timeToExpiry[0] / 30)
  const vega = 0.18 * Math.sqrt(timeToExpiry[0] / 365)

  const strategyData = useMemo(() => {
    const data = []
    for (let price = stockPrice[0] - 40; price <= stockPrice[0] + 40; price += 2) {
      let profitLoss = 0

      switch (selectedStrategy) {
        case "long-call":
          profitLoss = Math.max(0, price - strikePrice[0]) - callPrice
          break
        case "long-put":
          profitLoss = Math.max(0, strikePrice[0] - price) - putPrice
          break
        case "short-call":
          profitLoss = callPrice - Math.max(0, price - strikePrice[0])
          break
        case "short-put":
          profitLoss = putPrice - Math.max(0, strikePrice[0] - price)
          break
        case "bull-spread":
          const longCall = Math.max(0, price - strikePrice[0]) - callPrice
          const shortCall = callPrice * 0.7 - Math.max(0, price - (strikePrice[0] + 10))
          profitLoss = longCall + shortCall
          break
        case "iron-condor":
          const sellCall = callPrice * 0.6 - Math.max(0, price - (strikePrice[0] + 10))
          const buyCall = -callPrice * 0.3 + Math.max(0, price - (strikePrice[0] + 20))
          const sellPut = putPrice * 0.6 - Math.max(0, strikePrice[0] - 10 - price)
          const buyPut = -putPrice * 0.3 + Math.max(0, strikePrice[0] - 20 - price)
          profitLoss = sellCall + buyCall + sellPut + buyPut
          break
      }

      data.push({
        stockPrice: price,
        profitLoss: profitLoss,
        breakeven: 0,
      })
    }
    return data
  }, [selectedStrategy, stockPrice, strikePrice, callPrice, putPrice])

  const strategyDetails = {
    "long-call": {
      name: "Long Call",
      icon: ArrowUpRight,
      color: "text-green-600",
      badge: "Bullish",
      badgeColor: "bg-green-100 text-green-800",
      description: "Buy a call option - profit from upward price movement",
      maxProfit: "Unlimited",
      maxLoss: `$${callPrice.toFixed(2)} (Premium paid)`,
      breakeven: `$${(strikePrice[0] + callPrice).toFixed(2)}`,
      explanation:
        "This chart shows profit/loss at expiration. The green line represents your position's value. Notice how losses are limited to the premium paid, but profits are unlimited above the breakeven point. Try adjusting volatility to see how option prices change!",
      entryExitTiming: {
        bestEntryConditions: [
          "📈 Strong bullish catalyst expected (earnings, product launch, FDA approval)",
          "📊 Technical breakout above resistance with volume confirmation",
          "⏰ 30-45 days to expiration for optimal time value balance",
          "📉 After a pullback in an uptrend (buy the dip strategy)",
          "🔥 Implied volatility below historical average (cheaper premiums)",
        ],
        exitStrategies: [
          "🎯 Take profits at 50-100% gain to avoid time decay risk",
          "⏰ Exit 2-3 weeks before expiration if not profitable",
          "📈 Roll up and out if stock moves favorably but time is running short",
          "🛑 Cut losses at 50% if thesis is broken or stock moves against you",
          "💰 Exercise if deep in-the-money and you want to own the stock",
        ],
        timeDecayScenarios: [
          {
            scenario: "45 Days Out - Slow Decay",
            description: "Time decay is minimal, option retains most value",
            example: `AAPL $150 call with 45 days: loses ~$0.05/day in time value`,
            action: "✅ Good time to enter - plenty of time for stock to move",
          },
          {
            scenario: "21 Days Out - Accelerating Decay",
            description: "Time decay accelerates, theta increases significantly",
            example: `Same AAPL call with 21 days: loses ~$0.15/day in time value`,
            action: "⚠️ Decision time - exit if not profitable or roll forward",
          },
          {
            scenario: "7 Days Out - Rapid Decay",
            description: "Extreme time decay, option loses value quickly",
            example: `Same AAPL call with 7 days: loses ~$0.40/day in time value`,
            action: "🚨 Exit immediately unless deep in-the-money",
          },
          {
            scenario: "1 Day Out - Final Decay",
            description: "Only intrinsic value remains, no time premium",
            example: `AAPL at $155, $150 call worth exactly $5.00`,
            action: "💡 Exercise if profitable, let expire if worthless",
          },
        ],
        realWorldExample: {
          setup: "Tesla (TSLA) trading at $200, expecting strong Q4 delivery numbers in 3 weeks",
          entry: "Buy TSLA $210 calls expiring 45 days out for $8.00 when IV is 35%",
          scenario1: {
            outcome: "TSLA jumps to $230 after delivery beat (+15%)",
            timing: "Exit after 1 week at $22.00 (+175% profit)",
            lesson: "✅ Perfect timing - captured the move with plenty of time value remaining",
          },
          scenario2: {
            outcome: "TSLA stays flat at $200 for 3 weeks",
            timing: "Exit at $3.00 (-62.5% loss) with 3 weeks left",
            lesson: "⚠️ Time decay eating profits - exit before total loss",
          },
          scenario3: {
            outcome: "TSLA drops to $180 after disappointing deliveries",
            timing: "Exit immediately at $1.50 (-81% loss)",
            lesson: "🛑 Thesis broken - cut losses quickly to preserve capital",
          },
        },
      },
      howToTransact: {
        steps: [
          "Open your brokerage account and navigate to options trading",
          "Search for the underlying stock (e.g., AAPL, TSLA, SPY)",
          "Select 'Buy to Open' for a call option",
          "Choose your strike price and expiration date",
          "Review the premium cost and place your order",
        ],
        when: "Use when you expect the stock to rise significantly above the strike price before expiration",
        why: "Limited risk (only premium paid) with unlimited profit potential",
        realScenario: {
          setup: "Tesla (TSLA) trading at $150, you buy a $155 call expiring in 30 days for $3.50",
          outcome1: "If TSLA rises to $170: Profit = ($170 - $155) - $3.50 = $11.50 per share",
          outcome2: "If TSLA stays at $150: Loss = $3.50 premium (100% loss)",
          outcome3: "If TSLA rises to $158: Small profit = ($158 - $155) - $3.50 = -$0.50 (still losing)",
          lesson: "Stock must move significantly above strike + premium to be profitable",
        },
      },
    },
    "long-put": {
      name: "Long Put",
      icon: ArrowDownRight,
      color: "text-red-600",
      badge: "Bearish",
      badgeColor: "bg-red-100 text-red-800",
      description: "Buy a put option - profit from downward price movement",
      maxProfit: `$${(strikePrice[0] - putPrice).toFixed(2)}`,
      maxLoss: `$${putPrice.toFixed(2)} (Premium paid)`,
      breakeven: `$${(strikePrice[0] - putPrice).toFixed(2)}`,
      explanation:
        "The red line shows how put options gain value as stock price falls. Maximum profit occurs if stock goes to zero. Experiment with time to expiry - notice how time decay (theta) affects the premium!",
      entryExitTiming: {
        bestEntryConditions: [
          "📉 Bearish catalyst expected (poor earnings, regulatory issues, market crash)",
          "📊 Technical breakdown below support with high volume",
          "🔥 High implied volatility environment (market fear/uncertainty)",
          "📈 After a rally in a downtrend (sell the bounce strategy)",
          "🛡️ As portfolio protection during uncertain times",
        ],
        exitStrategies: [
          "💰 Take profits at 100-200% gain (puts can move faster than calls)",
          "⏰ Exit 2-3 weeks before expiration if not profitable",
          "📉 Roll down and out if stock drops but you want more downside",
          "🛑 Cut losses at 50% if market reverses strongly upward",
          "🏃‍♂️ Exit quickly if volatility collapses (VIX drops significantly)",
        ],
        timeDecayScenarios: [
          {
            scenario: "High Volatility Period",
            description: "Put premiums inflated due to fear, time decay slower",
            example: `SPY $400 put during market turmoil: IV at 40%, slower theta burn`,
            action: "✅ Good entry if you expect continued volatility",
          },
          {
            scenario: "Low Volatility Period",
            description: "Put premiums cheap but time decay accelerates quickly",
            example: `Same SPY put in calm market: IV at 15%, rapid theta burn`,
            action: "⚠️ Need quick, large moves to overcome time decay",
          },
          {
            scenario: "Volatility Crush",
            description: "After big move, volatility collapses rapidly",
            example: `After earnings, IV drops from 60% to 20% overnight`,
            action: "🚨 Exit immediately - volatility crush can wipe out gains",
          },
          {
            scenario: "Weekend/Holiday Decay",
            description: "Time passes but market closed - pure time decay",
            example: `3-day weekend removes 3 days of time value with no trading`,
            action: "💡 Consider exiting before long weekends if near expiration",
          },
        ],
        realWorldExample: {
          setup: "Market at all-time highs, expecting Fed hawkish surprise, SPY at $450",
          entry: "Buy SPY $440 puts expiring 30 days out for $6.00 when VIX is low at 15",
          scenario1: {
            outcome: "Fed raises rates unexpectedly, SPY drops to $420 (-6.7%)",
            timing: "Exit after 2 days at $22.00 (+267% profit)",
            lesson: "✅ Perfect hedge - puts provide asymmetric protection in crashes",
          },
          scenario2: {
            outcome: "Fed dovish, SPY rallies to $460 (+2.2%)",
            timing: "Exit at $2.00 (-67% loss) after 1 week",
            lesson: "⚠️ Wrong direction - cut losses before total decay",
          },
          scenario3: {
            outcome: "Market stays flat, VIX rises to 25 due to uncertainty",
            timing: "Exit at $8.50 (+42% profit) due to volatility expansion",
            lesson: "💡 Sometimes volatility increase alone can make puts profitable",
          },
        },
      },
      howToTransact: {
        steps: [
          "Access options chain for your target stock",
          "Select 'Buy to Open' for a put option",
          "Choose strike price below current stock price for protection",
          "Select expiration date based on your timeline",
          "Pay the premium and monitor the position",
        ],
        when: "Use when expecting significant downward movement or as portfolio protection",
        why: "Limited risk with high profit potential if stock declines sharply",
        realScenario: {
          setup: "Netflix (NFLX) at $400, you buy a $390 put for $8.00, expecting earnings disappointment",
          outcome1: "If NFLX drops to $350: Profit = ($390 - $350) - $8.00 = $32.00 per share",
          outcome2: "If NFLX stays above $390: Loss = $8.00 premium (100% loss)",
          outcome3: "If NFLX drops to $385: Small profit = ($390 - $385) - $8.00 = -$3.00 (still losing)",
          lesson: "Put options are excellent for hedging long positions or betting on declines",
        },
      },
    },
    "short-call": {
      name: "Short Call",
      icon: ArrowDownRight,
      color: "text-orange-600",
      badge: "Bearish",
      badgeColor: "bg-orange-100 text-orange-800",
      description: "Sell a call option - collect premium, profit if stock stays below strike",
      maxProfit: `$${callPrice.toFixed(2)} (Premium collected)`,
      maxLoss: "Unlimited",
      breakeven: `$${(strikePrice[0] + callPrice).toFixed(2)}`,
      explanation:
        "Short calls have unlimited risk above the breakeven. The flat profit area shows where you keep the full premium. Watch how increasing volatility increases the premium you collect but also increases risk!",
      entryExitTiming: {
        bestEntryConditions: [
          "📈 After a strong rally when stock appears overbought",
          "🔥 High implied volatility (collect more premium)",
          "📊 Technical resistance level at or above your strike price",
          "⏰ 30-45 days to expiration for optimal time decay collection",
          "📰 After positive news is already priced in",
        ],
        exitStrategies: [
          "💰 Buy back at 25-50% of premium collected (quick profit)",
          "⏰ Let expire worthless if stock stays below strike",
          "🛑 Buy back immediately if stock breaks above strike + premium",
          "📈 Roll up and out if you want to stay short but manage risk",
          "🏃‍♂️ Exit if volatility spikes significantly (increases risk)",
        ],
        timeDecayScenarios: [
          {
            scenario: "First 2 Weeks - Slow Decay",
            description: "Time decay works in your favor gradually",
            example: `Sold AMZN $110 call for $3.00, after 2 weeks worth $2.20`,
            action: "✅ Let time decay work - no action needed if stock cooperative",
          },
          {
            scenario: "Weeks 3-4 - Accelerating Decay",
            description: "Time decay accelerates, premium melts faster",
            example: `Same call now worth $1.20 with 2 weeks left`,
            action: "💰 Consider buying back at 50% profit ($1.50)",
          },
          {
            scenario: "Final Week - Maximum Decay",
            description: "Extreme time decay if out-of-the-money",
            example: `Call worth $0.30 with 5 days left, stock still below strike`,
            action: "🎯 Let expire worthless for maximum profit",
          },
          {
            scenario: "Stock Approaches Strike",
            description: "Delta increases, position becomes more risky",
            example: `Stock moves from $105 to $108, call value increases to $2.80`,
            action: "⚠️ Consider buying back or rolling to avoid assignment",
          },
        ],
        realWorldExample: {
          setup: "Apple (AAPL) rallied from $150 to $180, now looks overbought at resistance",
          entry: "Sell AAPL $185 calls expiring 35 days out for $4.50 when IV is 30%",
          scenario1: {
            outcome: "AAPL consolidates between $175-$180 for 3 weeks",
            timing: "Buy back at $1.50 after 21 days (+67% profit)",
            lesson: "✅ Perfect trade - collected time decay while stock stayed range-bound",
          },
          scenario2: {
            outcome: "AAPL breaks out to $190 on surprise iPhone sales",
            timing: "Buy back immediately at $7.00 (-56% loss)",
            lesson: "🛑 Cut losses quickly when thesis breaks - unlimited risk requires discipline",
          },
          scenario3: {
            outcome: "Market crashes, AAPL drops to $160",
            timing: "Let expire worthless, keep full $4.50 premium",
            lesson: "💰 Maximum profit achieved - short calls benefit from any downward movement",
          },
        },
      },
      howToTransact: {
        steps: [
          "Ensure you have sufficient margin or own 100 shares (covered call)",
          "Select 'Sell to Open' for a call option",
          "Choose a strike price above current stock price",
          "Collect the premium immediately",
          "Monitor position and be prepared to buy back if needed",
        ],
        when: "Use when you expect stock to stay flat or decline, or to generate income on stock you own",
        why: "Immediate income from premium, but unlimited risk if uncovered",
        realScenario: {
          setup: "You own 100 shares of Apple (AAPL) at $150, sell a $160 call for $2.50",
          outcome1: "If AAPL stays below $160: Keep $250 premium + any stock gains",
          outcome2: "If AAPL rises to $170: Stock called away at $160, total gain = $10 + $2.50 = $12.50",
          outcome3: "If naked and AAPL hits $170: Loss = ($170 - $160) - $2.50 = $7.50 per share",
          lesson: "Covered calls generate income but cap upside; naked calls have unlimited risk",
        },
      },
    },
    "short-put": {
      name: "Short Put",
      icon: ArrowUpRight,
      color: "text-purple-600",
      badge: "Bullish",
      badgeColor: "bg-purple-100 text-purple-800",
      description: "Sell a put option - collect premium, profit if stock stays above strike",
      maxProfit: `$${putPrice.toFixed(2)} (Premium collected)`,
      maxLoss: `$${(strikePrice[0] - putPrice).toFixed(2)}`,
      breakeven: `$${(strikePrice[0] - putPrice).toFixed(2)}`,
      explanation:
        "Short puts profit when stock stays above strike price. The chart shows maximum profit when stock is above strike, and increasing losses as stock falls. Time decay works in your favor here!",
      entryExitTiming: {
        bestEntryConditions: [
          "📉 After a pullback in a strong stock you want to own",
          "🔥 High implied volatility (collect more premium)",
          "📊 Strong support level at or below your strike price",
          "💰 When you have cash and want to buy stock at a discount",
          "📈 In bullish market environments with low VIX",
        ],
        exitStrategies: [
          "💰 Buy back at 25-50% of premium collected",
          "🏠 Accept assignment and own the stock at effective lower cost",
          "📉 Roll down and out if stock drops but you still want exposure",
          "🛑 Buy back if stock breaks key support levels",
          "⏰ Let expire worthless if stock stays above strike",
        ],
        timeDecayScenarios: [
          {
            scenario: "Stock Above Strike - Sweet Spot",
            description: "Maximum time decay benefit, low assignment risk",
            example: `Sold MSFT $280 put for $5.00, stock at $290, put worth $2.50`,
            action: "✅ Perfect scenario - consider taking 50% profit",
          },
          {
            scenario: "Stock Near Strike - Decision Time",
            description: "Assignment risk increases, time decay still positive",
            example: `Stock drops to $282, put now worth $4.20`,
            action: "🤔 Decide: accept assignment or roll down/out",
          },
          {
            scenario: "Stock Below Strike - Assignment Risk",
            description: "High probability of assignment, intrinsic value building",
            example: `Stock at $275, put worth $8.50 (mostly intrinsic value)`,
            action: "⚠️ Prepare for assignment or buy back to close",
          },
          {
            scenario: "Volatility Expansion",
            description: "Put premium increases even if stock doesn't move much",
            example: `Market uncertainty spikes, put value increases to $7.00`,
            action: "🚨 Consider buying back if volatility spike is temporary",
          },
        ],
        realWorldExample: {
          setup: "Want to buy Microsoft (MSFT) cheaper, currently at $300, strong support at $280",
          entry: "Sell MSFT $285 puts expiring 30 days out for $6.00 (cash-secured)",
          scenario1: {
            outcome: "MSFT stays above $285, consolidates around $295",
            timing: "Let expire worthless, keep $6.00 premium (+100% profit)",
            lesson: "✅ Generated income while waiting for better entry price",
          },
          scenario2: {
            outcome: "MSFT drops to $275, put assigned",
            timing: "Own 100 shares at $285, effective cost $279 ($285 - $6 premium)",
            lesson: "💡 Got the stock at desired price with extra income buffer",
          },
          scenario3: {
            outcome: "Market crashes, MSFT drops to $250",
            timing: "Assigned at $285, paper loss but long-term bullish",
            lesson: "⚠️ Assignment risk realized - ensure you want to own the stock long-term",
          },
        },
      },
      howToTransact: {
        steps: [
          "Ensure sufficient cash/margin to buy 100 shares at strike price",
          "Select 'Sell to Open' for a put option",
          "Choose strike price below current stock price",
          "Collect premium immediately",
          "Be prepared to buy stock if assigned",
        ],
        when: "Use when you want to buy stock at a lower price or generate income in bullish markets",
        why: "Collect premium while potentially acquiring stock at desired price",
        realScenario: {
          setup: "Microsoft (MSFT) at $300, you sell a $290 put for $4.00, wanting to buy shares cheaper",
          outcome1: "If MSFT stays above $290: Keep $400 premium, no stock purchase required",
          outcome2: "If MSFT drops to $280: Buy 100 shares at $290, effective cost = $290 - $4 = $286",
          outcome3: "If MSFT drops to $270: Own shares at $286 cost basis vs $270 market = $16/share paper loss",
          lesson: "Cash-secured puts are great for entering positions at desired prices with income",
        },
      },
    },
    "bull-spread": {
      name: "Bull Call Spread",
      icon: TrendingUp,
      color: "text-blue-600",
      badge: "Bullish",
      badgeColor: "bg-blue-100 text-blue-800",
      description: "Buy lower strike call, sell higher strike call - limited risk and reward",
      maxProfit: `$${(10 - (callPrice - callPrice * 0.7)).toFixed(2)}`,
      maxLoss: `$${(callPrice - callPrice * 0.7).toFixed(2)}`,
      breakeven: `$${(strikePrice[0] + (callPrice - callPrice * 0.7)).toFixed(2)}`,
      explanation:
        "Bull spreads limit both risk and reward. The chart shows how profit is capped but risk is also limited. This strategy costs less than buying a call outright. Try changing the stock price to see the risk/reward profile!",
      entryExitTiming: {
        bestEntryConditions: [
          "📈 Moderately bullish outlook (expect 5-15% move up)",
          "🔥 High implied volatility (makes short leg more valuable)",
          "📊 Technical setup suggests move to specific target level",
          "💰 Want bullish exposure with less capital than buying calls",
          "⏰ 30-45 days to expiration for optimal time decay balance",
        ],
        exitStrategies: [
          "💰 Close at 50-75% of maximum profit to avoid pin risk",
          "⏰ Exit 1-2 weeks before expiration if not near max profit",
          "📈 Let expire if stock is above short strike (max profit)",
          "🛑 Close early if stock moves against you significantly",
          "🔄 Roll entire spread out in time if thesis still valid",
        ],
        timeDecayScenarios: [
          {
            scenario: "Stock Between Strikes - Optimal",
            description: "Long call gains intrinsic, short call loses time value",
            example: `$100/$105 spread, stock at $103, spread worth $2.50 of $5 max`,
            action: "✅ Time decay working in your favor on short leg",
          },
          {
            scenario: "Stock Above Short Strike - Max Profit",
            description: "Both calls in-the-money, spread at maximum value",
            example: `Stock at $107, spread worth full $5.00`,
            action: "💰 Consider closing for max profit, avoid pin risk",
          },
          {
            scenario: "Stock Below Long Strike - Max Loss",
            description: "Both calls out-of-the-money, spread worthless",
            example: `Stock at $98, spread worth $0.20`,
            action: "🛑 Accept loss or close to salvage remaining value",
          },
          {
            scenario: "Pin Risk at Expiration",
            description: "Stock exactly at short strike, assignment uncertainty",
            example: `Stock exactly at $105 on expiration Friday`,
            action: "⚠️ Close spread before 4pm to avoid assignment complications",
          },
        ],
        realWorldExample: {
          setup: "Google (GOOGL) at $120, expecting moderate rally to $130 on cloud growth",
          entry: "Buy $125 call for $4.00, sell $130 call for $2.00, net debit $2.00",
          scenario1: {
            outcome: "GOOGL rallies to $132 as expected",
            timing: "Close at $4.80 after 3 weeks (+140% profit)",
            lesson: "✅ Perfect execution - captured most of the move with limited risk",
          },
          scenario2: {
            outcome: "GOOGL stalls at $127, time decay accelerating",
            timing: "Close at $1.50 after 4 weeks (-25% loss)",
            lesson: "⚠️ Partial success but time decay hurt - exit before total loss",
          },
          scenario3: {
            outcome: "GOOGL drops to $115 on broader tech selloff",
            timing: "Close at $0.50 after 2 weeks (-75% loss)",
            lesson: "🛑 Wrong direction - spreads still lose when stock moves against you",
          },
        },
      },
      howToTransact: {
        steps: [
          "Simultaneously buy a call at lower strike (long leg)",
          "Sell a call at higher strike (short leg) - same expiration",
          "Pay the net debit (difference in premiums)",
          "Monitor position as expiration approaches",
          "Close both legs or let expire if profitable",
        ],
        when: "Use when moderately bullish with limited capital or to reduce cost of long calls",
        why: "Lower cost than buying calls alone, but caps maximum profit",
        realScenario: {
          setup: "Amazon (AMZN) at $100, buy $105 call for $3, sell $110 call for $1, net cost $2",
          outcome1: "If AMZN hits $110+: Max profit = ($110-$105) - $2 = $3 per share (150% return)",
          outcome2: "If AMZN stays at $100: Lose $2 premium (100% loss)",
          outcome3: "If AMZN hits $107: Profit = ($107-$105) - $2 = $0 (breakeven)",
          lesson: "Spreads offer defined risk/reward with lower capital requirements than outright positions",
        },
      },
    },
    "iron-condor": {
      name: "Iron Condor",
      icon: Target,
      color: "text-indigo-600",
      badge: "Neutral",
      badgeColor: "bg-gray-100 text-gray-800",
      description: "Sell call spread + sell put spread - profit from low volatility",
      maxProfit: `$${(callPrice * 0.6 + putPrice * 0.6 - (callPrice * 0.3 + putPrice * 0.3)).toFixed(2)}`,
      maxLoss: `$${(10 - (callPrice * 0.6 + putPrice * 0.6 - (callPrice * 0.3 + putPrice * 0.3))).toFixed(2)}`,
      breakeven: "Two breakeven points",
      explanation:
        "Iron condors profit when stock stays within a range. The 'tent' shape shows maximum profit in the middle, with losses increasing toward either wing. Lower volatility increases profitability - try adjusting it!",
      entryExitTiming: {
        bestEntryConditions: [
          "📊 Stock in established trading range with strong support/resistance",
          "🔥 High implied volatility (collect more premium)",
          "📰 After major news/earnings when volatility should decrease",
          "⏰ 30-45 days to expiration for optimal time decay collection",
          "🎯 Expect sideways movement for next 4-6 weeks",
        ],
        exitStrategies: [
          "💰 Close at 25-50% of maximum profit (risk management)",
          "⚠️ Close if stock approaches either breakeven point",
          "🔄 Adjust by rolling threatened side if still neutral",
          "⏰ Close 1-2 weeks before expiration to avoid pin risk",
          "🛑 Close immediately if volatility spikes significantly",
        ],
        timeDecayScenarios: [
          {
            scenario: "Stock in Profit Zone - Perfect",
            description: "All options losing time value, maximum profit building",
            example: `SPY iron condor 390/400/410/420, SPY at $405, collecting time decay`,
            action: "✅ Let time decay work - monitor for breakout attempts",
          },
          {
            scenario: "Stock Near Breakeven - Danger Zone",
            description: "One side threatened, time decay slowing",
            example: `SPY moves to $388, put side gaining intrinsic value`,
            action: "⚠️ Consider closing or adjusting - risk increasing",
          },
          {
            scenario: "Volatility Expansion - Emergency",
            description: "All options gaining value despite time decay",
            example: `Market uncertainty spikes, all legs increase in value`,
            action: "🚨 Close immediately - volatility expansion kills iron condors",
          },
          {
            scenario: "Final Week - Pin Risk",
            description: "Stock near short strikes, assignment risk high",
            example: `SPY at $399.50 on expiration Friday`,
            action: "💡 Close to avoid assignment complications and fees",
          },
        ],
        realWorldExample: {
          setup: "S&P 500 (SPY) at $400, range-bound between $390-$410 for months, post-earnings",
          entry: "Sell 390/400/410/420 iron condor for $3.00 credit, 35 days to expiration",
          scenario1: {
            outcome: "SPY stays between $395-$405 for 4 weeks",
            timing: "Close at $1.00 after 28 days (+67% profit)",
            lesson: "✅ Perfect neutral trade - collected time decay in range-bound market",
          },
          scenario2: {
            outcome: "SPY breaks out to $425 on Fed dovish surprise",
            timing: "Close at $7.00 after 1 week (-133% loss)",
            lesson: "🛑 Breakout risk realized - iron condors lose on large moves either direction",
          },
          scenario3: {
            outcome: "Market volatility spikes from 15% to 35% on geopolitical news",
            timing: "Close at $5.50 after 3 days (-83% loss)",
            lesson: "⚠️ Volatility expansion is iron condor's biggest enemy - exit quickly",
          },
        },
      },
      howToTransact: {
        steps: [
          "Sell out-of-the-money put (collect premium)",
          "Buy further out-of-the-money put (pay premium) - creates put spread",
          "Sell out-of-the-money call (collect premium)",
          "Buy further out-of-the-money call (pay premium) - creates call spread",
          "Collect net credit and manage position",
        ],
        when: "Use when expecting low volatility and sideways price movement",
        why: "Collect premium from time decay while stock trades in a range",
        realScenario: {
          setup:
            "SPY at $400, sell $390 put ($2), buy $380 put ($1), sell $410 call ($2), buy $420 call ($1), net credit $2",
          outcome1: "If SPY stays 390-410: Keep full $200 credit (max profit)",
          outcome2: "If SPY moves to $375: Loss = $10 spread width - $2 credit = $8 per share",
          outcome3: "If SPY moves to $425: Loss = $10 spread width - $2 credit = $8 per share",
          lesson: "Iron condors profit from time decay and low volatility, but lose on large moves either direction",
        },
      },
    },
  }

  const strategies = [
    {
      name: "Long Call",
      description: "Buy a call option - bullish strategy with limited risk and unlimited profit potential",
      whatItActuallyIs: {
        definition:
          "A long call is the purchase of a call option contract that gives you the RIGHT (not obligation) to buy 100 shares of stock at a specific price (strike price) before expiration.",
        mechanicsExplained:
          "When you buy a call, you're essentially making a bet that the stock will rise above the strike price plus the premium you paid. You control 100 shares for a fraction of the cost of buying the stock outright.",
        whatHappensStepByStep: [
          "1. You pay a premium (e.g., $3.50 per share = $350 total for 1 contract)",
          "2. You now control the right to buy 100 shares at the strike price",
          "3. If stock rises above strike + premium, you profit dollar-for-dollar",
          "4. If stock stays below strike price, option expires worthless",
          "5. You can sell the option anytime before expiration to capture time value",
        ],
        detailedOutcomes: {
          stockRises: "Stock at $170, strike $155: Option worth $15 ($1,500). Your profit = $1,500 - $350 = $1,150",
          stockFlat: "Stock stays at $150, strike $155: Option expires worthless. Loss = $350 premium",
          stockFalls: "Stock drops to $140, strike $155: Option expires worthless. Loss = $350 premium",
          timeDecay: "Each day, option loses time value (theta). With 30 days left, might lose $10-20/day in value",
        },
      },
      explanation:
        "This chart shows profit/loss at expiration. The green line represents your position's value. Notice how losses are limited to the premium paid, but profits are unlimited above the breakeven point. Try adjusting volatility to see how option prices change!",
    },
    {
      name: "Long Put",
      description: "Buy a put option - bearish strategy that profits when stock price falls",
      whatItActuallyIs: {
        definition:
          "A long put is the purchase of a put option contract that gives you the RIGHT to sell 100 shares of stock at a specific price (strike price) before expiration, regardless of how low the stock actually trades.",
        mechanicsExplained:
          "When you buy a put, you're betting the stock will fall below the strike price minus the premium paid. It's like buying insurance that pays more as the stock drops further.",
        whatHappensStepByStep: [
          "1. You pay a premium (e.g., $4.00 per share = $400 total for 1 contract)",
          "2. You now have the right to sell 100 shares at the strike price",
          "3. As stock falls below strike price, your put gains intrinsic value",
          "4. Maximum profit occurs if stock goes to $0 (Strike - Premium paid)",
          "5. If stock stays above strike, option expires worthless",
        ],
        detailedOutcomes: {
          stockFalls: "Stock at $130, strike $150: Put worth $20 ($2,000). Profit = $2,000 - $400 = $1,600",
          stockFlat: "Stock stays at $150, strike $150: Put expires worthless. Loss = $400 premium",
          stockRises: "Stock rises to $160, strike $150: Put expires worthless. Loss = $400 premium",
          timeDecay: "Put loses time value daily. Near expiration, only intrinsic value (strike - stock price) remains",
        },
      },
      explanation:
        "The red line shows how put options gain value as stock price falls. Maximum profit occurs if stock goes to zero. Experiment with time to expiry - notice how time decay (theta) affects the premium!",
    },
    {
      name: "Short Call",
      description: "Sell a call option - collect premium but face unlimited risk if stock rises",
      whatItActuallyIs: {
        definition:
          "A short call means you SELL a call option to someone else, collecting premium upfront but taking on the obligation to sell 100 shares at the strike price if the buyer exercises.",
        mechanicsExplained:
          "You're essentially acting like an insurance company - collecting premium but paying out if the 'claim' (stock rising above strike) occurs. This is an advanced strategy with significant risk.",
        whatHappensStepByStep: [
          "1. You sell a call and immediately collect premium (e.g., $3.50 = $350 credit)",
          "2. You keep this premium if the option expires worthless (stock below strike)",
          "3. If stock rises above strike, you must sell 100 shares at strike price",
          "4. Your loss increases dollar-for-dollar as stock rises above strike + premium",
          "5. Losses are theoretically unlimited as stock can rise indefinitely",
        ],
        detailedOutcomes: {
          stockStaysBelow: "Stock at $150, strike $155: Keep full $350 premium as profit",
          stockAtStrike: "Stock at $155, strike $155: Keep full $350 premium, option expires worthless",
          stockRisesModestly: "Stock at $160, strike $155: Lose $500 on shares, keep $350 premium = $150 net loss",
          stockRisesSharply: "Stock at $170, strike $155: Lose $1,500 on shares, keep $350 premium = $1,150 net loss",
        },
      },
      explanation:
        "Short calls have unlimited risk above the breakeven. The flat profit area shows where you keep the full premium. Watch how increasing volatility increases the premium you collect but also increases risk!",
    },
    {
      name: "Short Put",
      description: "Sell a put option - collect premium but may be forced to buy stock if it falls",
      whatItActuallyIs: {
        definition:
          "A short put means you SELL a put option, collecting premium but accepting the obligation to buy 100 shares at the strike price if the stock falls below it.",
        mechanicsExplained:
          "This strategy is often used by investors who want to buy a stock at a lower price. You get paid to wait for the stock to come down to your desired purchase price.",
        whatHappensStepByStep: [
          "1. You sell a put and collect premium immediately (e.g., $2.50 = $250 credit)",
          "2. If stock stays above strike, you keep the full premium as profit",
          "3. If stock falls below strike, you must buy 100 shares at strike price",
          "4. Your effective purchase price = Strike price - Premium received",
          "5. Maximum loss occurs if stock goes to $0",
        ],
        detailedOutcomes: {
          stockStaysAbove: "Stock at $155, strike $150: Keep full $250 premium as profit",
          stockAtStrike: "Stock at $150, strike $150: Keep $250 premium, no assignment yet",
          stockFallsSlightly: "Stock at $145, strike $150: Buy 100 shares at $150, effective cost $147.50",
          stockFallsSharply:
            "Stock at $130, strike $150: Buy 100 shares at $150, paper loss $2,000, but collected $250",
        },
      },
      explanation:
        "Short puts profit when stock stays above strike price. The chart shows maximum profit when stock is above strike, and increasing losses as stock falls. Time decay works in your favor here!",
    },
    {
      name: "Bull Call Spread",
      description: "Buy a lower strike call, sell a higher strike call - limited risk and reward",
      whatItActuallyIs: {
        definition:
          "A bull call spread involves buying a call at a lower strike price and simultaneously selling a call at a higher strike price, both with the same expiration. This creates a 'spread' position.",
        mechanicsExplained:
          "You're essentially buying a call but financing part of the cost by selling another call. This reduces your cost but also caps your maximum profit.",
        whatHappensStepByStep: [
          "1. Buy call at lower strike (e.g., $150 call for $5.00 = $500 debit)",
          "2. Sell call at higher strike (e.g., $160 call for $2.00 = $200 credit)",
          "3. Net cost = $500 - $200 = $300 (your maximum loss)",
          "4. Maximum profit = Spread width - Net cost = $10 - $3 = $700",
          "5. Breakeven = Lower strike + Net cost = $150 + $3 = $153",
        ],
        detailedOutcomes: {
          stockBelowLower: "Stock at $145: Both calls expire worthless, lose $300 (net premium paid)",
          stockBetweenStrikes: "Stock at $155: Long call worth $500, short call worthless, profit = $500 - $300 = $200",
          stockAboveHigher: "Stock at $165: Long call worth $1,500, short call costs $500, max profit = $700",
          timeDecay: "Time decay affects both options, but net effect depends on which option loses value faster",
        },
      },
      explanation:
        "Bull spreads limit both risk and reward. The chart shows how profit is capped but risk is also limited. This strategy costs less than buying a call outright. Try changing the stock price to see the risk/reward profile!",
    },
    {
      name: "Iron Condor",
      description: "Sell a put spread and call spread - profit when stock stays in a range",
      whatItActuallyIs: {
        definition:
          "An iron condor combines a bull put spread and a bear call spread. You sell options closer to the current stock price and buy options further away, creating a 'range-bound' strategy.",
        mechanicsExplained:
          "This is a neutral strategy that profits when the stock stays within a specific range. You collect premium upfront and keep it if the stock doesn't move too much in either direction.",
        whatHappensStepByStep: [
          "1. Sell put at higher strike (e.g., $145 put for $3.00 = $300 credit)",
          "2. Buy put at lower strike (e.g., $140 put for $1.50 = $150 debit)",
          "3. Sell call at lower strike (e.g., $155 call for $3.00 = $300 credit)",
          "4. Buy call at higher strike (e.g., $160 call for $1.50 = $150 debit)",
          "5. Net credit = $600 - $300 = $300 (your maximum profit)",
        ],
        detailedOutcomes: {
          stockInRange: "Stock between $145-$155: All options expire worthless, keep full $300 credit",
          stockNearWings: "Stock at $143 or $157: Partial loss as one spread moves against you",
          stockBeyondWings: "Stock at $135 or $165: Maximum loss = Spread width - Credit = $500 - $300 = $200",
          timeDecay: "Time decay works in your favor - all options lose value as expiration approaches",
        },
      },
      explanation:
        "Iron condors profit when stock stays within a range. The 'tent' shape shows maximum profit in the middle, with losses increasing toward either wing. Lower volatility increases profitability - try adjusting it!",
    },
  ]

  const currentStrategy = strategyDetails[selectedStrategy]
  const Icon = currentStrategy.icon

  const presetExamples = [
    { name: "High Volatility", stockPrice: 150, strikePrice: 155, timeToExpiry: 30, volatility: 45, riskFreeRate: 5 },
    { name: "Low Volatility", stockPrice: 150, strikePrice: 155, timeToExpiry: 30, volatility: 15, riskFreeRate: 5 },
    { name: "Near Expiry", stockPrice: 150, strikePrice: 155, timeToExpiry: 7, volatility: 25, riskFreeRate: 5 },
    { name: "Deep ITM", stockPrice: 170, strikePrice: 155, timeToExpiry: 30, volatility: 25, riskFreeRate: 5 },
  ]

  const loadPreset = (preset: (typeof presetExamples)[0]) => {
    setStockPrice([preset.stockPrice])
    setStrikePrice([preset.strikePrice])
    setTimeToExpiry([preset.timeToExpiry])
    setVolatility([preset.volatility])
    setRiskFreeRate([preset.riskFreeRate])
  }

  return (
    <div className="min-h-screen bg-background p-4 space-y-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center space-y-2 mb-8">
          <h1 className="text-3xl font-bold text-foreground">Interactive Options Strategy Charts</h1>
          <p className="text-muted-foreground">
            Learn options trading through interactive profit/loss diagrams with real-time parameter adjustments
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Market Parameters
            </CardTitle>
            <CardDescription>
              Adjust these parameters to see how they affect option pricing and strategy performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="owns-stock">Stock Ownership</Label>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="owns-stock"
                    checked={ownsStock}
                    onChange={(e) => setOwnsStock(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="owns-stock" className="text-sm">
                    I already own 100 shares of this stock
                  </Label>
                </div>
                <p className="text-xs text-muted-foreground">
                  {ownsStock ? "✅ Enables covered calls and protective puts" : "💰 Cash-secured strategies available"}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="stock-price">Stock Price: ${stockPrice[0]}</Label>
                <Slider
                  id="stock-price"
                  min={100}
                  max={200}
                  step={1}
                  value={stockPrice}
                  onValueChange={setStockPrice}
                  className="w-full"
                />
                <Input
                  type="number"
                  value={stockPrice[0]}
                  onChange={(e) => setStockPrice([Number(e.target.value)])}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="strike-price">Strike Price: ${strikePrice[0]}</Label>
                <Slider
                  id="strike-price"
                  min={100}
                  max={200}
                  step={1}
                  value={strikePrice}
                  onValueChange={setStrikePrice}
                  className="w-full"
                />
                <Input
                  type="number"
                  value={strikePrice[0]}
                  onChange={(e) => setStrikePrice([Number(e.target.value)])}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="time-to-expiry">Days to Expiry: {timeToExpiry[0]}</Label>
                <Slider
                  id="time-to-expiry"
                  min={1}
                  max={365}
                  step={1}
                  value={timeToExpiry}
                  onValueChange={setTimeToExpiry}
                  className="w-full"
                />
                <Input
                  type="number"
                  value={timeToExpiry[0]}
                  onChange={(e) => setTimeToExpiry([Number(e.target.value)])}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="volatility">Volatility: {volatility[0]}%</Label>
                <Slider
                  id="volatility"
                  min={5}
                  max={100}
                  step={1}
                  value={volatility}
                  onValueChange={setVolatility}
                  className="w-full"
                />
                <Input
                  type="number"
                  value={volatility[0]}
                  onChange={(e) => setVolatility([Number(e.target.value)])}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="risk-free-rate">Risk-Free Rate: {riskFreeRate[0]}%</Label>
                <Slider
                  id="risk-free-rate"
                  min={0}
                  max={10}
                  step={0.1}
                  value={riskFreeRate}
                  onValueChange={setRiskFreeRate}
                  className="w-full"
                />
                <Input
                  type="number"
                  step="0.1"
                  value={riskFreeRate[0]}
                  onChange={(e) => setRiskFreeRate([Number(e.target.value)])}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label>Quick Examples:</Label>
                <div className="flex flex-wrap gap-2">
                  {presetExamples.map((preset) => (
                    <Button
                      key={preset.name}
                      variant="outline"
                      size="sm"
                      onClick={() => loadPreset(preset)}
                      className="text-xs"
                    >
                      <Zap className="h-3 w-3 mr-1" />
                      {preset.name}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Strategy Selection
            </CardTitle>
            <CardDescription>Choose an options strategy to visualize its profit/loss profile</CardDescription>
          </CardHeader>
          <CardContent>
            {!ownsStock && selectedStrategy === "short-call" && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">
                  ⚠️ <strong>Naked Call Warning:</strong> Selling calls without owning stock has unlimited risk. Consider
                  checking "I own stock" for covered calls instead.
                </p>
              </div>
            )}

            {ownsStock && selectedStrategy === "short-call" && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-700">
                  ✅ <strong>Covered Call:</strong> You own the stock, so this is a covered call with limited risk.
                  Maximum loss is if stock drops to zero minus premium collected.
                </p>
              </div>
            )}

            {ownsStock && selectedStrategy === "long-put" && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700">
                  🛡️ <strong>Protective Put:</strong> You own the stock, so this put acts as insurance. It protects your
                  stock position from major downside moves.
                </p>
              </div>
            )}

            {!ownsStock && selectedStrategy === "short-put" && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-700">
                  💰 <strong>Cash-Secured Put:</strong> Ensure you have ${strikePrice[0] * 100} in cash available in
                  case you get assigned and need to buy 100 shares.
                </p>
              </div>
            )}

            <Select value={selectedStrategy} onValueChange={setSelectedStrategy}>
              <SelectTrigger className="w-full max-w-md">
                <SelectValue placeholder="Select a strategy" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="long-call">Long Call (Buy Call)</SelectItem>
                <SelectItem value="long-put">
                  {ownsStock ? "Protective Put (Insurance)" : "Long Put (Buy Put)"}
                </SelectItem>
                <SelectItem value="short-call">
                  {ownsStock ? "Covered Call (Income)" : "Short Call (Naked - High Risk)"}
                </SelectItem>
                <SelectItem value="short-put">{ownsStock ? "Short Put (Cash-Secured)" : "Cash-Secured Put"}</SelectItem>
                <SelectItem value="bull-spread">Bull Call Spread</SelectItem>
                <SelectItem value="iron-condor">Iron Condor</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon className={`h-5 w-5 ${currentStrategy.color}`} />
                  {currentStrategy.name} - Profit/Loss Chart
                </CardTitle>
                <CardDescription>{currentStrategy.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-card rounded-lg border p-6">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold mb-2">Profit/Loss Chart</h3>
                    <p className="text-sm text-muted-foreground">
                      Visual representation of strategy performance at expiration
                    </p>
                  </div>
                  <div className="h-96 bg-white rounded-lg p-4 border">
                    <ChartContainer
                      config={{
                        profitLoss: {
                          label: "Profit/Loss",
                          color: "#16a34a",
                        },
                      }}
                      className="h-full"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={strategyData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis
                            dataKey="stockPrice"
                            label={{ value: "Stock Price at Expiration ($)", position: "insideBottom", offset: -10 }}
                            stroke="#64748b"
                          />
                          <YAxis
                            label={{ value: "Profit/Loss ($)", angle: -90, position: "insideLeft" }}
                            stroke="#64748b"
                          />
                          <ReferenceArea
                            y1={0}
                            y2={Math.max(...strategyData.map((d) => d.profitLoss))}
                            fill="#dcfce7"
                            fillOpacity={0.3}
                            stroke="none"
                          />
                          <ReferenceArea
                            y1={Math.min(...strategyData.map((d) => d.profitLoss))}
                            y2={0}
                            fill="#fef2f2"
                            fillOpacity={0.3}
                            stroke="none"
                          />
                          <ReferenceLine y={0} stroke="#6b7280" strokeWidth={2} strokeDasharray="8 4" />
                          <ReferenceLine
                            x={stockPrice[0]}
                            stroke="#3b82f6"
                            strokeWidth={2}
                            strokeDasharray="4 4"
                            label={{ value: "Current Price", position: "topRight", fill: "#3b82f6", fontSize: 12 }}
                          />
                          <ReferenceLine
                            x={strikePrice[0]}
                            stroke="#8b5cf6"
                            strokeWidth={2}
                            strokeDasharray="4 4"
                            label={{ value: "Strike Price", position: "topLeft", fill: "#8b5cf6", fontSize: 12 }}
                          />
                          <Tooltip
                            formatter={(value, name) => {
                              if (name === "profitLoss") {
                                const profit = Number(value)
                                return [`$${profit.toFixed(2)}`, profit >= 0 ? "💰 PROFIT" : "📉 LOSS"]
                              }
                              return [`$${Number(value).toFixed(2)}`, name]
                            }}
                            labelFormatter={(value) => `Stock Price: $${value}`}
                            contentStyle={{
                              backgroundColor: "#ffffff",
                              border: "1px solid #e2e8f0",
                              borderRadius: "8px",
                              boxShadow: "0 4px 12px -1px rgba(0, 0, 0, 0.15)",
                              fontSize: "14px",
                            }}
                          />
                          <Line
                            type="monotone"
                            dataKey="profitLoss"
                            stroke="#2563eb"
                            strokeWidth={4}
                            name="profitLoss"
                            dot={false}
                            activeDot={{
                              r: 6,
                              fill: "#3b82f6",
                              stroke: "#ffffff",
                              strokeWidth: 2,
                            }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </div>

                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    <div className="flex items-center gap-2 p-2 bg-green-50 rounded border border-green-200">
                      <div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div>
                      <span className="text-green-800 font-medium">Profit Zone</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-red-50 rounded border border-red-200">
                      <div className="w-3 h-3 bg-red-100 border border-red-300 rounded"></div>
                      <span className="text-red-800 font-medium">Loss Zone</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-blue-50 rounded border border-blue-200">
                      <div className="w-3 h-1 bg-blue-500 rounded"></div>
                      <span className="text-blue-800 font-medium">Current Price</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-purple-50 rounded border border-purple-200">
                      <div className="w-3 h-1 bg-purple-500 rounded"></div>
                      <span className="text-purple-800 font-medium">Strike Price</span>
                    </div>
                  </div>

                  <div className="mt-4 p-4 bg-muted/50 rounded-lg border-l-4 border-primary">
                    <div className="flex items-start gap-2">
                      <Info className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-sm mb-1">How to Read This Chart:</h4>
                        <p className="text-sm text-muted-foreground mb-2">{currentStrategy.explanation}</p>
                        <div className="text-xs text-muted-foreground space-y-1 mt-2 pl-2 border-l-2 border-muted">
                          <p>
                            • <span className="text-green-600 font-medium">Green shaded area</span> = Profit zone (above
                            $0 line)
                          </p>
                          <p>
                            • <span className="text-red-600 font-medium">Red shaded area</span> = Loss zone (below $0
                            line)
                          </p>
                          <p>
                            • <span className="text-blue-600 font-medium">Blue dashed line</span> = Current stock price
                          </p>
                          <p>
                            • <span className="text-purple-600 font-medium">Purple dashed line</span> = Strike price
                          </p>
                          <p>
                            • <span className="text-gray-600 font-medium">Gray dashed line</span> = Breakeven point ($0
                            profit/loss)
                          </p>
                          <p>
                            • <span className="font-medium">Thick colored line</span> = Your strategy's profit/loss at
                            different stock prices
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon className={`h-5 w-5 ${currentStrategy.color}`} />
                  Strategy Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge className={currentStrategy.badgeColor}>{currentStrategy.badge}</Badge>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Max Profit:</span>
                    <span className="text-sm font-medium text-green-600">{currentStrategy.maxProfit}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Max Loss:</span>
                    <span className="text-sm font-medium text-red-600">{currentStrategy.maxLoss}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Breakeven:</span>
                    <span className="text-sm font-medium">{currentStrategy.breakeven}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Current Parameters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Stock Price:</span>
                  <span className="text-sm font-medium">${stockPrice[0]}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Strike Price:</span>
                  <span className="text-sm font-medium">${strikePrice[0]}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Days to Expiry:</span>
                  <span className="text-sm font-medium">{timeToExpiry[0]}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Volatility:</span>
                  <span className="text-sm font-medium">{volatility[0]}%</span>
                </div>
                <div className="border-t pt-3 mt-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Call Price:</span>
                    <span className="text-sm font-medium">${callPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Put Price:</span>
                    <span className="text-sm font-medium">${putPrice.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Entry & Exit Timing
                </CardTitle>
                <CardDescription>When and how to trade this strategy</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm mb-2 text-green-700">🎯 Best Entry Conditions:</h4>
                  <ul className="text-xs space-y-1 text-muted-foreground">
                    {currentStrategy.entryExitTiming?.bestEntryConditions.map((condition, index) => (
                      <li key={index} className="flex items-start gap-1">
                        <span className="text-green-600">•</span>
                        <span>{condition}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-sm mb-2 text-blue-700">🚪 Exit Strategies:</h4>
                  <ul className="text-xs space-y-1 text-muted-foreground">
                    {currentStrategy.entryExitTiming?.exitStrategies.map((strategy, index) => (
                      <li key={index} className="flex items-start gap-1">
                        <span className="text-blue-600">•</span>
                        <span>{strategy}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <span className="text-orange-600">⏰</span>
                  Time Decay Scenarios
                </CardTitle>
                <CardDescription>How time affects this strategy</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {currentStrategy.entryExitTiming?.timeDecayScenarios.map((scenario, index) => (
                  <div key={index} className="border-l-2 border-orange-200 pl-3 space-y-1">
                    <h5 className="font-medium text-xs text-orange-700">{scenario.scenario}</h5>
                    <p className="text-xs text-muted-foreground">{scenario.description}</p>
                    <p className="text-xs text-blue-600 italic">{scenario.example}</p>
                    <p className="text-xs font-medium">{scenario.action}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <span className="text-purple-600">📊</span>
                  Real Trading Example
                </CardTitle>
                <CardDescription>Step-by-step scenario walkthrough</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-purple-50 rounded border border-purple-200">
                  <h5 className="font-medium text-sm text-purple-700 mb-1">Setup:</h5>
                  <p className="text-xs text-purple-600">{currentStrategy.entryExitTiming?.realWorldExample.setup}</p>
                  <p className="text-xs text-purple-600 mt-1">
                    {currentStrategy.entryExitTiming?.realWorldExample.entry}
                  </p>
                </div>

                {Object.entries(currentStrategy.entryExitTiming?.realWorldExample || {})
                  .filter(([key]) => key.startsWith("scenario"))
                  .map(([key, scenario]: [string, any]) => (
                    <div key={key} className="border-l-2 border-gray-200 pl-3 space-y-1">
                      <p className="text-xs font-medium text-gray-700">{scenario.outcome}</p>
                      <p className="text-xs text-blue-600">{scenario.timing}</p>
                      <p className="text-xs text-green-700 italic">{scenario.lesson}</p>
                    </div>
                  ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">The Greeks</CardTitle>
                <CardDescription>Key risk metrics for options</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="p-3 bg-blue-50 rounded border border-blue-200">
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <span className="text-sm font-medium">Delta</span>
                        <p className="text-xs text-muted-foreground">Price sensitivity</p>
                      </div>
                      <span className={`text-sm font-medium ${delta > 0.5 ? "text-green-600" : "text-blue-600"}`}>
                        {delta.toFixed(2)}
                      </span>
                    </div>
                    <div className="text-xs text-blue-700 space-y-1">
                      <p>
                        <strong>What it means:</strong> For every $1 the stock moves, your option value changes by $
                        {(delta * 100).toFixed(0)}
                      </p>
                      <p>
                        <strong>Why it matters:</strong> Delta tells you how much money you make/lose per $1 stock move.
                        Higher delta = more sensitive to stock price changes.
                      </p>
                      <p>
                        <strong>Range:</strong> Calls: 0 to 1.0 | Puts: -1.0 to 0 | At-the-money ≈ 0.50
                      </p>
                      <p>
                        <strong>Real example:</strong> Delta 0.65 means if stock rises $2, your call gains $130 (0.65 ×
                        $2 × 100 shares)
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-purple-50 rounded border border-purple-200">
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <span className="text-sm font-medium">Gamma</span>
                        <p className="text-xs text-muted-foreground">Delta acceleration</p>
                      </div>
                      <span className="text-sm font-medium text-purple-600">{gamma.toFixed(3)}</span>
                    </div>
                    <div className="text-xs text-purple-700 space-y-1">
                      <p>
                        <strong>What it means:</strong> How much delta changes for each $1 stock move. Gamma of 0.025
                        means delta increases by 0.025 per $1 stock rise.
                      </p>
                      <p>
                        <strong>Why it matters:</strong> High gamma = delta changes rapidly = bigger profits/losses as
                        stock moves. It's the "acceleration" of your position.
                      </p>
                      <p>
                        <strong>Peak time:</strong> Highest when option is at-the-money and near expiration (most
                        volatile)
                      </p>
                      <p>
                        <strong>Real example:</strong> Stock moves $5 up, your delta goes from 0.65 to 0.78 (0.025 × 5 =
                        0.125 increase)
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-orange-50 rounded border border-orange-200">
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <span className="text-sm font-medium">Theta</span>
                        <p className="text-xs text-muted-foreground">Time decay</p>
                      </div>
                      <span className="text-sm font-medium text-orange-600">{theta.toFixed(2)}</span>
                    </div>
                    <div className="text-xs text-orange-700 space-y-1">
                      <p>
                        <strong>What it means:</strong> Your option loses ${Math.abs(theta * 100).toFixed(0)} in value
                        every day that passes (all else equal)
                      </p>
                      <p>
                        <strong>Why it matters:</strong> Time is your enemy when buying options, your friend when
                        selling. Theta accelerates as expiration approaches.
                      </p>
                      <p>
                        <strong>Time decay pattern:</strong> Slow at first, then rapidly accelerates in final 30 days
                      </p>
                      <p>
                        <strong>Real example:</strong> With 30 days left, you lose $15/day. With 3 days left, you might
                        lose $50/day!
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-indigo-50 rounded border border-indigo-200">
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <span className="text-sm font-medium">Vega</span>
                        <p className="text-xs text-muted-foreground">Volatility sensitivity</p>
                      </div>
                      <span className="text-sm font-medium text-indigo-600">{vega.toFixed(2)}</span>
                    </div>
                    <div className="text-xs text-indigo-700 space-y-1">
                      <p>
                        <strong>What it means:</strong> For every 1% increase in implied volatility, your option gains $
                        {(vega * 100).toFixed(0)} in value
                      </p>
                      <p>
                        <strong>Why it matters:</strong> Market fear/excitement changes option prices. High vega = very
                        sensitive to volatility changes.
                      </p>
                      <p>
                        <strong>Volatility impact:</strong> Earnings, news, market crashes all spike volatility and
                        option prices
                      </p>
                      <p>
                        <strong>Real example:</strong> Market gets nervous, volatility jumps 5%, your option gains $
                        {(vega * 5 * 100).toFixed(0)} instantly
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-gray-50 rounded border">
                  <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Market Parameters Explained
                  </h4>
                  <div className="space-y-3 text-xs">
                    <div>
                      <strong className="text-blue-600">Stock Price:</strong> Current market price. This is what you'd
                      pay to buy the stock right now. Higher stock prices generally mean higher call option premiums.
                    </div>
                    <div>
                      <strong className="text-purple-600">Strike Price:</strong> The price at which you can exercise
                      your option. For calls, you want the stock to go ABOVE this price. For puts, you want it to go
                      BELOW.
                    </div>
                    <div>
                      <strong className="text-green-600">Time to Expiry:</strong> Days until your option expires
                      worthless. More time = higher premium because there's more opportunity for the stock to move in
                      your favor.
                    </div>
                    <div>
                      <strong className="text-orange-600">Volatility:</strong> How much the stock price jumps around.
                      High volatility = higher option premiums because big moves are more likely. Think earnings
                      announcements or market crashes.
                    </div>
                    <div>
                      <strong className="text-red-600">Risk-Free Rate:</strong> Current interest rates (like Treasury
                      bills). Higher rates slightly increase call premiums and decrease put premiums, but it's usually a
                      minor factor.
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
