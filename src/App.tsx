import { save } from '@tauri-apps/plugin-dialog';
import { useMachine } from '@xstate/react';
import { P, match } from 'ts-pattern';
import { CurrentProjectProvider } from '~/contexts/CurrentProject';
import { ProjectBrowser } from '~/editor/components/ProjectBrowser';
import { ProjectViewFrame } from '~/editor/components/ProjectView';
import { CreateProjectSplash } from '~/editor/components/splash/CreateProject';
import { LoadingSplash } from '~/editor/components/splash/Loading';
import { RecentProjects } from '~/editor/components/splash/RecentProjects';
import { MainLayout } from '~/editor/layouts/MainLayout';
import { RootLayout } from '~/editor/layouts/RootLayout';
import { EditorSessionMachine } from '~/editor/machines/EditorSession';

import {
  importProjectAssets,
  loadProject,
  newProject,
  saveProject,
} from '~/lib/Project';

import { AssetsProvider } from './editor/contexts/Assets';

function App() {
  const [state, send] = useMachine(EditorSessionMachine);

  async function createProject(projectName: string) {
    const project = newProject(projectName);
    const path = await save({
      defaultPath: projectName,
      filters: [{ name: 'Celeris Project', extensions: ['celeris'] }],
    });
    if (path) {
      const ref = { project, path };
      await saveProject(ref);
      send({ type: 'project.load', project: ref });
    }
  }

  async function startProjectCreation() {
    send({ type: 'project.create' });
  }

  async function closeProject() {
    send({ type: 'project.unload' });
  }

  function runProject(saveFile: any) {
    send({ type: 'project.run', saveFile });
  }

  function stopProject() {
    send({ type: 'project.stop' });
  }

  async function tryLoadProject(path: string) {
    const project = await loadProject(path);
    if (project) {
      const projectRef = { project, path };
      await importProjectAssets(projectRef);
      send({ type: 'project.load', project: projectRef });
    }
  }

  return (
    <RootLayout>
      {match(state)
        .with({ value: 'recentProjectSelection' }, () => (
          <RecentProjects
            onRequestLoad={tryLoadProject}
            onRequestCreation={startProjectCreation}
          />
        ))
        .with({ value: 'projectCreation' }, () => (
          <CreateProjectSplash onCreateProject={createProject} />
        ))
        .with({ value: 'projectLoaded', context: { project: null } }, () => (
          <CreateProjectSplash onCreateProject={createProject} />
        ))
        .with(
          {
            value: 'projectLoaded',
            context: { project: P.nonNullable },
          },
          {
            value: 'projectRunning',
            context: { project: P.nonNullable },
          },
          state => (
            <CurrentProjectProvider
              project={state.context.project}
              closeProject={closeProject}
            >
              <AssetsProvider>
                <MainLayout
                  isRunning={state.value === 'projectRunning'}
                  sidebar={<ProjectBrowser />}
                  stopProject={stopProject}
                  runProject={runProject}
                >
                  <ProjectViewFrame
                    isGameRunning={state.value === 'projectRunning'}
                  />
                </MainLayout>
              </AssetsProvider>
            </CurrentProjectProvider>
          ),
        )
        .otherwise(() => (
          <LoadingSplash />
        ))}
    </RootLayout>
  );
}

export default App;
