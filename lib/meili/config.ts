import { Meilisearch } from "meilisearch";

export const meili = new Meilisearch({
    host: process.env.MEILI_HOST!,
    apiKey: process.env.MEILI_MASTER_KEY!,
});