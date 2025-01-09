import { HStack, IconButton, Tabs, Text } from '@chakra-ui/react';
import { sep } from '@tauri-apps/api/path';
import { Suspense, useCallback, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { IoCloseSharp } from 'react-icons/io5';

import { getAssetRef } from '~/lib/Assets.ts';
import { useSetWindowSizeOnce } from '~/lib/utils.ts';

import { GameView } from '~/editor/components/GameView';
import {
  useAssetListener,
  useOpenAssetControls,
  useOpenAssetPaths,
} from '~/editor/contexts/Assets';

import { ProjectViewTab } from './ProjectViewTab';

interface ProjectViewFrameProps {
  isGameRunning: boolean;
}

export function ProjectViewFrame({ isGameRunning }: ProjectViewFrameProps) {
  useSetWindowSizeOnce(1920, 1080);
  const openAssets = useOpenAssetPaths();
  const { closeAsset } = useOpenAssetControls();

  const [selected, setSelected] = useState<string | null>(
    openAssets.at(0) ?? null,
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
      gap={0.5}
    >
      <Tabs.List>
        {openAssets.map(asset => (
          <Tabs.Trigger
            key={asset}
            value={asset}
            bg={selected === asset ? 'whiteAlpha.100' : undefined}
            colorPalette={selected === asset ? 'blue' : undefined}
            onAuxClick={e => {
              if (e.button === 1) {
                e.preventDefault();
                closeAsset(asset);
              }
            }}
          >
            <HStack gap={1}>
              <Text
                fontSize="small"
                fontWeight={selected === asset ? 'normal' : 'light'}
              >
                {asset.split(sep()).slice(-1)[0]}
              </Text>
              <IconButton
                asChild
                h={6}
                py={1}
                size="2xs"
                variant="ghost"
                colorPalette="gray"
                onClick={() => closeAsset(asset)}
              >
                <IoCloseSharp />
              </IconButton>
            </HStack>
          </Tabs.Trigger>
        ))}
      </Tabs.List>
      {openAssets.map(asset => (
        <Tabs.Content
          p={0}
          key={asset}
          value={asset}
          display="flex"
          flexDirection="column"
          w="full"
          flex={1}
        >
          <ProjectViewTab asset={getAssetRef(asset)} />
        </Tabs.Content>
      ))}
    </Tabs.Root>
  );
}
