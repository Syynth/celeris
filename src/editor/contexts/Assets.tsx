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

type AssetListener = (assetPath: string, openAssets: string[]) => void;

interface AssetsContextValue {
  openAssets: string[];
  openAsset: (assetPath: string) => void;
  closeAsset: (assetPath: string) => void;
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
    (assetPath: string) => {
      if (!openAssets.includes(assetPath)) {
        const newAssets = [...openAssets, assetPath];
        setOpenAssets(newAssets);
        assetListeners.forEach(listener => listener(assetPath, newAssets));
      } else {
        assetListeners.forEach(listener => listener(assetPath, openAssets));
      }
    },
    [openAssets],
  );

  const closeAsset = useCallback(
    (assetPath: string) => {
      if (openAssets.includes(assetPath)) {
        const newAssets = openAssets.filter(id => id !== assetPath);
        setOpenAssets(newAssets);
        assetListeners.forEach(listener => listener(assetPath, newAssets));
      } else {
        assetListeners.forEach(listener => listener(assetPath, openAssets));
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

export function useOpenAssetPaths(): string[] {
  return useContext(AssetsContext).openAssets;
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
