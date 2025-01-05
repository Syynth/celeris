import {
  Center,
  For,
  Group,
  Heading,
  IconButton,
  Text,
  VStack,
} from '@chakra-ui/react';
import { LuX } from 'react-icons/lu';
import { Button } from '~/components/ui/button.tsx';

import { listRecentProjects, removeRecentProject } from '~/lib/Project';
import { useSetWindowSize } from '~/lib/utils.ts';

interface RecentProjectsProps {
  onRequestCreation(): void;
  onRequestLoad(projectPath: string): void;
  onRequestFind(): void;
}

export function RecentProjects({
  onRequestLoad,
  onRequestCreation,
  onRequestFind,
}: RecentProjectsProps) {
  const recents = listRecentProjects();

  useSetWindowSize(400, 600);

  return (
    <Center mx="auto">
      <VStack divideY="1px" gap={2} align="stretch">
        <Heading alignSelf="center">Recent Projects</Heading>
        <VStack pt={2}>
          <For
            each={recents}
            fallback={<Text>Open a project to see it here in the future</Text>}
          >
            {project => (
              <Group key={project} attached>
                <Button
                  key={project}
                  variant="subtle"
                  size="2xs"
                  onClick={() => onRequestLoad(project)}
                >
                  {project}
                </Button>
                <IconButton
                  size="2xs"
                  variant="subtle"
                  onClick={() => removeRecentProject(project)}
                >
                  <LuX />
                </IconButton>
              </Group>
            )}
          </For>
        </VStack>
        <Group pt={2} attached grow justify="stretch">
          <Button size="xs" variant="surface" onClick={onRequestCreation}>
            New Project
          </Button>
          <Button size="xs" variant="surface" onClick={onRequestFind}>
            Open...
          </Button>
        </Group>
      </VStack>
    </Center>
  );
}
