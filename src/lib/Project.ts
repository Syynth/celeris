import { readTextFile, writeTextFile } from '@tauri-apps/plugin-fs';
import { ZodType, z } from 'zod';

const RECENT_PROJECTS = 's92.celeris.recent-projects';

export type ProjectReference = {
  project: Project;
  path: string;
};

const recentProjectsSchema = z.array(z.string());

function assetSchema<
  TAssetData extends ZodType,
  const TAssetType extends string,
>(asset: TAssetType, data: TAssetData) {
  return z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      path: z.string(),
      type: z.literal(asset),
      data,
    }),
  );
}

export const ProjectSchema = z.object({
  name: z.string(),
  settings: z.record(z.unknown()),
  assets: z.object({
    sprites: assetSchema('sprite', z.any()),
    characters: assetSchema('character', z.any()),
    machines: assetSchema('machine', z.any()),
    maps: assetSchema('map', z.any()),
    scenes: assetSchema('scene', z.any()),
  }),
});

export function listRecentProjects(): string[] {
  const recentsJson = localStorage.getItem(RECENT_PROJECTS);
  try {
    return recentProjectsSchema.parse(JSON.parse(recentsJson ?? ''));
  } catch (error) {
    return [];
  }
}

export function addRecentProject(projectName: string): void {
  let recents = listRecentProjects();
  recents.unshift(projectName);
  recents = Array.from(new Set(recents)).slice(0, 5);
  localStorage.setItem(RECENT_PROJECTS, JSON.stringify(recents));
}

export type Project = z.infer<typeof ProjectSchema>;

export function newProject(name: string): Project {
  return {
    name,
    settings: {},
    assets: {
      sprites: [],
      characters: [],
      machines: [],
      maps: [],
      scenes: [],
    },
  };
}

export async function loadProject(path: string): Promise<Project | null> {
  try {
    const projectJson = await readTextFile(path);
    const rawProject = JSON.parse(projectJson ?? '');
    return ProjectSchema.parse(rawProject);
  } catch (error) {
    console.error('Failed to load project', { error, path });
    return null;
  }
}

export async function saveProject({
  project,
  path,
}: ProjectReference): Promise<void> {
  addRecentProject(path);
  return await writeTextFile(path, JSON.stringify(project, null, 2));
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
