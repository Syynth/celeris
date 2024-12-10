import { z } from 'zod';

export const ProjectSettingsSchema = z
  .object({
    defaultScene: z.string().optional(),
    gameWidth: z.number().int().positive(),
    gameHeight: z.number().int().positive(),
  })
  .and(z.record(z.string(), z.unknown()));

export type ProjectSettings = z.infer<typeof ProjectSettingsSchema>;
