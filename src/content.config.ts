import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const cities = defineCollection({
  loader: glob({ pattern: '**/*.yaml', base: './src/data/cities' }),
  schema: z.object({
    name: z.string(),
    nameZh: z.string(),
    country: z.string(),
    countryZh: z.string(),
    lat: z.number(),
    lng: z.number(),
    markerColor: z.string().default('#F59E0B'),
    visitDate: z.string(),
    diary: z.object({
      en: z.string(),
      zh: z.string(),
    }),
    mood: z.array(z.string()),
    topPicks: z.array(z.object({
      name: z.string(),
      icon: z.string(),
    })),
    photos: z.array(z.object({
      color: z.string(),
      label: z.string(),
    })),
  }),
});

export const collections = { cities };
