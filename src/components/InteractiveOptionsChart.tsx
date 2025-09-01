import { useMemo } from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ReferenceDot,
  Area,
  ResponsiveContainer,
} from "recharts"
import { OptionParams } from "@/lib/greeks"
import { Strategy } from "@/lib/strategies.core"

interface Props {
  strategy: Strategy
  params: OptionParams
}

export function InteractiveOptionsChart({ strategy, params }: Props) {
  const data = useMemo(() => {
    const points = strategy.payoff(params)
    return points.map((d) => ({
      price: d.price,
      pl: d.pl,
      profit: d.pl > 0 ? d.pl : 0,
      loss: d.pl < 0 ? d.pl : 0,
    }))
  }, [strategy, params])

  const breakeven = strategy.breakeven(params)
  const breakevens = Array.isArray(breakeven) ? breakeven : [breakeven]

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data} margin={{ left: 0, right: 0 }}>
        <XAxis dataKey="price" type="number" domain={['dataMin','dataMax']} label={{ value: "Stock Price ($)", position: 'insideBottom', offset: -5 }} />
        <YAxis dataKey="pl" label={{ value: "Profit/Loss ($)", angle: -90, position: 'insideLeft' }} />
        <Tooltip formatter={(v: number) => `$${v.toFixed(2)}`} labelFormatter={(l: number) => `$${l.toFixed(2)}`} />
        <ReferenceLine y={0} stroke="#999" />
        <ReferenceLine x={params.S} strokeDasharray="3 3" />
        {breakevens.map((b) => (
          <ReferenceDot key={b} x={b} y={0} r={4} stroke="orange" />
        ))}
        <Area type="monotone" dataKey="profit" fill="rgba(34,197,94,0.2)" stroke="none" />
        <Area type="monotone" dataKey="loss" fill="rgba(239,68,68,0.2)" stroke="none" />
        <Line type="monotone" dataKey="pl" stroke="#2563eb" dot={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}
