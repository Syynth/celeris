import { assign, setup } from 'xstate';

import { ProjectReference } from '~/lib/Project';
import { SaveFile } from '~/lib/SaveFile';

type EditorSessionContext = {
  project: ProjectReference | null;
  saveFile: SaveFile | null;
};

type ProjectCreateEvent = { type: 'project.create' };
type CancelProjectCreationEvent = { type: 'project.cancel' };
type ProjectUnloadEvent = { type: 'project.unload' };
type ProjectLoadEvent = { type: 'project.load'; project: ProjectReference };
type ProjectRunEvent = { type: 'project.run'; saveFile: SaveFile };
type ProjectStopEvent = { type: 'project.stop' };

type EditorSessionEvent =
  | CancelProjectCreationEvent
  | ProjectUnloadEvent
  | ProjectCreateEvent
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
      project: ({ event }) => {
        if (event.type === 'project.load') {
          return event.project;
        }
        return null;
      },
    }),
    unloadProject: assign({
      project: () => null,
      saveFile: () => null,
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
  initial: 'recentProjectSelection',
  states: {
    recentProjectSelection: {
      on: {
        'project.create': {
          target: 'projectCreation',
        },
        'project.load': {
          target: 'projectLoaded',
          actions: ['loadProject'],
        },
      },
    },
    projectCreation: {
      on: {
        'project.load': {
          target: 'projectLoaded',
          actions: ['loadProject'],
        },
        'project.cancel': {
          target: 'recentProjectSelection',
        },
      },
    },
    projectLoaded: {
      on: {
        'project.unload': {
          target: 'recentProjectSelection',
          actions: ['unloadProject'],
        },
        'project.run': {
          target: 'projectRunning',
          actions: ['runProject'],
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
