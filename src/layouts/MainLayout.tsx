import { Divider } from '@nextui-org/react';
import { PropsWithChildren, ReactNode } from 'react';
import { useCurrentProject } from '~/contexts/CurrentProject';

interface MainLayoutProps {
  sidebar?: ReactNode;
}

export function MainLayout(props: PropsWithChildren<MainLayoutProps>) {
  const project = useCurrentProject();
  return (
    <main className="flex h-[100vh] w-[100vw] flex-row bg-purple-500">
      <div className="bg-blue-400">
        {props.sidebar} {JSON.stringify({ project }, null, 2)}
      </div>
      <Divider orientation="vertical" />
      <div className="flex-1 bg-green-500">{props.children}</div>
    </main>
  );
}
