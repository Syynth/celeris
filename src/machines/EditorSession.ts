import { assign, setup } from 'xstate';

import { Project } from '~/lib/Project';

type EditorSessionContext = {
  project: Project | null;
};

type ProjectNotFoundEvent = { type: 'project.not-found' };
type ProjectUnloadEvent = { type: 'project.unload' };
type ProjectLoadEvent = { type: 'project.load'; project: Project };

type EditorSessionEvent =
  | ProjectNotFoundEvent
  | ProjectUnloadEvent
  | ProjectLoadEvent;

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
  },
}).createMachine({
  id: 'editor-session',
  context: {
    project: null,
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
  },
});
