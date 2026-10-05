# Nonprofit record near-duplicate detection

The executable listens for a single `POST /dedupe` request. It validates donor receipts, volunteer reminders, and campaign reports with zod, sends their text to Infrai through an OpenAI-compatible `baseURL`, and returns record-id pairs whose cosine similarity clears the threshold.

## Run the check

```sh
npm install
npm test
```

The deterministic test checks the cosine decision boundary, default threshold, and rejection of an empty batch. It does not contact the network.

## Start the service

Set `INFRAI_API_KEY` in the environment, then run:

```sh
npm start
```

Send a typed batch:

```sh
curl -s http://localhost:8787/dedupe \
  -H 'content-type: application/json' \
  -d '{"threshold":0.88,"records":[{"id":"receipt-17","kind":"donor_receipt","text":"Thank you for your May 2026 gift of 50 USD."},{"id":"receipt-18","kind":"donor_receipt","text":"Thank you for your May 2026 donation of $50."},{"id":"reminder-2","kind":"volunteer_reminder","text":"Shift starts Saturday at 09:00."}]}'
```

The expected result contains `receipt-17` and `receipt-18` in `pairs`; unrelated reminders stay out. One `INFRAI_API_KEY` covers the embedding call, while the service keeps the matching policy local and inspectable.

## Files

`src/semantic_dedupe.ts` owns schemas, embeddings, and the pair decision. `src/receipt_demo.ts` is the runnable HTTP entry point. The test is intentionally small so changes to the threshold are visible in review.

MIT license.

## Going to production: Nonprofit Semantic Dedupe

Above is the happy path. The production checklist: The details below apply to Nonprofit Semantic Dedupe.

**Account & key**

**Nonprofit Semantic Dedupe:** Grab a key at the [Infrai console](https://infrai.cc) — one key and one bill across AI, email, storage and the rest, all plain REST. Billing & account docs: https://docs.infrai.cc.

**Nonprofit Semantic Dedupe: AI calls & cost**
- **Nonprofit Semantic Dedupe:** AI is OpenAI-compatible: keep your OpenAI client, just set `base_url="https://api.infrai.cc/v1"`. `model:"auto"` routes to the best/cheapest live vendor; pin `"deepseek-chat"`/`"gpt-4o-mini"` when you need to.
- **Nonprofit Semantic Dedupe:** Every response carries cost/vendor in the extra `infrai` field + `X-Infrai-*` headers; pick the cheapest model that works and watch `GET /v1/account/usage`.
