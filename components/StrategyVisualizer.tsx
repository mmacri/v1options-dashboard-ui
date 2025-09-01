"use client"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react"

interface Props {
  legs: string[]
  netPremium: number
}

const actionColor = (leg: string) => {
  if (leg.toLowerCase().startsWith("buy")) return "bg-green-100 text-green-800"
  if (leg.toLowerCase().startsWith("sell")) return "bg-red-100 text-red-800"
  return "bg-gray-100 text-gray-800"
}

const iconFor = (leg: string) => {
  if (leg.toLowerCase().includes("call")) return <TrendingUp className="w-3 h-3" />
  if (leg.toLowerCase().includes("put")) return <TrendingDown className="w-3 h-3" />
  return <DollarSign className="w-3 h-3" />
}

export function StrategyVisualizer({ legs, netPremium }: Props) {
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {legs.map((leg) => (
          <Badge key={leg} className={cn(actionColor(leg), "flex items-center gap-1")}> 
            {iconFor(leg)}
            <span>{leg}</span>
          </Badge>
        ))}
      </div>
      <div className="text-sm font-medium">
        Net Premium: {netPremium >= 0 ? "+" : "-"}${Math.abs(netPremium).toFixed(2)}
      </div>
    </div>
  )
}
