import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const work = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/work' }),
  schema: z.object({
    title: z.string(),
    tagline: z.string(),
    order: z.number(),
    cover: z.string(),
    coverAlt: z.string().default(''),
    accent: z.string().default('#FF6816'),
    accentInk: z.string().default('#ffffff'),
    role: z.string().optional(),
    year: z.string().optional(),
    team: z.string().optional(),
    platform: z.string().optional(),
    summary: z.string().optional(),
  }),
});

export const collections = { work };
