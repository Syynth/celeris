import { Divider } from '@nextui-org/react';
import { PropsWithChildren, ReactNode } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';

import { SaveFile } from '~/lib/SaveFile';

import { ProjectToolbar } from '~/components/ProjectToolbar';

interface MainLayoutProps {
  sidebar?: ReactNode;
  isRunning: boolean;
  stopProject: () => void;
  runProject: (saveFile: SaveFile) => void;
}

export function MainLayout(props: PropsWithChildren<MainLayoutProps>) {
  return (
    <main className="flex h-[100vh] w-[100vw] flex-col">
      <ProjectToolbar {...props} />
      <Divider orientation="horizontal" />
      <PanelGroup
        direction="horizontal"
        id="group"
        autoSaveId="main-layout-persistence"
      >
        <Panel defaultSize={20} className="p-1 pr-0" id="left-panel">
          <div className="h-full rounded-md bg-white/10">{props.sidebar}</div>
        </Panel>
        <PanelResizeHandle id="resize-handle" />
        <Panel defaultSize={80} id="right-panel" className="p-1">
          <div className="h-full rounded-md bg-white/10">{props.children}</div>
        </Panel>
      </PanelGroup>
    </main>
  );
}
