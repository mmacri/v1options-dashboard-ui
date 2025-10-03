# Product Design & Implementation: Options Dashboard Educational Enhancements

## 1. Overview

This document outlines the design and implementation details for enhancing the educational experience of the Options Trading Dashboard. The goal is to transform the application from a simple calculator into an interactive learning tool by integrating contextual information and detailed explanations directly into the UI.

The core design principle is **progressive disclosure**, allowing users to access information as needed without cluttering the interface.

---

## 2. Feature Specifications

### 2.1. Scenario Buttons with Tooltips

-   **Feature:** Each of the seven scenario preset buttons will have a descriptive tooltip that appears on hover.
-   **Purpose:** To explain the market conditions that each scenario simulates, helping users understand the "why" behind the parameter changes.
-   **UI/UX Design:**
    -   A standard tooltip will appear on hover over each scenario button.
    -   The tooltip will contain a concise, one-sentence description.
-   **Content Specification:**
    -   **ATM Option:** "Sets the Strike Price equal to the Stock Price. ATM options are most sensitive to changes in other parameters."
    -   **OTM Call:** "Sets the Strike Price above the Stock Price. OTM calls are cheaper but require a larger price move to be profitable."
    -   **OTM Put:** "Sets the Strike Price below the Stock Price. OTM puts are cheaper and used to bet on a stock's price falling."
    -   **High Volatility:** "Increases Implied Volatility (IV), making options more expensive. Good for simulating pre-earnings or major news."
    -   **Earnings Week:** "Simulates conditions before an earnings report: very high IV and short time to expiry."
    -   **Calm Market:** "Simulates a stable market with low Implied Volatility. Ideal for strategies that profit from time decay."
    -   **Crash Scenario:** "Simulates a market crash with a sharp drop in stock price and a spike in IV, reflecting market fear."
-   **Success Criteria:**
    -   Hovering over any scenario button reveals a tooltip.
    -   The tooltip content matches the specified text.
    -   The `Tooltip` and `TooltipProvider` components are correctly implemented in `App.tsx`.
    -   The `description` field is present in the `Preset` interface and populated in `src/lib/presets.ts`.

### 2.2. Informational Modals for Market Parameters

-   **Feature:** Each of the seven market parameter sliders will have a clickable info icon that opens a modal with a detailed explanation.
-   **Purpose:** To provide users with a deep understanding of each input parameter of the options pricing model.
-   **UI/UX Design:**
    -   A small `ⓘ` icon will be placed next to each parameter label (e.g., "Implied Volatility (IV %) ⓘ").
    -   Clicking the icon will trigger a modal dialog.
    -   The modal will have a clear title and a body containing the description and an analogy.
-   **Content Specification (Example for Implied Volatility):**
    -   **Title:** "Implied Volatility (IV %)"
    -   **Description:** "Implied Volatility (IV) is a forecast of how much a stock's price is expected to move. It's often called the 'fear gauge' because it tends to rise when the market anticipates big price swings, such as before an earnings report or during a market downturn."
    -   **Analogy:** "Think of it like car insurance. An 18-year-old with a sports car pays a higher premium than a 40-year-old with a minivan because the risk (volatility) is higher."
-   **Success Criteria:**
    -   An info icon is present next to each of the seven market parameter labels.
    -   Clicking each icon opens a modal dialog.
    -   The modal for each parameter displays the correct title and content.
    -   The `Dialog` component is correctly implemented in `src/components/ui/dialog.tsx`.
    -   A reusable `InfoIcon` component exists and is used in `App.tsx`.
    -   The educational content is stored in a structured way (e.g., the `PARAMETER_INFO` constant in `App.tsx`).

### 2.3. Expanded `GreeksExplainer` Component

-   **Feature:** The "Options Greeks" card will be enhanced with a more detailed, tabbed interface.
-   **Purpose:** To provide a comprehensive explanation of each of the five major Greeks.
-   **UI/UX Design:**
    -   The existing component will be updated to a three-tab layout.
    -   The tabs will be labeled: "What is it?", "Key Drivers", and "Trading Insights".
-   **Content Specification (Example for Delta):**
    -   **What is it?:** "Delta measures the rate of change of the option's price with respect to a $1 change in the underlying asset's price. It's often used as a proxy for the probability of an option expiring in-the-money."
    -   **Key Drivers:** "Primarily driven by the option's 'moneyness' (strike vs. stock price). It increases as a call option gets deeper in-the-money and approaches 1.0."
    -   **Trading Insights:** "Use Delta to gauge directional risk. A portfolio of stocks and options can be 'delta-neutral', meaning it's hedged against small price movements."
-   **Success Criteria:**
    -   The `GreeksExplainer.tsx` component renders a tabbed interface with the three specified tabs.
    -   Clicking each Greek's badge updates the content of all three tabs.
    -   The `GREEK_INFO` constant in `GreeksExplainer.tsx` contains the updated, detailed content for all five Greeks.

### 2.4. Rebuilt Strategy Cards

-   **Feature:** The expandable section for each of the four core strategies will be replaced with a rich, tabbed interface.
-   **Purpose:** To provide a complete educational breakdown of each strategy, including its purpose, mechanics, and risks.
-   **UI/UX Design:**
    -   When a strategy card is expanded, it will reveal a four-tab layout.
    -   The tabs will be labeled: "Payoff Graph", "Explained", "Example", and "Pros & Cons".
-   **Content Specification (Example for Long Call):**
    -   **Explained:**
        -   **Outlook:** "Strongly Bullish"
        -   **Explanation:** "A Long Call is the simplest way to bet on a stock's price going up..."
    -   **Example:**
        -   **Scenario:** "You believe stock XYZ, currently trading at $50, is going to rise sharply..."
        -   **Entry:** "You buy one call option with a strike price of $55..."
        -   **Profit:** "XYZ rallies to $60 before expiration..."
        -   **Loss:** "XYZ stays below $55 at expiration..."
    -   **Pros & Cons:**
        -   **Pros:** ["Unlimited profit potential", "Limited and defined risk", ...]
        -   **Cons:** ["You can lose 100% of your investment", "Time decay (Theta) works against you..."]
-   **Success Criteria:**
    -   The `Strategy` interface in `src/lib/strategies.core.ts` is updated to include the new fields (`outlook`, `explanation`, `example`, `pros`, `cons`).
    -   The `coreStrategies` array is populated with the new educational content for all four strategies.
    -   In `App.tsx`, the expanded view for each strategy card correctly renders the four tabs with the corresponding content.

---
## 3. Final Verification

The final success of this implementation will be determined by a code-level verification against this document, followed by a successful, clean build of the application.