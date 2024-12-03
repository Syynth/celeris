import { useMemo } from 'react';
import { Tree, UncontrolledTreeEnvironment } from 'react-complex-tree';
import 'react-complex-tree/lib/style-modern.css';
import {
  useCurrentProjectReference,
  useOpenAssetControls,
} from '~/contexts/CurrentProject';

import { ProjectTreeDataProvider } from './ProjectTreeDataProvider';

interface ProjectBrowserProps {}

export function ProjectBrowser(_: ProjectBrowserProps) {
  const project = useCurrentProjectReference();
  const { openAsset } = useOpenAssetControls();
  const dataProvider = useMemo(
    () => new ProjectTreeDataProvider(project),
    [project],
  );

  return (
    <div className="project-browser min-w-48 p-2">
      <h1>Assets</h1>
      <UncontrolledTreeEnvironment
        dataProvider={dataProvider}
        getItemTitle={item => item.data.name}
        canDragAndDrop
        canReorderItems
        canDropOnFolder
        canDropOnNonFolder={false}
        onSelectItems={selection => {
          selection.map(s => s.toString()).forEach(openAsset);
        }}
        viewState={{}}
      >
        <Tree
          treeId="tree-1"
          rootItem={project.path}
          treeLabel="Tree Example"
        />
      </UncontrolledTreeEnvironment>
    </div>
  );
}
