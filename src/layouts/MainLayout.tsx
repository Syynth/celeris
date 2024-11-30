import { PropsWithChildren, ReactNode } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';

interface MainLayoutProps {
  sidebar?: ReactNode;
}

export function MainLayout(props: PropsWithChildren<MainLayoutProps>) {
  return (
    <main className="flex h-[100vh] w-[100vw] flex-row">
      <PanelGroup
        direction="horizontal"
        id="group"
        autoSaveId="main-layout-persistence"
      >
        <Panel
          defaultSize={20}
          className="rounded-md bg-white/10"
          id="left-panel"
        >
          {props.sidebar}
        </Panel>
        <PanelResizeHandle className="bg-red-500" id="resize-handle" />
        <Panel defaultSize={80} id="right-panel">
          {props.children}
        </Panel>
      </PanelGroup>
    </main>
  );
}
