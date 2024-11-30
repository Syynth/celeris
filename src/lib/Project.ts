import { z } from 'zod';

export const ProjectSchema = z.object({
  name: z.string(),
  settings: z.record(z.unknown()),
  assets: z.object({
    sprites: z.array(
      z.object({
        id: z.string(),
        name: z.string(),
        path: z.string(),
        data: z.any(),
      }),
    ),
  }),
});

export type Project = z.infer<typeof ProjectSchema>;

export function newProject(name: string): Project {
  return {
    name,
    settings: {},
    assets: {
      sprites: [],
    },
  };
}

export async function loadProject(): Promise<Project | null> {
  const projectJson = localStorage.getItem('project');
  try {
    const rawProject = JSON.parse(projectJson ?? '');
    return ProjectSchema.parse(rawProject);
  } catch (error) {
    return null;
  }
}

export async function saveProject(project: Project): Promise<void> {
  localStorage.setItem('project', JSON.stringify(project));
  return await Promise.resolve();
}
