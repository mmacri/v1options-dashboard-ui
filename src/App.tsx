import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { OptionParams } from "@/lib/greeks"
import { PRESETS } from "@/lib/presets"
import { GreeksExplainer } from "./components/GreeksExplainer"
import { InfoIcon } from "./components/InfoIcon"
import { coreStrategies, Strategy } from "@/lib/strategies.core"
import { InteractiveOptionsChart } from "./components/InteractiveOptionsChart"
import { StrategyVisualizer } from "./components/StrategyVisualizer"

const defaultParams: OptionParams = { S: 100, K: 100, Premium: 5, T: 30, IV: 25, r: 5, q: 2 }

const PARAMETER_INFO = [
  {
    key: "S",
    label: "Current Stock Price (S)",
    min: 50,
    max: 200,
    step: 1,
    unit: "$",
    title: "Current Stock Price (S)",
    description: "This is the current market price of the underlying asset (e.g., a stock). The value of an option is directly influenced by the price of the asset it's based on.",
    analogy: "Think of it as the 'sticker price' of a car. Everything else is calculated relative to this price."
  },
  {
    key: "K",
    label: "Strike Price (K)",
    min: 50,
    max: 200,
    step: 5,
    unit: "$",
    title: "Strike Price (K)",
    description: "The strike price is the price at which you have the right to buy (for a call) or sell (for a put) the underlying asset. The relationship between the strike price and the stock price determines if an option is in-the-money, at-the-money, or out-of-the-money.",
    analogy: "This is the 'agreed-upon price' in your contract. You have the right to buy or sell at this price, no matter what the market price is."
  },
  {
    key: "Premium",
    label: "Option Premium",
    min: 0.5,
    max: 30,
    step: 0.25,
    unit: "$",
    title: "Option Premium",
    description: "The premium is the price you pay to buy an option contract. It's the cost of having the right to buy or sell the stock at the strike price. The premium is influenced by all other parameters.",
    analogy: "This is the 'down payment' you make to secure the right to buy the house at the agreed-upon price. You don't get it back, even if you don't buy the house."
  },
  {
    key: "T",
    label: "Days to Expiry (T)",
    min: 1,
    max: 365,
    step: 1,
    unit: " days",
    title: "Days to Expiry (T)",
    description: "This is the amount of time left until the option contract expires. The more time an option has, the more valuable it is, because there's more time for the stock price to move in a favorable direction. This is known as 'time value'.",
    analogy: "This is the 'expiration date' on a coupon. The longer you have to use it, the more valuable it is."
  },
  {
    key: "IV",
    label: "Implied Volatility (IV %)",
    min: 5,
    max: 100,
    step: 1,
    unit: "%",
    title: "Implied Volatility (IV %)",
    description: "Implied Volatility (IV) is a forecast of how much a stock's price is expected to move. It's often called the 'fear gauge' because it tends to rise when the market anticipates big price swings, such as before an earnings report or during a market downturn.",
    analogy: "Think of it like car insurance. An 18-year-old with a sports car pays a higher premium than a 40-year-old with a minivan because the risk (volatility) is higher."
  },
  {
    key: "r",
    label: "Risk-free Interest Rate (r %)",
    min: 0,
    max: 10,
    step: 0.1,
    unit: "%",
    title: "Risk-free Interest Rate (r %)",
    description: "This is the theoretical rate of return of an investment with zero risk, typically based on the interest rate of a U.S. Treasury bill. Higher interest rates generally make call options more expensive and put options cheaper.",
    analogy: "This is the 'opportunity cost' of your money. If you could be earning a guaranteed 5% elsewhere, that affects the value of your investment today."
  },
  {
    key: "q",
    label: "Dividend Yield (q %)",
    min: 0,
    max: 5,
    step: 0.1,
    unit: "%",
    title: "Dividend Yield (q %)",
    description: "The dividend yield is the expected annual dividend per share, expressed as a percentage of the stock's current price. Dividends generally cause stock prices to drop by the dividend amount, which makes call options less valuable and put options more valuable.",
    analogy: "This is like a 'rebate' paid to shareholders. Since it lowers the stock price, it affects the value of options tied to that stock."
  },
] as const

export default function App() {
  const [params, setParams] = useState<OptionParams>(defaultParams)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  const update = (key: keyof OptionParams, value: number) => {
    setParams((p) => ({ ...p, [key]: value }))
  }

  return (
    <TooltipProvider>
      <div className="w-full max-w-7xl mx-auto p-6 space-y-6" role="main">
        <header className="space-y-1">
          <h1 className="text-2xl font-bold">Options Trading Strategies</h1>
          <p className="text-sm text-muted-foreground">Explore different options strategies and learn how their payoffs and Greeks work.</p>
        </header>

        <Card id="marketParameters">
          <CardHeader>
            <CardTitle>Market Parameters & Option Pricing Inputs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
          {PARAMETER_INFO.map(({ key, label, min, max, step, unit, title, description, analogy }) => (
              <div key={key} className="space-y-1">
              <div className="flex items-center">
                <label className="text-sm font-medium" htmlFor={key}>{label}: {params[key].toFixed(2)}{unit}</label>
                <InfoIcon title={title}>
                  <p>{description}</p>
                  <p className="italic"><strong>Analogy:</strong> {analogy}</p>
                </InfoIcon>
              </div>
                <Slider
                  id={key}
                  min={min}
                  max={max}
                  step={step}
                  value={[params[key]]}
                  onValueChange={(v: number[]) => update(key, v[0])}
                />
              </div>
            ))}
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((p) => (
                <Tooltip key={p.id}>
                  <TooltipTrigger asChild>
                    <Button size="sm" variant="outline" onClick={() => setParams(p.values)}>
                      {p.label}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{p.description}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </CardContent>
        </Card>

        <GreeksExplainer params={params} />

        <section id="strategies" className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {coreStrategies.map((s: Strategy) => (
            <Card key={s.id}>
              <CardHeader onClick={() => setExpanded((e) => ({ ...e, [s.id]: !e[s.id] }))} className="cursor-pointer">
                <CardTitle>{s.name}</CardTitle>
              </CardHeader>
              {expanded[s.id] && (
                <CardContent className="space-y-4">
                <Tabs defaultValue="chart" className="w-full">
                  <TabsList>
                    <TabsTrigger value="chart">Payoff Graph</TabsTrigger>
                    <TabsTrigger value="explanation">Explained</TabsTrigger>
                    <TabsTrigger value="example">Example</TabsTrigger>
                    <TabsTrigger value="proscons">Pros & Cons</TabsTrigger>
                  </TabsList>
                  <TabsContent value="chart">
                    <InteractiveOptionsChart strategy={s} params={params} />
                    <StrategyVisualizer legs={s.legs} netPremium={params.Premium} />
                  </TabsContent>
                  <TabsContent value="explanation" className="text-sm text-muted-foreground">
                    <p className="font-semibold text-foreground mb-2">Outlook: {s.outlook}</p>
                    <p>{s.explanation}</p>
                  </TabsContent>
                  <TabsContent value="example" className="text-sm text-muted-foreground space-y-2">
                    <p><strong className="text-foreground">Scenario:</strong> {s.example.scenario}</p>
                    <p><strong className="text-foreground">Entry:</strong> {s.example.entry}</p>
                    <p><strong className="text-foreground">Profit:</strong> {s.example.profit}</p>
                    <p><strong className="text-foreground">Loss:</strong> {s.example.loss}</p>
                  </TabsContent>
                  <TabsContent value="proscons">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <h4 className="font-semibold text-green-600 mb-2">Pros</h4>
                        <ul className="list-disc pl-4 space-y-1">
                          {s.pros.map((p) => <li key={p}>{p}</li>)}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-red-600 mb-2">Cons</h4>
                        <ul className="list-disc pl-4 space-y-1">
                          {s.cons.map((c) => <li key={c}>{c}</li>)}
                        </ul>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
                </CardContent>
              )}
            </Card>
          ))}
        </section>

        <p className="text-xs text-muted-foreground" id="disclaimer">
          For educational purposes only. Not financial advice. Payoffs and Greeks are simplified approximations.
        </p>
      </div>
    </TooltipProvider>
  )
}
