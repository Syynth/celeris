import { resolve } from '@tauri-apps/api/path';
import { DirEntry, readDir, writeTextFile } from '@tauri-apps/plugin-fs';
import { v4 } from 'uuid';
import { z } from 'zod';

import { ProjectReference } from './Project';

export const ASSET_EXTENSIONS = ['png', 'spritesheet.json', 'ink'] as const;
export const ASSET_IMPORTERS = {
  [ASSET_EXTENSIONS[0]]: importSprite,
  [ASSET_EXTENSIONS[1]]: importSpriteSheet,
  [ASSET_EXTENSIONS[2]]: importInk,
} as const;

export const AssetRefSchema = z.object({
  id: z.string(),
  name: z.string().default('Asset Name'),
  assetType: z.enum(['sprite', 'spritesheet', 'ink', 'map']),
  lastKnownPath: z.string(),
});

export type AssetRef = z.infer<typeof AssetRefSchema>;
export type AssetMap = Record<string, AssetRef>;

export async function getProjectDirectory({
  path,
}: ProjectReference): Promise<string> {
  return await resolve(path, '..');
}

interface FullyQualifiedDirEntry extends DirEntry {
  parentDir: string;
  fullPath: string;
}

/**
 * Returns all files in a directory and its subdirectories, excluding hidden files/directories.
 * In this context, 'hidden' means the file/directory name starts with a period.
 * @param dirPath Directory
 * @returns Array of file info objects
 */
export async function recursiveFindAllFiles(
  dirPath: string,
): Promise<FullyQualifiedDirEntry[]> {
  const entries = await readDir(dirPath);
  const files: FullyQualifiedDirEntry[] = [];
  for (const entry of entries.filter(e => !e.name.startsWith('.'))) {
    if (entry.isFile) {
      files.push({
        ...entry,
        parentDir: dirPath,
        fullPath: await resolve(dirPath, entry.name),
      });
    } else if (entry.isDirectory) {
      files.push(
        ...(await recursiveFindAllFiles(await resolve(dirPath, entry.name))),
      );
    }
  }
  return files;
}

export async function recursivelyFindAllAssets(
  project: ProjectReference,
): Promise<{
  imported: FullyQualifiedDirEntry[];
  unimported: FullyQualifiedDirEntry[];
}> {
  const projectDir = await getProjectDirectory(project);
  const files = await recursiveFindAllFiles(projectDir);
  const assetCandidates = files.filter(f =>
    ASSET_EXTENSIONS.some(ext => f.name.endsWith(ext)),
  );
  const metaFiles = files.filter(f => f.name.endsWith('.meta'));

  const imported: FullyQualifiedDirEntry[] = [];
  const unimported: FullyQualifiedDirEntry[] = [];

  for (const asset of assetCandidates) {
    const meta = metaFiles.find(
      m => m.parentDir === asset.parentDir && m.name === `${asset.name}.meta`,
    );
    if (meta) {
      imported.push(asset);
    } else {
      unimported.push(asset);
    }
  }

  return {
    imported,
    unimported,
  };
}

export async function importAsset(
  projectRef: ProjectReference,
  entry: FullyQualifiedDirEntry,
): Promise<AssetRef | null> {
  for (const extension of ASSET_EXTENSIONS) {
    if (entry.name.endsWith(extension)) {
      return await ASSET_IMPORTERS[extension](projectRef, entry);
    }
  }
  return null;
}

async function getLastKnownPath(
  projectRef: ProjectReference,
  entry: FullyQualifiedDirEntry,
): Promise<[string, string]> {
  const lastKnownPath = await resolve(entry.parentDir, entry.name);
  const projectDir = await resolve(projectRef.path, '..');
  return [projectDir, lastKnownPath.replace(projectDir, '').slice(1)];
}

async function importSprite(
  projectRef: ProjectReference,
  entry: FullyQualifiedDirEntry,
): Promise<AssetRef> {
  const [projectDir, lastKnownPath] = await getLastKnownPath(projectRef, entry);

  const assetRef: AssetRef = {
    id: v4(),
    name: entry.name,
    assetType: 'sprite',
    lastKnownPath,
  };

  console.log('importing sprite', { projectDir, lastKnownPath, assetRef });

  await writeTextFile(
    await resolve(projectDir, lastKnownPath + '.meta'),
    JSON.stringify(assetRef, null, 2),
  );

  return assetRef;
}

async function importSpriteSheet(
  projectRef: ProjectReference,
  entry: FullyQualifiedDirEntry,
): Promise<AssetRef> {
  const [projectDir, lastKnownPath] = await getLastKnownPath(projectRef, entry);

  const assetRef: AssetRef = {
    id: v4(),
    name: entry.name,
    assetType: 'spritesheet',
    lastKnownPath,
  };

  await writeTextFile(
    await resolve(projectDir, lastKnownPath + '.meta'),
    JSON.stringify(assetRef, null, 2),
  );

  return assetRef;
}

async function importInk(
  projectRef: ProjectReference,
  entry: FullyQualifiedDirEntry,
): Promise<AssetRef> {
  const [projectDir, lastKnownPath] = await getLastKnownPath(projectRef, entry);

  const assetRef: AssetRef = {
    id: v4(),
    name: entry.name,
    assetType: 'ink',
    lastKnownPath,
  };

  await writeTextFile(
    await resolve(projectDir, lastKnownPath + '.meta'),
    JSON.stringify(assetRef, null, 2),
  );

  return assetRef;
}
