import {
  PropsWithChildren,
  ReactElement,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

import { Project, assetById, newProject } from '~/lib/Project';

interface CurrentProjectContextValue {
  project: Project;
  closeProject: () => Promise<void>;
  openAssets: string[];
  openAsset: (assetId: string) => void;
  closeAsset: (assetId: string) => void;
}

export const CurrentProjectContext = createContext<CurrentProjectContextValue>({
  project: newProject('Default Project'),
  closeProject: async () => {},
  openAssets: [],
  openAsset: () => {},
  closeAsset: () => {},
});

interface CurrentProjectProviderProps {
  project: Project;
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

  const value = useMemo(
    () => ({
      project,
      closeProject,
      openAssets,
      openAsset,
      closeAsset,
    }),
    [project, closeProject, openAssets, openAsset, closeAsset],
  );

  return (
    <CurrentProjectContext.Provider value={value}>
      {children}
    </CurrentProjectContext.Provider>
  );
}

export function useCurrentProject(): Project {
  return useContext(CurrentProjectContext).project;
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
