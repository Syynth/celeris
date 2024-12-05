import { listRecentProjects } from '~/lib/Project';

interface RecentProjectsProps {
  onRequestCreation(): void;
  onRequestLoad(projectPath: string): void;
}

export function RecentProjects({
  onRequestLoad,
  onRequestCreation,
}: RecentProjectsProps) {
  const recents = listRecentProjects();
  return (
    <div>
      <div>Recent Projects</div>
      <button onClick={onRequestCreation}>new project</button>
      {recents.map(project => (
        <div key={project}>
          <button onClick={() => onRequestLoad(project)}>{project}</button>
        </div>
      ))}
    </div>
  );
}
