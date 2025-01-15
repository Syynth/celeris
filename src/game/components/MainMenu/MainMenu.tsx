import { Heading, VStack } from '@chakra-ui/react';
import { ReactNode, useState } from 'react';
import { match } from 'ts-pattern';
import { Button } from '~/components/ui/button';

import { Project } from '~/lib/Project';
import { SaveFile } from '~/lib/SaveFile';

import { LoadMenu } from './LoadMenu';
import { NewGameMenu } from './NewGameMenu';
import { SettingsMenu } from './SettingsMenu';

interface MainMenuProps {
  project: Project;
  onLoadGame: (saveFile: SaveFile) => void;
}

export function MainMenu({ project }: MainMenuProps) {
  const [screen, setScreen] = useState<'main' | 'load' | 'new' | 'settings'>(
    'main',
  );

  return (
    <>
      {match(screen)
        .returnType<ReactNode>()
        .with('main', () => (
          <VStack gap={12} align="center" p={16} h="full">
            <Heading
              textTransform="uppercase"
              fontSize={72}
              size="4xl"
              mt="auto"
            >
              {project.name}
            </Heading>
            <VStack gap={4} align="stretch" justify="center">
              <Button
                size="xl"
                variant="outline"
                onClick={() => setScreen('new')}
              >
                New Game
              </Button>
              <Button
                size="xl"
                variant="outline"
                onClick={() => setScreen('load')}
              >
                Load Game
              </Button>
              <Button
                size="xl"
                variant="outline"
                onClick={() => setScreen('settings')}
              >
                Settings
              </Button>
              <Button
                size="xl"
                variant="outline"
                onClick={() => console.log('Quit Game')}
              >
                Quit Game
              </Button>
            </VStack>
          </VStack>
        ))
        .with('load', () => <LoadMenu />)
        .with('new', () => <NewGameMenu />)
        .with('settings', () => <SettingsMenu />)
        .exhaustive()}
    </>
  );
}
