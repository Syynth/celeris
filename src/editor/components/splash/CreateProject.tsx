import {
  Box,
  Button,Flex,
  Image,
  Input,
} from '@chakra-ui/react';
import { useRef, useState } from 'react';

interface CreateProjectSplashProps {
  onCreateProject: (projectName: string) => Promise<void>;
}

export function CreateProjectSplash({
  onCreateProject,
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
      <Box
        my="auto"
        rounded="lg"
        className="my-auto h-[288px] w-[288px] border-none"
      >
        <Image
          alt="Celeris Logo"
          className="object-fill"
          height={288}
          src="/celeris-logo.png"
          width={288}
        />
        <div className="absolute z-10 flex-col !items-center">
          <p className="text-center text-lg text-white/80">New Project</p>
        </div>
        <div className="absolute bottom-1 z-10 ml-1 w-[calc(100%_-_8px)] justify-between space-x-2 overflow-hidden rounded-large border-1 border-white/20 py-1 shadow-small before:rounded-xl before:bg-white/10">
          <Input
            ref={inputRef}
            className="rounded-lg bg-black/20 text-white"
            placeholder="Project Name"
            size="sm"
          />
          <Button
            className="bg-black/20 text-tiny text-white"
            color="default"
            rounded="lg"
            size="sm"
            onClick={onClick}
          >
            {loading ? '...' : 'Create'}
          </Button>
        </div>
      </Box>
    </Flex>
  );
}
