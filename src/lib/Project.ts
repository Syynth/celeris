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
          id: '1',
          name: 'Sprite 1',
          path: 'sprites/1',
        },
      ],
      characters: [
        {
          id: '1',
          name: 'Character 1',
          path: 'characters/1',
        },
      ],
      machines: [
        {
          id: '1',
          name: 'Machine 1',
          path: 'machines/1',
        },
      ],
      maps: [
        {
          id: '1',
          name: 'Map 1',
          path: 'maps/1',
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
