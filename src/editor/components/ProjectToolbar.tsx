import { Button, HStack } from '@chakra-ui/react';
import { FaPlay, FaStop } from 'react-icons/fa6';
import { ColorModeButton } from '~/components/ui/color-mode.tsx';

import { SaveFile } from '~/lib/SaveFile';

interface ProjectToolbarProps {
  stopProject: () => void;
  runProject: (saveFile: SaveFile) => void;
  isRunning: boolean;
}

export function ProjectToolbar({
  isRunning,
  stopProject,
  runProject,
}: ProjectToolbarProps) {
  return (
    <HStack w="full" h={10} align="center" justify="center">
      <HStack justify="center" flex={1} alignSelf="center">
        <Button
          onClick={isRunning ? stopProject : () => runProject(null!)}
          size="sm"
          h={6}
          p={0}
          alignSelf="center"
          colorPalette={isRunning ? 'red' : 'info'}
        >
          {isRunning ? (
            <FaStop className="h-3 p-0" />
          ) : (
            <FaPlay className="h-3 p-0" />
          )}
        </Button>
      </HStack>

      <ColorModeButton flex={0} />
    </HStack>
  );
}
