import { useMemo } from 'react';
import {
  StaticTreeDataProvider,
  Tree,
  UncontrolledTreeEnvironment,
} from 'react-complex-tree';
import 'react-complex-tree/lib/style-modern.css';
import { useCurrentProject } from '~/contexts/CurrentProject';

import { ProjectTreeDataProvider } from './ProjectTreeDataProvider';
import { longTree } from './testData';

interface ProjectBrowserProps {}

export function ProjectBrowser(_: ProjectBrowserProps) {
  const project = useCurrentProject();
  const dataProvider = useMemo(
    // () => new ProjectTreeDataProvider(project),
    () =>
      new StaticTreeDataProvider(longTree.items, (item, data) => ({
        ...item,
        data,
      })),
    [project],
  );

  return (
    <div className="min-w-48">
      <h1>Project Browser</h1>
      <UncontrolledTreeEnvironment
        dataProvider={dataProvider}
        getItemTitle={item => item.data}
        canDragAndDrop={true}
        canReorderItems={true}
        canDropOnFolder={true}
        canDropOnNonFolder={true}
        viewState={{}}
      >
        <Tree treeId="tree-1" rootItem="root" treeLabel="Tree Example" />
      </UncontrolledTreeEnvironment>
    </div>
  );
}
