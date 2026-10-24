# 🌱 Smart Planting Predictor (Powered by Gemma 4)

A simple, practical AI agricultural assistant designed for smallholder farmers, commercial growers, cooperatives, and agricultural extension workers across Nigeria and Sub-Saharan Africa.

It analyzes your local state/LGA, chosen crop, soil conditions, and rainfall patterns to tell you the safest and best time to plant, warn you about dry spells or flash floods, and provide easy follow-up farming reminders.

---

## What It Does

1. **Recommends Planting Windows:** Tells you the exact recommended planting dates so you don't plant too early (risking dried seeds) or too late (losing end-of-season rains).
2. **Warns About Weather Risks:** Alerts you to upcoming dry breaks, heavy storms, and false starts to the rainy season.
3. **Explains the "Why" in Simple Words:** Gives plain-language reasons for every decision so farmers understand the advice.
4. **Separates Forecasts from Seasons:** Clearly explains what is happening in the next 7–14 days versus the full 3–5 month rainy season.
5. **Provides a Farming Timeline:** Step-by-step reminders for land prep, seed depth, first weeding, fertilizer application (NPK & Urea), and harvesting.
6. **WhatsApp & SMS Friendly:** Includes a one-click button to copy a short summary ready to send to farmer groups.

---

## Requirements & Setup

You only need **Node.js** (version 18 or higher) installed on your computer.

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy the example file to create your own configuration:
```bash
cp .env.example .env
```

Open `.env` and configure your settings:
```env
# Your Google AI Studio API key
GEMINI_API_KEY="your-google-ai-studio-api-key"

# Active provider: "api" (Google AI Studio) or "local" (Ollama)
PROVIDER="api"

# Gemma 4 model on Gemini API
GEMMA_MODEL="gemma-4-31b-it"

# Optional local Ollama settings (used only when PROVIDER="local")
OLLAMA_BASE_URL="http://localhost:11434"
OLLAMA_MODEL="gemma4:e2b"
```

> **Security Note:** The `GEMINI_API_KEY` stays strictly on the server side. It is never exposed to web browser code or stored in public files. `.env` is ignored in `.gitignore`.

---

## How to Run

### Option A: Run with Google AI Studio (Cloud API - Default)

1. Make sure `PROVIDER="api"` and your `GEMINI_API_KEY` is set in your `.env` file.
2. Start the development server:
   ```bash
   npm run dev
   ```
3. Open your web browser at:
   ```
   http://localhost:3000
   ```

---

### Option B: Run with Ollama (100% Offline / Local Fallback)

If you are in a location with limited internet or want to run entirely on your own laptop:

1. Install [Ollama](https://ollama.com/) if you haven't already.
2. Pull the lightweight Gemma 4 model:
   ```bash
   ollama pull gemma4:e2b
   ```
3. Set your environment variable:
   ```bash
   export PROVIDER=local
   ```
   *(Or edit `.env` and set `PROVIDER="local"`)*
4. Start the app:
   ```bash
   npm run dev
   ```
5. The app uses the exact same prediction code path and displays your results offline!

---

## How to Run the Smoke Test

We built an automated test script that sends a realistic farming scenario (Kaduna State smallholder maize farm) through the active provider and verifies that all recommendations, risk alerts, and timeline steps are returned properly.

Run the test with one command:
```bash
npm test
```
*(or `npx tsx smoke-test.ts`)*

- If everything works, it prints detailed results and ends with:
  ```
  === SMOKE TEST RESULT: PASS ===
  ```
- If an issue occurs, it displays the error and prints:
  ```
  === SMOKE TEST RESULT: FAIL ===
  ```

---

## Production Build & Standalone Server

To build the static frontend and run with the Express server:
```bash
npm run build
npm start
```
The server will start on port `3000`.
