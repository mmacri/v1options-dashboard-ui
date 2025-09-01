export type TelemetryEvent =
  | { name: "app_loaded"; ttfb_ms: number; dom_ready_ms: number }
  | { name: "preset_applied"; preset: string }
  | { name: "param_changed"; field: string; value: number }
  | { name: "strategy_toggled"; id: string; expanded: boolean }

export function fireTelemetry(event: TelemetryEvent) {
  // placeholder for analytics
  if (process.env.NODE_ENV !== "production") {
    console.debug("telemetry", event)
  }
}
