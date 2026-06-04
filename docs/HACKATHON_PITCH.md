# Wayflyer × Fin Hackathon — Winning Pitch Playbook

**Team product:** Pretty Fly Operator Stack  
**Lane:** Operator-focused (with Fin-aligned support automation)  
**Demo order:** Home → Control Tower → Creative Director → (optional) China  

---

## The hook (15 seconds) — say this first

> “We dug into Pretty Fly’s 24 months of data before we built anything. **296 of 645 SKUs are already negative on hand.** They’re still selling hoodies they can’t fulfil, while **Womens Launch Prospecting runs at 1.3 ROAS**. We built an operator stack that fixes stock, spend, and launch decisions — all numbers traceable to the CSV pack.”

Judges remember **a finding**, not “we built a tool.”

---

## What each judge cares about

| Judge | Angle |
|-------|--------|
| **Hannah Shortle (Wayflyer)** | Cash & inventory — £466k 90-day reorder, £280k gross profit on top-six SKUs, pause wasted ad spend |
| **Robert Davitt (Fin)** | Support — bot 16.9 min vs human 756 min; 2,054 hrs recoverable at +25% bot volume |
| **Jojo Regan (brand founder)** | Would I use this Monday? — clear actions, not another dashboard |

---

## 3-minute demo script (practice to 2:45)

### 0:00–0:20 — Problem + insight
- Open **/** (Operator Stack home)
- One sentence: underwater inventory + weak spend + launches without economics

### 0:20–1:10 — Control Tower (**lead with business value**)
- **/control-tower**
- Hero: “Make the next 7 days less expensive”
- Point at 4 metrics: **-296 variants**, **£466k reorder**, **2,054 support hrs**
- Scroll to **3 actions** — read titles only
- Table: **Pause Womens_Launch_Prospecting** (1.3 ROAS) · **Scale Shopping_Tees_UK** (4.8 ROAS)
- Table: **Heavyweight Hoodie** SKU negative stock → PO units → gross profit

### 1:10–2:00 — Creative Director (**execution + grounding**)
- **/generate** → Hoodie · Menswear · Maximize Margin → Generate
- **/designs** — “These aren’t fake concepts — they’re **real bestseller SKUs** from products.csv”
- Open **Heavyweight Hoodie** analysis
- Point at **source SKU metrics**, **similar products table**, **data sources panel** with GitHub CSV links
- Line: “Before we buy 336 units of PO stock, we know this SKU did **£238k revenue at 13% refunds**”

### 2:00–2:30 — China (optional — 20s)
- **/china-market** — “Expansion research pulls **live** from NBS / Alibaba / JD press releases — badges show what fetched”

### 2:30–3:00 — Close
> “Pretty Fly would pay for this because we tie **one data pack** to three decisions: **what to reorder**, **what to pause in ads**, and **what to launch** — with every number citeable. Next step: Wayflyer-style cash timing on POs + Fin bot playbooks on the support categories we sized.”

---

## Judging criteria — how you score

| Criterion | Your proof |
|-----------|------------|
| **Execution** | Live demo, no slides-only; APIs work; refresh buttons |
| **Business value** | £280k inventory upside · £20.7k marketing reallocation · fewer bad launches |
| **Demo quality** | Hook → ops → design → one-line close |

---

## Architecture & trade-offs (if judges ask)

- **Next.js + SQLite** — fast hackathon deploy; designs persisted per session
- **CSV analytics engine** — `sales-analytics.ts` joins line_items, products, refunds, POs, suppliers (no invented KPIs)
- **Control Tower** — precomputed snapshot from full pack (inventory, ads, support) for reliable demo latency
- **China** — live HTML fetch from official sources; partial mode if a source blocks
- **Not built (honest):** customer-facing storefront, live Shopify API — out of scope for 3 days

---

## Pre-demo checklist (Friday 7pm)

- [ ] `npm run dev:clean` — avoid stale `.next` 500 errors
- [ ] Laptop charged, hotspot backup
- [ ] Browser: only Pretty Fly tabs open
- [ ] Practice once with timer (aim 2:45)
- [ ] Discord: team name + repo link ready if asked
- [ ] Answer “why not customer-facing?” → “Inventory and spend were the loudest problems in the pack; we’d add sizing bot next on support_messages.json”

---

## One-liners for Q&A

- **vs ChatGPT?** “Every metric links to a CSV row or a press release URL — we don’t invent revenue.”
- **Why Fin?** “We sized 2,054 hours from support_tickets + messages — bot-ready categories first.”
- **Why Wayflyer?** “Reorder decisions need £466k capital — we show profit before PO, not after.”
- **Biggest risk?** “Negative stock on core hoodies — if they don’t reorder, they’re gifting demand to competitors.”

Good luck — **lead with the data insight, demo Control Tower first, close with money.**
