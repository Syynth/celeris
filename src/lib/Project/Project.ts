import { basename, dirname, resolve } from '@tauri-apps/api/path';
import { save } from '@tauri-apps/plugin-dialog';
import { UnwatchFn, readTextFile, writeTextFile } from '@tauri-apps/plugin-fs';
import { WatchEvent, rename, watch } from '@tauri-apps/plugin-fs';
import { EventEmitter } from 'eventemitter3';
import { v4 as uuid } from 'uuid';

import { AssetData, AssetType } from './AssetData';
import { ModificationState } from './ModificationState';
import {
  CURRENT_SCHEMA_VERSION,
  ProjectData,
  ProjectDataSchema,
  migrateProject,
} from './ProjectData';
import { ProjectInbox } from './ProjectInbox';
import { ProjectLibrary } from './ProjectLibrary';
import { ProjectSettings } from './ProjectSettings';

type ProjectEventMap = {
  'asset:created': [payload: { assetId: string }];
  'asset:modified': [payload: { assetId: string; changes: Partial<AssetData> }];
  'asset:deleted': [payload: { assetId: string }];
  'asset:moved': [payload: { assetId: string; virtualPath: string[] }];
  'settings:changed': [payload: { changes: Partial<ProjectSettings> }];
  'project:saved': [payload: {}];
  'project:save-failed': [payload: { error: unknown }];
  watchError: [payload: { error: unknown }];
};

interface ProjectConstructorParams {
  projectData: ProjectData;
  projectDir: string;
  path: string;
  inbox: ProjectInbox;
  library: ProjectLibrary;
}

// Project class implementation
export class Project {
  private path: string;
  private data: ProjectData;
  private projectDir: string;

  private inbox: ProjectInbox;
  private library: ProjectLibrary;
  private modifications = new Map<string, ModificationState>();
  private events = new EventEmitter<ProjectEventMap>();

  static async load(path: string): Promise<Project> {
    const rawData = await readProjectFile(path);
    const data = migrateProject(rawData);
    return Project.constuctWithWatchers(data, path);
  }

  static async createFromUserSelection(name: string): Promise<Project | null> {
    const data: ProjectData = {
      schemaVersion: CURRENT_SCHEMA_VERSION,
      name,
      settings: {
        gameWidth: 1280,
        gameHeight: 720,
      },
      library: {
        assets: {},
        structure: {
          type: 'folder',
          id: 'library',
          displayName: 'Library',
          children: [
            {
              type: 'folder',
              id: uuid(),
              displayName: 'Sprites',
              children: [
                {
                  type: 'folder',
                  id: uuid(),
                  displayName: 'Characters',
                  children: [],
                },
              ],
            },
            {
              type: 'folder',
              id: uuid(),
              displayName: 'Animations',
              children: [],
            },
            {
              type: 'folder',
              id: uuid(),
              displayName: 'Ink',
              children: [],
            },
            {
              type: 'folder',
              id: uuid(),
              displayName: 'Machines',
              children: [],
            },
          ],
        },
      },
    };
    const path = await save({
      defaultPath: name,
      filters: [{ name: 'Celeris Project', extensions: ['celeris'] }],
    });

    if (!path) return null;

    return await Project.constuctWithWatchers(data, path);
  }

  private static async constuctWithWatchers(
    projectData: ProjectData,
    path: string,
  ) {
    const [projectDir, inboxDir, libraryDir] = await Promise.all([
      resolve(path, '..'),
      resolve(path, 'inbox'),
      resolve(path, 'library'),
    ]);

    return new Project({
      projectData,
      projectDir,
      path,
      inbox: ProjectInbox.fromPath(projectData, inboxDir),
      library: ProjectLibrary.fromData(projectData, libraryDir),
    });
  }

  private constructor({
    projectData,
    projectDir,
    path,
    inbox,
    library,
  }: ProjectConstructorParams) {
    this.path = path;
    this.data = projectData;
    this.projectDir = projectDir;

    ProjectDataSchema.parse(projectData);
    this.inbox = inbox;
    this.library = library;

    this.inbox.constructInboxDirectories();
  }

  get name(): string {
    return this.data.name;
  }

  get projectDirectory(): string {
    return this.projectDir;
  }

  get settings(): ProjectSettings {
    return this.data.settings;
  }

  hasUnsavedChanges(): boolean {
    return this.modifications.size > 0;
  }

  on<K extends keyof ProjectEventMap>(
    event: K,
    handler: (...args: ProjectEventMap[K]) => void,
  ): () => void {
    this.events.on(event, handler);
    return () => this.events.off(event, handler);
  }

  // When emitting events:
  private emitEvent<K extends keyof ProjectEventMap>(
    event: K,
    payload: ProjectEventMap[K],
  ): void {
    // @ts-expect-error ?? TODO: Figure this out
    this.events.emit(event, payload);
  }

  private addModification(state: ModificationState): void {
    const key = `${state.entityType}:${state.entityId}`;
    this.modifications.set(key, state);
  }

  private async generateAssetPath(fileName: string): Promise<string> {
    // Implement path generation logic
    return fileName;
  }

  private async determineAssetType(path: string): Promise<AssetType> {
    // Implement asset type detection logic
    const ext = path.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'png':
        return 'sprite';
      case 'json':
        return 'spritesheet';
      case 'ink':
        return 'ink';
      case 'machine':
        return 'machine';
      default:
        throw new Error(`Unknown asset type for extension: ${ext}`);
    }
  }

  // Asset management
  async importAsset(path: string): Promise<string> {
    const assetId = uuid();
    const fileName = await basename(path);
    const asset: AssetData = {
      id: assetId,
      name: fileName,
      type: await this.determineAssetType(path),
      version: 1,
      created: Date.now(),
      modified: Date.now(),
      metadata: {},
      path: await this.generateAssetPath(fileName),
    };

    // Copy file to inbox
    const targetPath = await resolve(this.projectDir, 'inbox', fileName);
    await rename(path, targetPath);

    // Create metadata file
    await writeTextFile(targetPath + '.meta', JSON.stringify(asset, null, 2));

    this.addModification({
      type: 'create',
      entityType: 'asset',
      entityId: assetId,
      changes: asset,
    });

    this.events.emit('asset:created', { assetId });
    return assetId;
  }

  // Helper to ensure data is always valid
  private validateData(): void {
    ProjectDataSchema.parse(this.data);
  }

  async save(): Promise<void> {
    if (!this.path) throw new Error('Project has no path');

    // Validate before saving
    this.validateData();

    await writeProjectFile(this.path, this.data);
  }

  // Example method showing data modification with validation
  async updateSettings(settings: Partial<ProjectSettings>): Promise<void> {
    this.data.settings = {
      ...this.data.settings,
      ...settings,
    };

    // Validate after modification
    this.validateData();
  }
}

// Helper functions
async function readProjectFile(path: string): Promise<unknown> {
  const content = await readTextFile(path);
  return JSON.parse(content);
}

async function writeProjectFile(
  path: string,
  data: ProjectData,
): Promise<void> {
  await writeTextFile(path, JSON.stringify(data, null, 2));
}
