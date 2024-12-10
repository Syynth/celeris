export interface ModificationState {
  type: 'create' | 'update' | 'delete' | 'move';
  entityType: 'asset' | 'settings' | 'structure';
  entityId: string;
  changes: unknown;
}
