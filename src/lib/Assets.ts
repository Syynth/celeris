import { resolve, sep } from '@tauri-apps/api/path';
import {
  DirEntry,
  readDir,
  readTextFile,
  rename,
  writeTextFile,
} from '@tauri-apps/plugin-fs';
import { z } from 'zod';

import { ProjectReference, saveProject } from './Project';

export const ASSET_EXTENSIONS = [
  'png',
  'spritesheet.json',
  'ink',
  'machine',
  'celeris',
] as const;

export const ASSET_IMPORTERS = {
  [ASSET_EXTENSIONS[0]]: { importer: importSprite, assetType: 'sprite' },
  [ASSET_EXTENSIONS[1]]: {
    importer: importSpriteSheet,
    assetType: 'spritesheet',
  },
  [ASSET_EXTENSIONS[2]]: { importer: importInk, assetType: 'ink' },
  [ASSET_EXTENSIONS[3]]: { importer: importMachine, assetType: 'machine' },
  [ASSET_EXTENSIONS[4]]: { importer: importMachine, assetType: 'project' },
} as const;

export const AssetRefSchema = z.object({
  name: z.string().default('Asset Name'),
  assetType: z.enum([
    'sprite',
    'spritesheet',
    'ink',
    'map',
    'machine',
    'project',
  ]),
  lastKnownPath: z.string(),
});

export type AssetRef = z.infer<typeof AssetRefSchema>;

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
      return await ASSET_IMPORTERS[extension].importer(projectRef, entry);
    }
  }
  return null;
}

async function getLastKnownPath(
  projectRef: ProjectReference,
  parentDir: string,
  fileName: string,
): Promise<[string, string]> {
  const [lastKnownPath, projectDir] = await Promise.all([
    resolve(parentDir, fileName),
    resolve(projectRef.path),
  ]);
  // TODO: Normalize path correctly across Windows/MacOS
  return [projectDir, lastKnownPath.replace(projectDir, '').slice(1)];
}

export function getAssetType(assetPath: string) {
  for (const extension of ASSET_EXTENSIONS) {
    if (assetPath.endsWith(extension)) {
      return ASSET_IMPORTERS[extension].assetType;
    }
  }
  return 'map';
}

export function getAssetRef(assetPath: string): AssetRef {
  return {
    name: assetPath.split(sep()).pop() ?? 'Asset Name',
    assetType: getAssetType(assetPath),
    lastKnownPath: assetPath,
  };
}

export async function renameAsset(
  projectRef: ProjectReference,
  asset: AssetRef,
  newName: string,
) {
  const projectDir = await getProjectDirectory(projectRef);

  const [assetPath, assetDir, oldMeta] = await Promise.all([
    resolve(projectDir, asset.lastKnownPath),
    resolve(projectDir, asset.lastKnownPath, '..'),
    resolve(projectDir, asset.lastKnownPath + '.meta'),
  ]);

  const [newPath, newMeta] = await Promise.all([
    resolve(assetDir, newName),
    resolve(assetDir, newName + '.meta'),
  ]);

  await Promise.all([rename(assetPath, newPath), rename(oldMeta, newMeta)]);

  const [, lastKnownPath] = await getLastKnownPath(
    projectRef,
    assetDir,
    newName,
  );

  await readTextFile(newMeta).then(async metaJson => {
    const meta = JSON.parse(metaJson);
    meta.name = newName;
    meta.lastKnownPath = lastKnownPath;
    const json = JSON.stringify(meta, null, 2);
    await writeTextFile(newMeta, json);
    return json;
  });

  asset.lastKnownPath = lastKnownPath;
  asset.name = newName;
  await saveProject(projectRef);
  return lastKnownPath;
}

async function importSprite(
  projectRef: ProjectReference,
  entry: FullyQualifiedDirEntry,
): Promise<AssetRef> {
  const [projectDir, lastKnownPath] = await getLastKnownPath(
    projectRef,
    entry.parentDir,
    entry.name,
  );

  const assetRef: AssetRef = {
    name: entry.name,
    assetType: 'sprite',
    lastKnownPath,
  };

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
  const [projectDir, lastKnownPath] = await getLastKnownPath(
    projectRef,
    entry.parentDir,
    entry.name,
  );

  const assetRef: AssetRef = {
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
  const [projectDir, lastKnownPath] = await getLastKnownPath(
    projectRef,
    entry.parentDir,
    entry.name,
  );

  const assetRef: AssetRef = {
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

async function importMachine(
  projectRef: ProjectReference,
  entry: FullyQualifiedDirEntry,
): Promise<AssetRef> {
  const [projectDir, lastKnownPath] = await getLastKnownPath(
    projectRef,
    entry.parentDir,
    entry.name,
  );

  const assetRef: AssetRef = {
    name: entry.name,
    assetType: 'machine',
    lastKnownPath,
  };

  await writeTextFile(
    await resolve(projectDir, lastKnownPath + '.meta'),
    JSON.stringify(assetRef, null, 2),
  );

  return assetRef;
}
