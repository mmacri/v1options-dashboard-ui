import { OptionParams } from "./greeks"

export interface Preset {
  id: string
  label: string
  description: string
  values: OptionParams
}

export const PRESETS: Preset[] = [
  { id: "ATM", label: "ATM Option", description: "Sets the Strike Price equal to the Stock Price. ATM options are most sensitive to changes in other parameters.", values: { S:100, K:100, Premium:3, T:30, IV:20, r:5, q:2 } },
  { id: "OTMCall", label: "OTM Call", description: "Sets the Strike Price above the Stock Price. OTM calls are cheaper but require a larger price move to be profitable.", values: { S:100, K:105, Premium:2, T:30, IV:25, r:5, q:2 } },
  { id: "OTMPut", label: "OTM Put", description: "Sets the Strike Price below the Stock Price. OTM puts are cheaper and used to bet on a stock's price falling.", values: { S:100, K:95, Premium:2, T:30, IV:25, r:5, q:2 } },
  { id: "HighVol", label: "High Volatility", description: "Increases Implied Volatility (IV), making options more expensive. Good for simulating pre-earnings or major news.", values: { S:100, K:100, Premium:8, T:7, IV:50, r:5, q:1 } },
  { id: "Earnings", label: "Earnings Week", description: "Simulates conditions before an earnings report: very high IV and short time to expiry.", values: { S:100, K:100, Premium:10, T:5, IV:70, r:5, q:1 } },
  { id: "Calm", label: "Calm Market", description: "Simulates a stable market with low Implied Volatility. Ideal for strategies that profit from time decay.", values: { S:100, K:100, Premium:2, T:45, IV:12, r:5, q:2 } },
  { id: "Crash", label: "Crash Scenario", description: "Simulates a market crash with a sharp drop in stock price and a spike in IV, reflecting market fear.", values: { S:75, K:95, Premium:6, T:14, IV:80, r:4, q:0 } }
]
