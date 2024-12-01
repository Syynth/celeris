import { assign, setup } from 'xstate';

import { Project } from '~/lib/Project';
import { SaveFile } from '~/lib/SaveFile';

type EditorSessionContext = {
  project: Project | null;
  saveFile: SaveFile | null;
};

type ProjectNotFoundEvent = { type: 'project.not-found' };
type ProjectUnloadEvent = { type: 'project.unload' };
type ProjectLoadEvent = { type: 'project.load'; project: Project };
type ProjectRunEvent = { type: 'project.run'; saveFile: SaveFile };
type ProjectStopEvent = { type: 'project.stop' };

type EditorSessionEvent =
  | ProjectNotFoundEvent
  | ProjectUnloadEvent
  | ProjectLoadEvent
  | ProjectRunEvent
  | ProjectStopEvent;

export const EditorSessionMachine = setup({
  types: {
    context: {} as EditorSessionContext,
    events: {} as EditorSessionEvent,
  },
  actions: {
    loadProject: assign({
      project: ({ event }) =>
        event.type === 'project.load' ? event.project : null,
    }),
    unloadProject: assign({
      project: () => null,
    }),
    runProject: assign({
      saveFile: ({ event }) =>
        event.type === 'project.run' ? event.saveFile : null,
    }),
    stopProject: assign({
      saveFile: () => null,
    }),
  },
}).createMachine({
  id: 'editor-session',
  context: {
    project: null,
    saveFile: null,
  },
  initial: 'startup',
  states: {
    startup: {
      on: {
        'project.not-found': {
          target: 'noProject',
        },
        'project.load': {
          target: 'projectLoaded',
          actions: ['loadProject'],
        },
      },
    },
    projectLoaded: {
      on: {
        'project.unload': {
          target: 'noProject',
          actions: ['unloadProject'],
        },
        'project.run': {
          target: 'projectRunning',
          actions: ['runProject'],
        },
      },
    },
    noProject: {
      on: {
        'project.load': {
          target: 'projectLoaded',
          actions: ['loadProject'],
        },
      },
    },
    projectRunning: {
      on: {
        'project.stop': {
          target: 'projectLoaded',
          actions: ['stopProject'],
        },
      },
    },
  },
});
