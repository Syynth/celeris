import { LogicalSize, getCurrentWindow } from '@tauri-apps/api/window';
import { useEffect, useRef } from 'react';

export function useSetWindowSize(width: number, height: number) {
  useEffect(() => {
    const window = getCurrentWindow();
    if (!window) return;
    (async () => {
      await window.setSize(new LogicalSize(width, height));
    })();
  }, [width, height]);
}

export function useSetWindowSizeOnce(width: number, height: number) {
  const hasBeenSet = useRef(false);
  useEffect(() => {
    if (hasBeenSet.current) return;
    const window = getCurrentWindow();
    if (!window) return;
    (async () => {
      hasBeenSet.current = true;
      await window.setSize(new LogicalSize(width, height));
    })();
  }, [width, height]);
}
