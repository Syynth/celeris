import { useMemo } from 'react';
import { Tree, UncontrolledTreeEnvironment } from 'react-complex-tree';
import 'react-complex-tree/lib/style-modern.css';
import { useCurrentProject } from '~/contexts/CurrentProject';

import { ProjectTreeDataProvider } from './ProjectTreeDataProvider';

interface ProjectBrowserProps {}

export function ProjectBrowser(_: ProjectBrowserProps) {
  const project = useCurrentProject();
  const dataProvider = useMemo(
    () => new ProjectTreeDataProvider(project),
    [project],
  );

  return (
    <div className="project-browser min-w-48">
      <h1>Project Browser</h1>
      <UncontrolledTreeEnvironment
        dataProvider={dataProvider}
        getItemTitle={item => item.data.name}
        canDragAndDrop
        canReorderItems
        canDropOnFolder
        canDropOnNonFolder={false}
        viewState={{}}
      >
        <Tree treeId="tree-1" rootItem="root" treeLabel="Tree Example" />
      </UncontrolledTreeEnvironment>
    </div>
  );
}
