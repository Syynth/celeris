import { Heading, VStack } from '@chakra-ui/react';
import { useEffect, useMemo, useState } from 'react';
import { Tree, UncontrolledTreeEnvironment } from 'react-complex-tree';
import 'react-complex-tree/lib/style-modern.css';
import { useCurrentProjectReference } from '~/contexts/CurrentProject';

import { useOpenAssetControls } from '~/editor/contexts/Assets';

import { ProjectTreeDataProvider } from './ProjectTreeDataProvider';

interface ProjectBrowserProps {}

export function ProjectBrowser(_: ProjectBrowserProps) {
  const project = useCurrentProjectReference();
  const { openAsset } = useOpenAssetControls();
  const dataProvider = useMemo(
    () => new ProjectTreeDataProvider(project),
    [project],
  );

  useEffect(() => {
    const unwatch = dataProvider.beginFsWatch();
    return () => {
      void unwatch();
    };
  }, [dataProvider]);

  const [, forceUpdate] = useState(0);

  return (
    <VStack align="stretch" minW={48}>
      <Heading
        size="sm"
        onClick={() => {
          console.log('forcing update');
          forceUpdate(s => s + 1);
        }}
      >
        Assets
      </Heading>
      <UncontrolledTreeEnvironment
        dataProvider={dataProvider}
        getItemTitle={item => item.data.name}
        canDragAndDrop
        canReorderItems
        canDropOnFolder
        canDropOnNonFolder={false}
        onSelectItems={selection => {
          selection
            .filter(s => typeof s === 'string')
            .forEach(s => openAsset(s));
        }}
        viewState={{}}
      >
        <Tree
          treeId="tree-1"
          rootItem={project.path}
          treeLabel="Tree Example"
        />
      </UncontrolledTreeEnvironment>
    </VStack>
  );
}
