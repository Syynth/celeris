import { useQuery } from '@tanstack/react-query';
import { readTextFile, writeTextFile } from '@tauri-apps/plugin-fs';
import 'brace';
import 'brace/mode/java';
import 'brace/theme/monokai';
import { useCallback } from 'react';
import AceEditor from 'react-ace';

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

  const handleChange = useCallback((text: string) => {
    writeTextFile(absolutePath, text);
  }, []);

  return (
    <AceEditor
      mode="java"
      theme="monokai"
      name={`${asset.id}/editor`}
      onChange={handleChange}
      value={text}
      className="h-full w-full"
      style={{
        width: 'inherit',
        height: 'inherit',
      }}
      editorProps={{ $blockScrolling: true }}
    />
  );
}
