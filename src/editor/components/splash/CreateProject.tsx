import {
  Button,
  Flex,
  Group,
  HStack,
  Heading,
  IconButton,
  Image,
  Input,
  VStack,
} from '@chakra-ui/react';
import { useRef, useState } from 'react';
import { IoCloseSharp } from 'react-icons/io5';

interface CreateProjectSplashProps {
  onCreateProject: (projectName: string) => Promise<void>;
  onCancel: () => void;
}

export function CreateProjectSplash({
  onCreateProject,
  onCancel,
}: CreateProjectSplashProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  function onClick() {
    if (!inputRef.current) {
      return;
    }
    const projectName = inputRef.current.value.trim();
    if (projectName.length > 2) {
      onCreateProject?.(projectName);
      setLoading(true);
      setTimeout(() => setLoading(false), 1000);
    }
  }

  return (
    <Flex flexDirection="column" m="auto" h="full" w={96}>
      <VStack my="auto" rounded="lg" align="stretch">
        <HStack position="relative">
          <Heading mx="auto" size="md">
            New Project
          </Heading>
          <IconButton
            onClick={onCancel}
            variant="ghost"
            position="absolute"
            right={2}
            size="2xs"
          >
            <IoCloseSharp />
          </IconButton>
        </HStack>
        <Image
          mx="auto"
          alt="Celeris Logo"
          className="object-fill"
          height={288}
          width={288}
          src="/celeris-logo.png"
        />
        <Group attached>
          <Input ref={inputRef} variant="subtle" placeholder="Project Name" />
          <Button variant="subtle" onClick={onClick}>
            {loading ? '...' : 'Create'}
          </Button>
        </Group>
      </VStack>
    </Flex>
  );
}
