import { Editor, OnChange } from '@monaco-editor/react';
import { useQuery } from '@tanstack/react-query';
import { readTextFile, writeTextFile } from '@tauri-apps/plugin-fs';
import { useCallback } from 'react';
import { useColorModeValue } from '~/components/ui/color-mode.tsx';

import { AssetRef } from '~/lib/Assets';

interface InkViewProps {
  absolutePath: string;
  asset: AssetRef;
}

export function InkView({ absolutePath, asset }: InkViewProps) {
  const { data: text } = useQuery({
    queryKey: ['inkView', asset.id],
    queryFn: async () => {
      try {
        return await readTextFile(absolutePath);
      } catch (err) {
        console.error(err);
      }
    },
  });

  const handleChange: OnChange = useCallback(async text => {
    if (text) {
      await writeTextFile(absolutePath, text);
    }
  }, []);

  const theme = useColorModeValue('light', 'vs-dark');

  return <Editor theme={theme} onChange={handleChange} value={text} />;
}
