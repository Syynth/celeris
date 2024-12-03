import {
  ActionBinding,
  ActionMap,
  ActionType,
  DeviceType,
  KeyboardButtonAdapter,
} from '@s92/celeris-input';

export const PlayerActions: ActionMap = {
  Up: {
    name: 'Up',
    type: ActionType.Button,
  },
  Down: {
    name: 'Down',
    type: ActionType.Button,
  },
  Left: {
    name: 'Left',
    type: ActionType.Button,
  },
  Right: {
    name: 'Right',
    type: ActionType.Button,
  },
};

export const PlayerBindings: ActionBinding[] = [
  {
    action: PlayerActions.Up,
    bindings: [
      {
        adapter: new KeyboardButtonAdapter('KeyW'),
        device: DeviceType.Keyboard,
        inputId: 'Player/Up/W',
      },
      {
        adapter: new KeyboardButtonAdapter('ArrowUp'),
        device: DeviceType.Keyboard,
        inputId: 'Player/Up/ArrowUp',
      },
    ],
  },
  {
    action: PlayerActions.Down,
    bindings: [
      {
        adapter: new KeyboardButtonAdapter('KeyS'),
        device: DeviceType.Keyboard,
        inputId: 'Player/Down/S',
      },
      {
        adapter: new KeyboardButtonAdapter('ArrowDown'),
        device: DeviceType.Keyboard,
        inputId: 'Player/Down/ArrowDown',
      },
    ],
  },
  {
    action: PlayerActions.Left,
    bindings: [
      {
        adapter: new KeyboardButtonAdapter('KeyA'),
        device: DeviceType.Keyboard,
        inputId: 'Player/Left/A',
      },
      {
        adapter: new KeyboardButtonAdapter('ArrowLeft'),
        device: DeviceType.Keyboard,
        inputId: 'Player/Left/ArrowLeft',
      },
    ],
  },
  {
    action: PlayerActions.Right,
    bindings: [
      {
        adapter: new KeyboardButtonAdapter('KeyD'),
        device: DeviceType.Keyboard,
        inputId: 'Player/Right/D',
      },
      {
        adapter: new KeyboardButtonAdapter('ArrowRight'),
        device: DeviceType.Keyboard,
        inputId: 'Player/Right/ArrowRight',
      },
    ],
  },
];
