import {
  PropsWithChildren,
  ReactElement,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

import {
  Project,
  ProjectReference,
  assetById,
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

export function useCurrentProject(): Project {
  return useContext(CurrentProjectContext).project.project;
}

export function useOpenAssetIds(): string[] {
  return useContext(CurrentProjectContext).openAssets;
}

export function useOpenAssets(): { id: string; name: string }[] {
  const project = useCurrentProject();
  const openAssets = useOpenAssetIds()
    .map(assetId => assetById(project, assetId))
    .filter(asset => asset !== null) as {
    id: string;
    name: string;
  }[];

  return openAssets;
}

export function useOpenAssetControls() {
  const { openAsset, closeAsset } = useContext(CurrentProjectContext);
  return { openAsset, closeAsset };
}
