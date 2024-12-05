import { resolve } from '@tauri-apps/api/path';
import {
  PropsWithChildren,
  ReactElement,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { nullable } from 'zod';

import { AssetRef } from '~/lib/Assets';
import {
  Project,
  ProjectReference,
  newProject,
  saveProject,
} from '~/lib/Project';

interface CurrentProjectContextValue {
  project: ProjectReference;
  closeProject: () => Promise<void>;
  openAssets: string[];
  saveProject: () => Promise<void>;
  openAsset: (assetId: string) => void;
  closeAsset: (assetId: string) => void;
}

export const CurrentProjectContext = createContext<CurrentProjectContextValue>({
  project: { project: newProject('Default Project'), path: '' },
  closeProject: async () => {},
  saveProject: async () => {},
  openAssets: [],
  openAsset: () => {},
  closeAsset: () => {},
});

interface CurrentProjectProviderProps {
  project: ProjectReference;
  closeProject: () => Promise<void>;
}

export function CurrentProjectProvider({
  project,
  closeProject,
  children,
}: PropsWithChildren<CurrentProjectProviderProps>): ReactElement {
  const [openAssets, setOpenAssets] = useState<string[]>([]);

  const openAsset = useCallback(
    (assetId: string) => {
      if (!openAssets.includes(assetId)) {
        setOpenAssets([...openAssets, assetId]);
      }
    },
    [openAssets],
  );

  const closeAsset = useCallback(
    (assetId: string) => {
      if (openAssets.includes(assetId)) {
        setOpenAssets(openAssets.filter(id => id !== assetId));
      }
    },
    [openAssets],
  );

  const saveProject_ = useCallback(async () => {
    await saveProject(project);
  }, [project]);

  const value = useMemo(
    () => ({
      project,
      closeProject,
      saveProject: saveProject_,
      openAssets,
      openAsset,
      closeAsset,
    }),
    [project, saveProject, closeProject, openAssets, openAsset, closeAsset],
  );

  return (
    <CurrentProjectContext.Provider value={value}>
      {children}
    </CurrentProjectContext.Provider>
  );
}

export function useCurrentProjectReference(): ProjectReference {
  return useContext(CurrentProjectContext).project;
}

export function useCurrentProject(): Project {
  return useCurrentProjectReference().project;
}

export function useOpenAssetIds(): string[] {
  return useContext(CurrentProjectContext).openAssets;
}

export function useOpenAssets(): AssetRef[] {
  const project = useCurrentProject();
  const assetIds = useOpenAssetIds();

  return assetIds.map(id => project.assets[id]).filter(Boolean);
}

export function useOpenAssetControls() {
  const { openAsset, closeAsset } = useContext(CurrentProjectContext);
  return { openAsset, closeAsset };
}
