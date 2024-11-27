import { Divider } from '@nextui-org/react';
import { PropsWithChildren, ReactNode } from 'react';

interface MainLayoutProps {
  sidebar?: ReactNode;
}

export function MainLayout(props: PropsWithChildren<MainLayoutProps>) {
  return (
    <main className="flex h-[100vh] w-[100vw] flex-row bg-purple-500">
      <div className="bg-blue-400">{props.sidebar}</div>
      <div className="flex-1 bg-green-500">{props.children}</div>
      <Divider orientation="vertical" />
    </main>
  );
}
