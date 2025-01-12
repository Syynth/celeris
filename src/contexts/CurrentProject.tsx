import { DOMAdapter } from 'pixi.js';
import {
  PropsWithChildren,
  ReactElement,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
} from 'react';

import {
  Project,
  ProjectReference,
  newProject,
  saveProject,
} from '~/lib/Project';
import { TauriAdapter } from '~/lib/TauriAdapter';

interface CurrentProjectContextValue {
  project: ProjectReference;
  closeProject: () => Promise<void>;
  saveProject: () => Promise<void>;
}

export const CurrentProjectContext = createContext<CurrentProjectContextValue>({
  project: { project: newProject('Default Project'), path: '' },
  closeProject: async () => {},
  saveProject: async () => {},
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
  const saveProject_ = useCallback(async () => {
    await saveProject(project);
  }, [project]);

  const value = useMemo(
    () => ({
      project,
      closeProject,
      saveProject: saveProject_,
    }),
    [project, saveProject_, closeProject],
  );

  useEffect(() => {
    const adapter = DOMAdapter.get();
    if (adapter instanceof TauriAdapter) {
      adapter.project = project;
    }
  }, [value.project]);

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

export function useSaveCurrentProject(): CurrentProjectContextValue['saveProject'] {
  return useContext(CurrentProjectContext).saveProject;
}
