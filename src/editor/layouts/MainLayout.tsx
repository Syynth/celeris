import { HStack, VStack } from '@chakra-ui/react';
import { PropsWithChildren, ReactNode } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { useColorModeValue } from '~/components/ui/color-mode.tsx';

import { SaveFile } from '~/lib/SaveFile';

import { ProjectToolbar } from '~/editor/components/ProjectToolbar';

interface MainLayoutProps {
  sidebar?: ReactNode;
  isRunning: boolean;
  stopProject: () => void;
  runProject: (saveFile: SaveFile) => void;
}

export function MainLayout(props: PropsWithChildren<MainLayoutProps>) {
  const panelBg = useColorModeValue('blackAlpha.50', 'whiteAlpha.50');
  return (
    <VStack divideY="1px" w="100vw" h="100vh" gap={0}>
      <ProjectToolbar {...props} />
      <HStack asChild gap={0} align="stretch">
        <PanelGroup
          direction="horizontal"
          id="group"
          autoSaveId="main-layout-persistence"
        >
          <HStack asChild p={1} align="stretch">
            <Panel defaultSize={20} id="left-panel">
              <VStack p={2} flex={1} align="stretch" rounded="md" bg={panelBg}>
                {props.sidebar}
              </VStack>
            </Panel>
          </HStack>
          <PanelResizeHandle id="resize-handle" />
          <HStack asChild p={1} align="stretch">
            <Panel defaultSize={80} id="right-panel">
              <VStack p={2} flex={1} align="stretch" rounded="md" bg={panelBg}>
                {props.children}
              </VStack>
            </Panel>
          </HStack>
        </PanelGroup>
      </HStack>
    </VStack>
  );
}
