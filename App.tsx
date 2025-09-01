"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { OptionParams } from "@/lib/greeks"
import { PRESETS } from "@/lib/presets"
import { GreeksExplainer } from "./components/GreeksExplainer"
import { coreStrategies, Strategy } from "@/lib/strategies.core"
import { InteractiveOptionsChart } from "./components/InteractiveOptionsChart"
import { StrategyVisualizer } from "./components/StrategyVisualizer"

const defaultParams: OptionParams = { S: 100, K: 100, Premium: 5, T: 30, IV: 25, r: 5, q: 2 }

export default function App() {
  const [params, setParams] = useState<OptionParams>(defaultParams)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  const update = (key: keyof OptionParams, value: number) => {
    setParams((p) => ({ ...p, [key]: value }))
  }

  return (
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
          {([
            { key: "S", label: "Current Stock Price (S)", min: 50, max: 200, step: 1, unit: "$" },
            { key: "K", label: "Strike Price (K)", min: 50, max: 200, step: 5, unit: "$" },
            { key: "Premium", label: "Option Premium", min: 0.5, max: 30, step: 0.25, unit: "$" },
            { key: "T", label: "Days to Expiry (T)", min: 1, max: 365, step: 1, unit: " days" },
            { key: "IV", label: "Implied Volatility (IV %)", min: 5, max: 100, step: 1, unit: "%" },
            { key: "r", label: "Risk-free Interest Rate (r %)", min: 0, max: 10, step: 0.1, unit: "%" },
            { key: "q", label: "Dividend Yield (q %)", min: 0, max: 5, step: 0.1, unit: "%" },
          ] as const).map(({ key, label, min, max, step, unit }) => (
            <div key={key} className="space-y-1">
              <label className="text-sm font-medium" htmlFor={key}>{label}: {params[key].toFixed(2)}{unit}</label>
              <Slider
                id={key}
                min={min}
                max={max}
                step={step}
                value={[params[key]]}
                onValueChange={(v) => update(key, v[0])}
                aria-label={label}
              />
            </div>
          ))}
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <Button key={p.id} size="sm" variant="outline" onClick={() => setParams(p.values)}>
                {p.label}
              </Button>
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
                <InteractiveOptionsChart strategy={s} params={params} />
                <StrategyVisualizer legs={s.legs} netPremium={params.Premium} />
                <ul className="list-disc pl-4 text-sm">
                  {s.whenToUse.map((w) => (
                    <li key={w}>{w}</li>
                  ))}
                </ul>
              </CardContent>
            )}
          </Card>
        ))}
      </section>

      <p className="text-xs text-muted-foreground" id="disclaimer">
        For educational purposes only. Not financial advice. Payoffs and Greeks are simplified approximations.
      </p>
    </div>
  )
}
