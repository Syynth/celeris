import { invoke } from '@tauri-apps/api/core';
import { resolve } from '@tauri-apps/api/path';
import { readTextFile, writeTextFile } from '@tauri-apps/plugin-fs';
import { z } from 'zod';

import {
  AssetRef,
  AssetRefSchema,
  importAsset,
  recursivelyFindAllAssets,
} from './Assets';

const RECENT_PROJECTS = 's92.celeris.recent-projects';

export type ProjectReference = {
  project: Project;
  path: string;
};

const recentProjectsSchema = z.array(z.string());

export const ProjectSchema = z.object({
  name: z.string(),
  settings: z.record(z.unknown()),
  assets: z.record(z.string(), AssetRefSchema),
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
    assets: {},
  };
}

export async function loadProject(path: string): Promise<Project | null> {
  try {
    await invoke('stop_server', {});
    await invoke('start_server', { path: await resolve(path, '..') });
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
  const { imported, unimported } = await recursivelyFindAllAssets(project);

  const newAssetRefs: AssetRef[] = [];
  for (const asset of unimported) {
    const ref = await importAsset(project, asset);
    if (ref) {
      newAssetRefs.push(ref);
    }
  }
  const knownMetaFiles: AssetRef[] = (
    await Promise.all(
      imported.map(i =>
        readTextFile(i.fullPath + '.meta').then(text => [text, i.fullPath]),
      ),
    )
  ).map(
    ([text, lastKnownPath]) =>
      ({ ...JSON.parse(text), lastKnownPath }) as AssetRef,
  );

  project.project.assets = Object.fromEntries(
    newAssetRefs.concat(knownMetaFiles).map(m => [m.id, m]),
  );
  await saveProject(project);
}
