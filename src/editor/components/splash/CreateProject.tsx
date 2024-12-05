import {
  Button,
  Card,
  CardFooter,
  CardHeader,
  Image,
  Input,
} from '@nextui-org/react';
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
    <div className="mx-auto my-auto flex h-full w-[288px] flex-col">
      <Card
        isFooterBlurred
        radius="lg"
        className="my-auto h-[288px] w-[288px] border-none"
      >
        <Image
          alt="Celeris Logo"
          className="object-fill"
          height={288}
          isBlurred
          isZoomed
          src="/celeris-logo.png"
          width={288}
        />
        <CardHeader className="absolute z-10 flex-col !items-center">
          <p className="text-center text-lg text-white/80">New Project</p>
        </CardHeader>
        <CardFooter className="absolute bottom-1 z-10 ml-1 w-[calc(100%_-_8px)] justify-between space-x-2 overflow-hidden rounded-large border-1 border-white/20 py-1 shadow-small before:rounded-xl before:bg-white/10">
          <Input
            ref={inputRef}
            variant="underlined"
            className="rounded-lg bg-black/20 text-white"
            placeholder="Project Name"
            size="sm"
          />
          <Button
            className="bg-black/20 text-tiny text-white"
            variant="flat"
            color="default"
            radius="lg"
            size="sm"
            onClick={onClick}
            isLoading={loading}
          >
            {loading ? '...' : 'Create'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
