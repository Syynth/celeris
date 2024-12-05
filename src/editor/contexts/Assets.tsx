import {
  PropsWithChildren,
  ReactElement,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useCurrentProject } from '~/contexts/CurrentProject';

import { AssetRef } from '~/lib/Assets';

type AssetListener = (assetId: string, openAssets: string[]) => void;

interface AssetsContextValue {
  openAssets: string[];
  openAsset: (assetId: string) => void;
  closeAsset: (assetId: string) => void;
  attachListener: (listener: AssetListener) => void;
  detachListener: (listener: AssetListener) => void;
  assetListeners: Set<AssetListener>;
}

export const AssetsContext = createContext<AssetsContextValue>({
  openAssets: [],
  openAsset: () => {},
  closeAsset: () => {},
  attachListener: () => {},
  detachListener: () => {},
  assetListeners: new Set(),
});

interface AssetsProviderProps {}

export function AssetsProvider({
  children,
}: PropsWithChildren<AssetsProviderProps>): ReactElement {
  const [openAssets, setOpenAssets] = useState<string[]>([]);
  const [assetListeners] = useState(new Set<AssetListener>());

  const openAsset = useCallback(
    (assetId: string) => {
      if (!openAssets.includes(assetId)) {
        const newAssets = [...openAssets, assetId];
        setOpenAssets(newAssets);
        assetListeners.forEach(listener => listener(assetId, newAssets));
      } else {
        assetListeners.forEach(listener => listener(assetId, openAssets));
      }
    },
    [openAssets],
  );

  const closeAsset = useCallback(
    (assetId: string) => {
      if (openAssets.includes(assetId)) {
        const newAssets = openAssets.filter(id => id !== assetId);
        setOpenAssets(newAssets);
        assetListeners.forEach(listener => listener(assetId, newAssets));
      } else {
        assetListeners.forEach(listener => listener(assetId, openAssets));
      }
    },
    [openAssets],
  );

  const attachListener = useCallback(
    (listener: AssetListener) => {
      assetListeners.add(listener);
    },
    [assetListeners],
  );

  const detachListener = useCallback(
    (listener: AssetListener) => {
      assetListeners.delete(listener);
    },
    [assetListeners],
  );

  const value = useMemo<AssetsContextValue>(
    () => ({
      openAssets,
      openAsset,
      closeAsset,
      attachListener,
      detachListener,
      assetListeners,
    }),
    [
      openAssets,
      openAsset,
      closeAsset,
      attachListener,
      detachListener,
      assetListeners,
    ],
  );

  return (
    <AssetsContext.Provider value={value}>{children}</AssetsContext.Provider>
  );
}

export function useOpenAssetIds(): string[] {
  return useContext(AssetsContext).openAssets;
}

export function useOpenAssets(): AssetRef[] {
  const project = useCurrentProject();
  const assetIds = useOpenAssetIds();

  return assetIds.map(id => project.assets[id]).filter(Boolean);
}

export function useAssetListener(listener: AssetListener) {
  const listenerRef = useRef<AssetListener>(listener);
  const { attachListener, detachListener } = useContext(AssetsContext);

  useEffect(() => {
    function listenerImpl(assetId: string, openAssets: string[]) {
      listenerRef.current(assetId, openAssets);
    }

    attachListener(listenerImpl);
    return () => detachListener(listenerImpl);
  }, [attachListener, detachListener]);
}

export function useOpenAssetControls() {
  const { openAsset, closeAsset } = useContext(AssetsContext);
  return { openAsset, closeAsset };
}
