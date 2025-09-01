import { OptionParams } from "./greeks"

export interface Preset {
  id: string
  label: string
  values: OptionParams
}

export const PRESETS: Preset[] = [
  { id: "ATM", label: "ATM Option", values: { S:100, K:100, Premium:3, T:30, IV:20, r:5, q:2 } },
  { id: "OTMCall", label: "OTM Call", values: { S:100, K:105, Premium:2, T:30, IV:25, r:5, q:2 } },
  { id: "OTMPut", label: "OTM Put", values: { S:100, K:95, Premium:2, T:30, IV:25, r:5, q:2 } },
  { id: "HighVol", label: "High Volatility", values: { S:100, K:100, Premium:8, T:7, IV:50, r:5, q:1 } },
  { id: "Earnings", label: "Earnings Week", values: { S:100, K:100, Premium:10, T:5, IV:70, r:5, q:1 } },
  { id: "Calm", label: "Calm Market", values: { S:100, K:100, Premium:2, T:45, IV:12, r:5, q:2 } },
  { id: "Crash", label: "Crash Scenario", values: { S:75, K:95, Premium:6, T:14, IV:80, r:4, q:0 } }
]
