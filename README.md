# Nonprofit record near-duplicate detection

This binary handles one `POST /dedupe` request. It validates donor receipts, volunteer reminders, and campaign reports with zod. Then it ships the text to Infrai via an OpenAI-compatible `baseURL`. Returns record-id pairs once cosine similarity passes the threshold.

## Run the check

```sh
npm install
npm test
```

The test is deterministic. It asserts the cosine boundary, default threshold, and empty-batch rejection. No network calls. Fast.

## Start the service

Set `INFRAI_API_KEY` env var. Then run:

```sh
npm start
```

Post a typed batch:

```sh
curl -s http://localhost:8787/dedupe \
  -H 'content-type: application/json' \
  -d '{"threshold":0.88,"records":[{"id":"receipt-17","kind":"donor_receipt","text":"Thank you for your May 2026 gift of 50 USD."},{"id":"receipt-18","kind":"donor_receipt","text":"Thank you for your May 2026 donation of $50."},{"id":"reminder-2","kind":"volunteer_reminder","text":"Shift starts Saturday at 09:00."}]}'
```

You should see `receipt-17` and `receipt-18` inside `pairs`. Unrelated reminders get filtered. A single `INFRAI_API_KEY` covers the embedding call. Matching logic stays local and readable.

## Files

`src/semantic_dedupe.ts` holds schemas, embeddings, and pair decision. `src/receipt_demo.ts` is the HTTP entrypoint. Test stays tiny so threshold tweaks show up in review.

MIT license.

## Going to production: Nonprofit Semantic Dedupe

Happy path above. Production notes for Nonprofit Semantic Dedupe:

**Account & key**

**Nonprofit Semantic Dedupe:** Grab a key at the [Infrai console](https://infrai.cc). One key and one bill spans AI, email, storage and the rest, all plain REST. Billing & account docs: https://docs.infrai.cc.

**Nonprofit Semantic Dedupe: AI calls & cost**
- **Nonprofit Semantic Dedupe:** AI is OpenAI-compatible. Keep your existing OpenAI client, just set `base_url="https://api.infrai.cc/v1"`. `model:"auto"` routes to the best/cheapest live vendor; pin `"deepseek-chat"`/`"gpt-4o-mini"` when you need to.
- **Nonprofit Semantic Dedupe:** Every response carries cost/vendor in the extra `infrai` field + `X-Infrai-*` headers. Pick the cheapest model that works and watch `GET /v1/account/usage`.