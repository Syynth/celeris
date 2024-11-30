import {
  PropsWithChildren,
  ReactElement,
  createContext,
  useContext,
  useMemo,
} from 'react';

import { Project } from '~/lib/Project';

interface CurrentProjectContextValue {
  project: Project;
  closeProject: () => Promise<void>;
}

export const CurrentProjectContext = createContext<CurrentProjectContextValue>({
  project: {
    name: 'Default Project',
    settings: {},
    assets: {},
  },
  closeProject: async () => {},
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
  const value = useMemo(
    () => ({
      project,
      closeProject,
    }),
    [project, closeProject],
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
