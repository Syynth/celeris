import { z } from 'zod';

export const AssetTypeSchema = z.enum([
  'sprite',
  'spritesheet',
  'ink',
  'map',
  'machine',
]);
export type AssetType = z.infer<typeof AssetTypeSchema>;

export const AssetMetadataSchema = z.record(z.unknown());

export type AssetMetadata = z.infer<typeof AssetMetadataSchema>;

export const AssetDataSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  type: AssetTypeSchema,
  version: z.number().int().positive(),
  created: z.number().int().positive(),
  modified: z.number().int().positive(),
  metadata: AssetMetadataSchema,
  path: z.string(),
});
export type AssetData = z.infer<typeof AssetDataSchema>;
