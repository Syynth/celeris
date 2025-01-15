import { readTextFile, writeTextFile } from '@tauri-apps/plugin-fs';
import { z } from 'zod';

const RECENT_PROJECTS = 's92.celeris.recent-projects';

export type ProjectReference = {
  project: Project;
  path: string;
};

const recentProjectsSchema = z.array(z.string());

export const ProjectSettingsSchema = z.object({
  startingMap: z.string().nullable().default(null),
  referenceResolution: z
    .tuple([z.number().positive(), z.number().positive()])
    .default([1920, 1080]),
});

export const ProjectSchema = z.object({
  name: z.string(),
  settings: ProjectSettingsSchema.default({
    startingMap: null,
    referenceResolution: [1920, 1080],
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

export function removeRecentProject(projectName: string): void {
  let recents = listRecentProjects();
  recents = recents.filter(r => r !== projectName);
  localStorage.setItem(RECENT_PROJECTS, JSON.stringify(recents));
}

export type Project = z.infer<typeof ProjectSchema>;

export function newProject(name: string): Project {
  return {
    name,
    settings: {
      startingMap: null,
      referenceResolution: [1920, 1080],
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

export async function importProjectAssets(project: ProjectReference) {
  await saveProject(project);
}
