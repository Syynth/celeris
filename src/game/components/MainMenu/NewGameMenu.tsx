interface NewGameMenuProps {}

export function NewGameMenu({}: NewGameMenuProps) {
  return (
    <div>
      <h1>New Game</h1>
      <button onClick={() => console.log('New Game')}>New Game</button>
      <button onClick={() => console.log('Load Game')}>Load Game</button>
    </div>
  );
}
