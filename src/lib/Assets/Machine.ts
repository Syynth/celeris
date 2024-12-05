import { readTextFile } from '@tauri-apps/plugin-fs';
import { z } from 'zod';

export const MachineSchema = z.object({
  id: z.string(),
  machineId: z.string(),
  states: z.array(z.record(z.any())),
  transitions: z.array(z.record(z.any())),
});

export type MachineRef = z.infer<typeof MachineSchema>;

export async function importMachine(path: string): Promise<MachineRef> {
  const machineJson = await readTextFile(path);
  const rawMachine = JSON.parse(machineJson ?? '');
  return MachineSchema.parse(rawMachine);
}

export function blankMachine(): MachineRef {
  return {
    id: '',
    machineId: '',
    states: [],
    transitions: [],
  };
}
