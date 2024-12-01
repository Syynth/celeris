import { v4 } from 'uuid';
import { ZodType, z } from 'zod';

function assetSchema<TAssetData extends ZodType>(data: TAssetData) {
  return z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      path: z.string(),
      data,
    }),
  );
}

export const ProjectSchema = z.object({
  name: z.string(),
  settings: z.record(z.unknown()),
  assets: z.object({
    sprites: assetSchema(z.any()),
    characters: assetSchema(z.any()),
    machines: assetSchema(z.any()),
    maps: assetSchema(z.any()),
    scenes: assetSchema(z.any()),
  }),
});

export type Project = z.infer<typeof ProjectSchema>;

export function newProject(name: string): Project {
  return {
    name,
    settings: {},
    assets: {
      sprites: [
        {
          id: v4(),
          name: 'Sprite 1',
          path: 'sprites/1',
        },
      ],
      characters: [
        {
          id: v4(),
          name: 'Character 1',
          path: 'characters/1',
        },
      ],
      machines: [
        {
          id: v4(),
          name: 'Machine 1',
          path: 'machines/1',
        },
      ],
      maps: [
        {
          id: v4(),
          name: 'Map 1',
          path: 'maps/1',
        },
      ],
      scenes: [
        {
          id: v4(),
          name: 'Scene 1',
          path: 'scenes/1',
        },
      ],
    },
  };
}

export async function loadProject(): Promise<Project | null> {
  const projectJson = localStorage.getItem('project');
  try {
    const rawProject = JSON.parse(projectJson ?? '');
    return ProjectSchema.parse(rawProject);
  } catch (error) {
    return null;
  }
}

export async function saveProject(project: Project): Promise<void> {
  localStorage.setItem('project', JSON.stringify(project));
  return await Promise.resolve();
}

export function assetById(
  project: Project,
  assetId: string,
): { id: string; name: string; path: string } | null {
  for (const assetType of Object.values(project.assets)) {
    for (const asset of assetType) {
      if (asset.id === assetId) {
        return asset;
      }
    }
  }
  return null;
}
