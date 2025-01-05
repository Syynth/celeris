import { Center, Group, Heading, VStack } from '@chakra-ui/react';
import { Button } from '~/components/ui/button.tsx';

import { listRecentProjects } from '~/lib/Project';

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
  return (
    <Center mx="auto">
      <VStack divideY="1px" gap={2} align="stretch">
        <Heading alignSelf="center">Recent Projects</Heading>
        <VStack pt={2}>
          {recents.map(project => (
            <Button
              key={project}
              variant="subtle"
              size="2xs"
              onClick={() => onRequestLoad(project)}
            >
              {project}
            </Button>
          ))}
        </VStack>
        <Group pt={2} attached justify="stretch">
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
