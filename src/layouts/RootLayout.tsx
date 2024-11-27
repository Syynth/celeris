import type { PropsWithChildren } from 'react';

interface RootLayoutProps {}

export function RootLayout(props: PropsWithChildren<RootLayoutProps>) {
  return (
    <main className="flex h-[100vh] w-[100vw] flex-row bg-purple-500">
      <div className="flex-1 bg-green-500">{props.children}</div>
    </main>
  );
}
