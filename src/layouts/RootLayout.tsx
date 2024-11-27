import type { PropsWithChildren } from 'react';

interface RootLayoutProps {}

export function RootLayout(props: PropsWithChildren<RootLayoutProps>) {
  return (
    <main className="flex h-[100vh] w-[100vw] flex-row">
      <div className="flex-1">{props.children}</div>
    </main>
  );
}
