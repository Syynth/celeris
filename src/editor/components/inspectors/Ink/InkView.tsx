import { Editor, OnChange, OnMount } from '@monaco-editor/react';
import { useQuery } from '@tanstack/react-query';
import { readTextFile, writeTextFile } from '@tauri-apps/plugin-fs';
import { useCallback } from 'react';
import { useColorModeValue } from '~/components/ui/color-mode.tsx';

import { AssetRef } from '~/lib/Assets';

import language from './schema.language.json';

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

  const handleMount: OnMount = useCallback((_editor, monaco) => {
    monaco.languages.register({ id: 'ink' });
    monaco.languages.setLanguageConfiguration('ink', language as any);
  }, []);

  const theme = useColorModeValue('light', 'vs-dark');

  return (
    <Editor
      language="ink"
      theme={theme}
      onChange={handleChange}
      value={text}
      onMount={handleMount}
    />
  );
}
