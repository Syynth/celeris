import { save } from '@tauri-apps/plugin-dialog';
import { useMachine } from '@xstate/react';
import { P, match } from 'ts-pattern';
import { CurrentProjectProvider } from '~/contexts/CurrentProject';
import { MainLayout } from '~/layouts/MainLayout';
import { RootLayout } from '~/layouts/RootLayout';
import { EditorSessionMachine } from '~/machines/EditorSession';

import { loadProject, newProject, saveProject } from '~/lib/Project';

import { CreateProjectSplash } from '~/components/splash/CreateProject';
import { LoadingSplash } from '~/components/splash/Loading';

import { ProjectBrowser } from './components/ProjectBrowser';
import { ProjectViewFrame } from './components/ProjectView';
import { RecentProjects } from './components/splash/RecentProjects';

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
      send({ type: 'project.load', project: { path, project } });
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
