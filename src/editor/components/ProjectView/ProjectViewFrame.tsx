import { HStack, IconButton, Tabs, Text } from '@chakra-ui/react';
import { Suspense, useCallback, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { IoCloseSharp } from 'react-icons/io5';

import { GameView } from '~/editor/components/GameView';
import {
  useAssetListener,
  useOpenAssetControls,
  useOpenAssets,
} from '~/editor/contexts/Assets';

import { ProjectViewTab } from './ProjectViewTab';

interface ProjectViewFrameProps {
  isGameRunning: boolean;
}

export function ProjectViewFrame({ isGameRunning }: ProjectViewFrameProps) {
  const openAssets = useOpenAssets();
  const { closeAsset } = useOpenAssetControls();

  const [selected, setSelected] = useState<string | null>(
    openAssets.at(0)?.id ?? null,
  );

  useAssetListener((assetId, openAssets) => {
    if (openAssets.includes(assetId)) {
      setSelected(assetId);
    } else if (selected === assetId) {
      setSelected(openAssets.at(0) ?? null);
    }
  });

  useHotkeys(
    'ctrl+w',
    () => {
      if (selected) {
        closeAsset(selected);
      }
    },
    { preventDefault: true },
  );

  const handleSelect = useCallback((key: { value: string }) => {
    setSelected(key.value);
  }, []);

  if (isGameRunning) {
    return (
      <Suspense fallback={<div>loading...</div>}>
        <GameView />
      </Suspense>
    );
  }

  if (openAssets.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center">
        <div className="text-2xl">Open an asset to get started</div>
      </div>
    );
  }

  return (
    <Tabs.Root
      h="full"
      value={selected}
      onValueChange={handleSelect}
      variant="line"
      size="sm"
      aria-label="Open Assets"
      display="flex"
      flexDirection="column"
    >
      <Tabs.List>
        {openAssets.map(asset => (
          <Tabs.Trigger
            key={asset.id}
            value={asset.id}
            className="group h-full"
            onAuxClick={e => {
              if (e.button === 1) {
                e.preventDefault();
                closeAsset(asset.id);
              }
            }}
            children={
              <HStack className="p-x-10 p-y-0 flex h-4 flex-row items-center">
                <Text>{asset.name}</Text>
                <IconButton
                  size="2xs"
                  variant="ghost"
                  onClick={() => closeAsset(asset.id)}
                  className="ml-4 opacity-0 group-hover:opacity-100"
                >
                  <IoCloseSharp />
                </IconButton>
              </HStack>
            }
          />
        ))}
      </Tabs.List>
      {openAssets.map(asset => (
        <Tabs.Content
          key={asset.id}
          value={asset.id}
          display="flex"
          flexDirection="column"
          w="full"
          flex={1}
        >
          <ProjectViewTab asset={asset} />
        </Tabs.Content>
      ))}
    </Tabs.Root>
  );
}
