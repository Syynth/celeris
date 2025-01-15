import { useMachine } from '@xstate/react';
import { useEffect } from 'react';

import { ProjectReference } from '~/lib/Project';

import {
  AppResize,
  GameLayer,
  Layer,
  UiLayer,
} from '~/game/components/Application';
import { GameSessionMachine } from '~/game/machines/GameSession';

interface GameViewProps {
  project: ProjectReference;
}

export function GameView({ project }: GameViewProps) {
  const [state, send] = useMachine(GameSessionMachine);
  const settings = project.project.settings;
  const refWidth = settings.referenceResolution[0];
  const refHeight = settings.referenceResolution[1];

  useEffect(() => {
    send({ type: 'project.initialize', project: project.project });
  }, [state, send]);

  return (
    <AppResize referenceWidth={refWidth} referenceHeight={refHeight}>
      <Layer data-label="Game Canvas Layer" zIndex={0}>
        <GameLayer state={state} send={send} />
      </Layer>
      <Layer data-label="UI Layer" zIndex={1}>
        <UiLayer project={project.project} state={state} send={send} />
      </Layer>
    </AppResize>
  );
}
