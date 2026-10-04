# Trade Journal v3

React + TypeScript + Vite + Supabase trade journal.

## Structuur
- `src/components` herbruikbare layout/UI
- `src/features` feature-specifieke schermen (auth, dashboard, trades, statistieken, kalender)
- `src/hooks` state/data hooks
- `src/services` Supabase data access
- `src/types` TypeScript domeintypes
- `src/utils` berekeningen en formatting
- `src/styles` globale styling
- `supabase` SQL migraties

## Upgrade vanaf v2
1. Run `supabase/v3_migration.sql` in Supabase SQL Editor.
2. Maak lokaal `.env` op basis van `.env.example`.
3. `npm install`
4. `npm run dev`

## V3
P&L en R worden automatisch berekend uit richting, entry, exit, stop loss, positiegrootte en fees. Trades kunnen worden toegevoegd, bewerkt en verwijderd.

Let op: de P&L-formule is `(prijsverschil × positiegrootte) - fees`. Voor instrumenten met contract/pip multipliers vul je bij positiegrootte de effectieve multiplier/quantity in. Een broker-import kan dit later instrument-specifiek maken.
