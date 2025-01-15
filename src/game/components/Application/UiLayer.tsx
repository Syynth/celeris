import { Box, Center, Spinner } from '@chakra-ui/react';
import { P, match } from 'ts-pattern';

import { Project } from '~/lib/Project';
import { SaveFile } from '~/lib/SaveFile';

import { MainMenu } from '~/game/components/MainMenu';
import {
  GameSessionEvent,
  GameSessionState,
} from '~/game/machines/GameSession';

interface UiLayerProps {
  send: (event: GameSessionEvent) => void;
  state: GameSessionState;
  project: Project;
}

export function UiLayer({ state, send, project }: UiLayerProps) {
  function handleLoadGame(saveFile: SaveFile) {
    send({ type: 'game.load', saveFile });
  }

  return match(state)
    .with({ value: 'startup' }, () => (
      <Center w="full" h="full">
        <Spinner boxSize={24} />
      </Center>
    ))
    .with({ value: P.union('mainMenu', 'mainMenuSuspended') }, () => (
      <MainMenu project={project} onLoadGame={handleLoadGame} />
    ))
    .with({ value: P.union('playing', 'suspended') }, () => (
      <Box>Suspended</Box>
    ))
    .otherwise(() => <Box>OTHERWISE: UI Layer {state.value}</Box>);
}
