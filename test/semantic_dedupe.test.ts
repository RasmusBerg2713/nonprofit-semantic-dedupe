import assert from "node:assert/strict";
import { cosine, requestSchema } from "../src/semantic_dedupe.js";

assert.equal(cosine([1, 0], [1, 0]), 1);
const parsed = requestSchema.parse({ records: [{ id: "r1", kind: "donor_receipt", text: "Receipt for May donation" }] });
assert.equal(parsed.threshold, 0.9);
assert.throws(() => requestSchema.parse({ records: [] }));
console.log("semantic decision boundary: pass");
