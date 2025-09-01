import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { calculateGreeks, OptionParams } from "@/lib/greeks"

interface Props {
  params: OptionParams
}

const GREEK_INFO: Record<string, { examples: string; factors: string; tips: string }> = {
  Delta: {
    examples: "ATM call ≈ 0.5; deep ITM call → ~1; deep OTM call → ~0. Puts mirror in negative.",
    factors: "Moneyness, Time to expiry, Implied volatility.",
    tips: "Use Delta to estimate directional exposure and share equivalence.",
  },
  Gamma: {
    examples: "Highest near strike; Delta changes fastest at-the-money.",
    factors: "Proximity to strike, Time to expiry.",
    tips: "Short-gamma positions can be whipsawed by sharp moves.",
  },
  Theta: {
    examples: "Long options lose value as expiry nears; decay accelerates into expiry.",
    factors: "Time to expiry, IV, Moneyness.",
    tips: "Income strategies (short options) harvest Theta; long options must overcome decay.",
  },
  Vega: {
    examples: "Higher IV or longer T → larger Vega; IV up boosts long option values.",
    factors: "Implied volatility level, Time.",
    tips: "Beware IV crush post-earnings; short Vega benefits from falling IV.",
  },
  Rho: {
    examples: "Higher rates slightly help calls and hurt puts; effect grows with time to expiry.",
    factors: "Interest rates, Time.",
    tips: "More relevant for long-dated options.",
  },
}

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
        <Tabs value="examples" className="w-full">
          <TabsList>
            <TabsTrigger value="examples">Examples</TabsTrigger>
            <TabsTrigger value="factors">Key Factors</TabsTrigger>
            <TabsTrigger value="tips">Trading Tips</TabsTrigger>
          </TabsList>
          {(["examples", "factors", "tips"] as const).map((tab) => (
            <TabsContent key={tab} value={tab}>
              {GREEK_INFO[selected][tab]}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  )
}
