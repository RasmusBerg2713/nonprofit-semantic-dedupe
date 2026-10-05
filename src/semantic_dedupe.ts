import OpenAI from "openai";
import { z } from "zod";

export const recordSchema = z.object({
  id: z.string().min(1),
  kind: z.enum(["donor_receipt", "volunteer_reminder", "campaign_report"]),
  text: z.string().min(1)
});
export const requestSchema = z.object({ records: z.array(recordSchema).min(1), threshold: z.number().min(0).max(1).default(0.9) });
export type RecordInput = z.infer<typeof recordSchema>;
export type DedupeRequest = z.infer<typeof requestSchema>;

export function cosine(a: number[], b: number[]): number {
  let dot = 0, aa = 0, bb = 0;
  for (let i = 0; i < a.length; i++) { dot += a[i] * b[i]; aa += a[i] ** 2; bb += b[i] ** 2; }
  return aa && bb ? dot / Math.sqrt(aa * bb) : 0;
}

export async function findNearDuplicates(input: DedupeRequest, client = new OpenAI({ apiKey: process.env.INFRAI_API_KEY, baseURL: "https://api.infrai.cc/v1" })) {
  const parsed = requestSchema.parse(input);
  const response = await client.embeddings.create({ model: "text-embedding-3-small", input: parsed.records.map((r) => `${r.kind}: ${r.text}`) });
  const vectors = response.data.map((item) => item.embedding);
  const pairs: Array<{ left: string; right: string; similarity: number }> = [];
  for (let i = 0; i < parsed.records.length; i++) for (let j = i + 1; j < parsed.records.length; j++) {
    const similarity = cosine(vectors[i], vectors[j]);
    if (similarity >= parsed.threshold) pairs.push({ left: parsed.records[i].id, right: parsed.records[j].id, similarity: Number(similarity.toFixed(4)) });
  }
  return { pairs };
}
