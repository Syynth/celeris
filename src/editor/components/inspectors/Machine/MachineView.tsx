import { Box } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import {
  Background,
  BackgroundVariant,
  ColorMode,
  ReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useState } from 'react';
import { AiOutlineSubnode } from 'react-icons/ai';
import { useColorMode } from '~/components/ui/color-mode';
import {
  MenuContent,
  MenuContextTrigger,
  MenuItem,
  MenuRoot,
} from '~/components/ui/menu';

import { AssetRef } from '~/lib/Assets';
import { importMachine } from '~/lib/Assets/Machine';

interface MachineViewProps {
  absolutePath: string;
  asset: AssetRef;
}

export function MachineView({ absolutePath, asset }: MachineViewProps) {
  const { data: machine } = useQuery({
    queryKey: ['machineView', asset.lastKnownPath],
    queryFn: async () => {
      try {
        return await importMachine(absolutePath);
      } catch (err) {
        console.error(err);
      }
    },
  });

  const { colorMode } = useColorMode();

  const [nodes, setNodes] = useState(machine?.states ?? []);
  const [edges, setEdges] = useState(machine?.transitions ?? []);

  const handleAddItem = () => {
    setNodes([
      ...(nodes ?? []),
      {
        id: `state-${nodes?.length + 1}`,
        data: { label: `State ${nodes?.length + 1}` },
        position: {
          x: Math.random() * 1000,
          y: Math.random() * 1000,
        },
      },
    ]);
  };

  return (
    <Box w="full" h="full">
      <MenuRoot>
        <MenuContextTrigger w="full" h="full">
          <ReactFlow
            nodesDraggable
            panOnDrag
            elementsSelectable
            // @ts-expect-error
            nodes={nodes}
            // @ts-expect-error
            edges={edges}
            onNodesChange={nodes => setNodes(nodes)}
            onEdgesChange={edges => setEdges(edges)}
            colorMode={(colorMode as ColorMode) ?? 'system'}
          >
            <Box asChild opacity={colorMode === 'dark' ? 0.2 : 0.75}>
              <Background variant={BackgroundVariant.Lines} />
            </Box>
          </ReactFlow>
        </MenuContextTrigger>
        <MenuContent>
          <MenuItem value="add-state" onClick={handleAddItem}>
            <AiOutlineSubnode /> Add State
          </MenuItem>
        </MenuContent>
      </MenuRoot>
    </Box>
  );
}
