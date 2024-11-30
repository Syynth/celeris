import { useMachine } from '@xstate/react';
import { useEffect } from 'react';
import { P, match } from 'ts-pattern';
import { CurrentProjectProvider } from '~/contexts/CurrentProject';
import { MainLayout } from '~/layouts/MainLayout';
import { RootLayout } from '~/layouts/RootLayout';
import { EditorSessionMachine } from '~/machines/EditorSession';

import { loadProject, newProject, saveProject } from '~/lib/Project';

import { CreateProjectSplash } from '~/components/splash/CreateProject';
import { LoadingSplash } from '~/components/splash/Loading';

import { ProjectBrowser } from './components/ProjectBrowser';

function App() {
  const [state, send] = useMachine(EditorSessionMachine);

  useEffect(() => {
    loadProject().then(project => {
      if (project) {
        send({ type: 'project.load', project });
      } else {
        send({ type: 'project.not-found' });
      }
    });
  }, []);

  async function createProject(projectName: string) {
    const project = newProject(projectName);
    await saveProject(project);
    send({ type: 'project.load', project });
  }

  async function closeProject() {
    send({ type: 'project.unload' });
  }

  return (
    <RootLayout>
      {match(state)
        .with({ value: 'startup' }, () => <LoadingSplash />)
        .with({ value: 'noProject' }, () => (
          <CreateProjectSplash onCreateProject={createProject} />
        ))
        .with({ value: 'projectLoaded', context: { project: null } }, () => (
          <CreateProjectSplash onCreateProject={createProject} />
        ))
        .with(
          { value: 'projectLoaded', context: { project: P.nonNullable } },
          state => (
            <CurrentProjectProvider
              project={state.context.project}
              closeProject={closeProject}
            >
              <MainLayout sidebar={<ProjectBrowser />}>
                <p>Project Loaded</p>
                <button onClick={closeProject}>close</button>
              </MainLayout>
            </CurrentProjectProvider>
          ),
        )
        .exhaustive()}
    </RootLayout>
  );
}

export default App;
