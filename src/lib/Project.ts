import { z } from 'zod';

export const ProjectSchema = z.object({
  name: z.string(),
  settings: z.record(z.unknown()),
  assets: z.record(z.unknown()),
});

export type Project = z.infer<typeof ProjectSchema>;

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
