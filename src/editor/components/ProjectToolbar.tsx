import { Button } from '@chakra-ui/react';
import { FaPlay, FaStop } from 'react-icons/fa6';

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
    <div className="flex h-10 flex-row items-center justify-center">
      <Button
        onClick={isRunning ? stopProject : () => runProject(null!)}
        size="sm"
        className="h-6 p-0"
        color={isRunning ? 'danger' : 'default'}
      >
        {isRunning ? (
          <FaStop className="h-3 p-0" />
        ) : (
          <FaPlay className="h-3 p-0" />
        )}
      </Button>
    </div>
  );
}
