import { assign, setup } from 'xstate';

import { Project, newProject } from '~/lib/Project';
import { SaveFile, newSaveFile } from '~/lib/SaveFile';

type GameSessionContext = {
  activeSaveFile: SaveFile | null;
  project: Project;
};

type InitializeProjectEvent = { type: 'project.initialize'; project: Project };
type MainMenuEvent = { type: 'game.main-menu' };
type QuitGameEvent = { type: 'game.quit' };
type LoadGameEvent = { type: 'game.load'; saveFile: SaveFile };
type NewGameEvent = { type: 'game.new' };
type SuspendGameEvent = { type: 'game.suspend' };
type ResumeGameEvent = { type: 'game.resume' };
type ReloadGameEvent = { type: 'game.restart' };

type GameSessionEvent =
  | InitializeProjectEvent
  | MainMenuEvent
  | QuitGameEvent
  | LoadGameEvent
  | NewGameEvent
  | SuspendGameEvent
  | ResumeGameEvent
  | ReloadGameEvent;

export const GameSessionMachine = setup({
  types: {
    context: {} as GameSessionContext,
    events: {} as GameSessionEvent,
  },
  actions: {
    initializeProject: assign({
      project: ({ context, event }) =>
        event.type === 'project.initialize' ? event.project : context.project,
    }),
    loadGame: assign({
      activeSaveFile: ({ event }) =>
        event.type === 'game.load' ? event.saveFile : null,
    }),
    startNewGame: assign({
      activeSaveFile: () => newSaveFile(-1),
    }),
    clearSaveFile: assign({
      activeSaveFile: () => null,
    }),
  },
}).createMachine({
  id: 'game-session',
  initial: 'startup',
  context: {
    project: newProject('Default Project'),
    activeSaveFile: null,
  },
  states: {
    startup: {
      on: {
        'project.initialize': {
          target: 'mainMenu',
          actions: ['initializeProject'],
        },
      },
    },
    mainMenu: {
      beforeEnter: ['clearSaveFile'],
      on: {
        'game.load': {
          target: 'playing',
          actions: ['loadGame'],
        },
        'game.new': {
          target: 'playing',
          actions: ['startNewGame'],
        },
        'game.reload': {
          target: 'startup',
        },
      },
    },
    mainMenuSuspended: {
      on: {
        'game.resume': {
          target: 'mainMenu',
        },
        'game.reload': {
          target: 'startup',
        },
      },
    },
    playing: {
      on: {
        'game.main-menu': {
          target: 'mainMenu',
        },
        'game.suspend': {
          target: 'suspended',
        },
        'game.quit': {
          target: 'mainMenu',
        },
        'game.restart': {
          target: 'startup',
        },
      },
    },
    suspended: {
      on: {
        'game.resume': {
          target: 'playing',
        },
        'game.restart': {
          target: 'startup',
        },
      },
    },
  },
});
