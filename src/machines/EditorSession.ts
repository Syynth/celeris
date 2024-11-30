import { setup } from 'xstate';

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
    loadProject: ({ context, event }) => {
      context.project = event.type === 'project.load' ? event.project : null;
    },
    unloadProject: ({ context }) => {
      context.project = null;
    },
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
          action: 'loadProject',
        },
      },
    },
    projectLoaded: {
      on: {
        'project.unload': {
          target: 'noProject',
          action: 'unloadProject',
        },
      },
    },
    noProject: {
      on: {
        'project.load': {
          target: 'projectLoaded',
          action: 'loadProject',
        },
      },
    },
  },
});
