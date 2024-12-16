import { z } from 'zod';

import { AssetDataSchema } from './AssetData';
import { ProjectSettingsSchema } from './ProjectSettings';

export const CURRENT_SCHEMA_VERSION = 1;

export const VirtualFolderStructureSchema: z.ZodType<VirtualFolderStructure> =
  z.lazy(() =>
    z.discriminatedUnion('type', [
      z.object({
        id: z.string(),
        type: z.literal('folder'),
        displayName: z.string(),
        children: z.array(VirtualFolderStructureSchema),
      }),
      z.object({
        type: z.literal('asset'),
        displayName: z.string(),
        assetId: z.string().uuid(),
      }),
    ]),
  );
export type VirtualFolderStructure =
  | {
      type: 'folder';
      id: string;
      displayName: string;
      children: VirtualFolderStructure[];
    }
  | {
      type: 'asset';
      displayName: string;
      assetId: string;
    };

export const ProjectDataSchema = z.object({
  schemaVersion: z.literal(CURRENT_SCHEMA_VERSION),
  name: z.string(),
  settings: ProjectSettingsSchema,
  library: z.object({
    assets: z.record(z.string(), AssetDataSchema),
    structure: VirtualFolderStructureSchema,
  }),
});

export type ProjectData = z.infer<typeof ProjectDataSchema>;

// Schema versions for migration
const ProjectDataV0Schema = z.object({
  schemaVersion: z.literal(0),
  name: z.string(),
  settings: z.record(z.unknown()),
  assets: z.record(z.string(), AssetDataSchema.omit({ version: true })),
});

// Migration functions
export function migrateProject(data: unknown): ProjectData {
  // Try to parse as raw unknown first
  const rawProject = z
    .object({
      schemaVersion: z.number().optional(),
    })
    .parse(data);

  // Determine version and migrate
  const version = rawProject.schemaVersion ?? 0;

  switch (version) {
    case 0:
      return migrateFromV0(ProjectDataV0Schema.parse(data));
    case CURRENT_SCHEMA_VERSION:
      return ProjectDataSchema.parse(data);
    default:
      throw new Error(`Unknown schema version: ${version}`);
  }
}

function migrateFromV0(v0: z.infer<typeof ProjectDataV0Schema>): ProjectData {
  // Migrate from v0 to v1
  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    name: v0.name,
    settings: {
      gameWidth: 800,
      gameHeight: 600,
      ...v0.settings,
    },
    library: {
      assets: Object.fromEntries(
        Object.entries(v0.assets).map(([id, asset]) => [
          id,
          {
            ...asset,
            version: 1,
          },
        ]),
      ),
      structure: {
        id: 'library',
        displayName: 'Library',
        type: 'folder',
        children: [],
      }, // Empty structure, assets will need to be reorganized
    },
  };
}
