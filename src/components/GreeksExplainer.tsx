import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { calculateGreeks, OptionParams } from "@/lib/greeks"

interface Props {
  params: OptionParams
}

const GREEK_INFO = {
  Delta: {
    definition: "Delta measures the rate of change of the option's price with respect to a $1 change in the underlying asset's price. It's often used as a proxy for the probability of an option expiring in-the-money.",
    drivers: "Primarily driven by the option's 'moneyness' (strike vs. stock price). It increases as a call option gets deeper in-the-money and approaches 1.0.",
    insights: "Use Delta to gauge directional risk. A portfolio of stocks and options can be 'delta-neutral', meaning it's hedged against small price movements.",
  },
  Gamma: {
    definition: "Gamma measures the rate of change of an option's Delta. It represents how much the Delta will change for a $1 move in the underlying stock. It's a measure of the convexity of the option's value.",
    drivers: "Gamma is highest for at-the-money options and decreases as the option moves further in- or out-of-the-money. It's also higher for options closer to expiration.",
    insights: "High Gamma means high risk and high potential reward. It indicates that the option's directional exposure can change very quickly, which can be dangerous for sellers of options (short gamma).",
  },
  Theta: {
    definition: "Theta measures the rate of decline in the value of an option due to the passage of time. It's often called 'time decay'.",
    drivers: "Theta is always negative for long options. The rate of decay accelerates as the option approaches its expiration date, especially for at-the-money options.",
    insights: "Theta is the enemy of the option buyer and the friend of the option seller. Income-generating strategies like covered calls or short puts are designed to profit from time decay.",
  },
  Vega: {
    definition: "Vega measures an option's sensitivity to a 1% change in implied volatility. It tells you how much the option's price will change if the market's expectation of future volatility changes.",
    drivers: "Vega is highest for at-the-money options with a long time to expiration. It decreases as the option moves away from the money or closer to expiry.",
    insights: "Vega is crucial around events like earnings announcements, where implied volatility can rise sharply ('IV crush'). Long options benefit from rising IV; short options benefit from falling IV.",
  },
  Rho: {
    definition: "Rho measures the sensitivity of an option's price to a 1% change in the risk-free interest rate. It's generally the least impactful of the major Greeks.",
    drivers: "Rho is most significant for long-dated options. Higher interest rates increase the value of call options and decrease the value of put options.",
    insights: "While often ignored for short-term options, Rho can be a factor in long-term strategies like LEAPS, especially in a changing interest rate environment.",
  },
} as const

export function GreeksExplainer({ params }: Props) {
  const greeks = useMemo(() => calculateGreeks(params), [params])
  const [selected, setSelected] = useState<keyof typeof GREEK_INFO>("Delta")

  return (
    <Card>
      <CardHeader>
        <CardTitle>Options Greeks</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Badge onClick={() => setSelected("Delta")} className="cursor-pointer">
            Δ {greeks.deltaCall.toFixed(2)} / {greeks.deltaPut.toFixed(2)}
          </Badge>
          <Badge onClick={() => setSelected("Gamma")} className="cursor-pointer">
            Γ {greeks.gamma.toFixed(2)}
          </Badge>
          <Badge onClick={() => setSelected("Theta")} className="cursor-pointer">
            Θ {greeks.theta.toFixed(2)}
          </Badge>
          <Badge onClick={() => setSelected("Vega")} className="cursor-pointer">
            ν {greeks.vega.toFixed(2)}
          </Badge>
          <Badge onClick={() => setSelected("Rho")} className="cursor-pointer">
            ρ {greeks.rhoCall.toFixed(2)} / {greeks.rhoPut.toFixed(2)}
          </Badge>
        </div>
        <Tabs defaultValue="definition" className="w-full">
          <TabsList>
            <TabsTrigger value="definition">What is it?</TabsTrigger>
            <TabsTrigger value="drivers">Key Drivers</TabsTrigger>
            <TabsTrigger value="insights">Trading Insights</TabsTrigger>
          </TabsList>
          <TabsContent value="definition">{GREEK_INFO[selected].definition}</TabsContent>
          <TabsContent value="drivers">{GREEK_INFO[selected].drivers}</TabsContent>
          <TabsContent value="insights">{GREEK_INFO[selected].insights}</TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
