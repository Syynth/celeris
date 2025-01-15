// import { readTextFile } from '@tauri-apps/plugin-fs';
import { z } from 'zod';

export const MapSchema = z.object({
  world: z.string().default('hub'),
  name: z.string().default('New Map'),
});

export type Map = z.infer<typeof MapSchema>;
