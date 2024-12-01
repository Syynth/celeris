import { z } from 'zod';

export const SaveFileSchema = z.object({
  index: z.number(),
  data: z.any(),
});

export type SaveFile = z.infer<typeof SaveFileSchema>;
