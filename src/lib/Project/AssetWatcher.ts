import {
  WatchEvent,
  WatchEventKindAccess,
  WatchEventKindCreate,
  WatchEventKindModify,
  WatchEventKindRemove,
  watch,
} from '@tauri-apps/plugin-fs';
import { P, match } from 'ts-pattern';

export class AssetWatcher {
  private path: string;
  private watching: boolean = false;

  constructor(path: string) {
    this.path = path;
  }

  watch() {
    if (this.watching) return async () => {};
    this.watching = true;
    const unwatch = watch(
      this.path,
      // @ts-expect-error Not sure why this is typed wrong
      async ({ attrs, paths, kind }: WatchEvent) => {
        match(kind as WatchEvent['type'])
          .with('any', () => {
            console.log('Any:', { paths, attrs });
          })
          .with('other', () => {
            console.log('Other:', { paths, attrs });
          })
          .with({ access: P.nonNullable }, ({ access }) =>
            this.handleAccessEvent(access, paths, attrs),
          )
          .with({ create: P.nonNullable }, ({ create }) =>
            this.handleCreateEvent(create, paths, attrs),
          )
          .with({ modify: P.nonNullable }, ({ modify }) =>
            this.handleModifyEvent(modify, paths, attrs),
          )
          .with({ remove: P.nonNullable }, ({ remove }) =>
            this.handleRemoveEvent(remove, paths, attrs),
          )
          .exhaustive();
      },
      { recursive: true },
    );

    return async () => {
      const u = await unwatch;
      this.watching = false;
      u();
    };
  }

  private async handleAccessEvent(
    access: WatchEventKindAccess,
    paths: string[],
    attrs: unknown,
  ) {
    match(access)
      .with({ kind: 'open' }, access => {
        console.log('Accessed open:', { access, paths, attrs });
      })
      .with({ kind: 'close' }, access => {
        console.log('Accessed close:', { access, paths, attrs });
      })
      .with({ kind: 'any' }, access => {
        console.error('Unknown WatchEventKindAccess:', {
          access,
          paths,
          attrs,
        });
      })
      .with({ kind: 'other' }, access => {
        console.log('Accessed other:', { access, paths, attrs });
      })
      .exhaustive();
  }

  private async handleCreateEvent(
    create: WatchEventKindCreate,
    paths: string[],
    attrs: unknown,
  ) {
    match(create)
      .with({ kind: 'file' }, create => {
        console.log('Created file:', { create, paths, attrs });
      })
      .with({ kind: 'folder' }, create => {
        console.log('Created dir:', { create, paths, attrs });
      })
      .with({ kind: 'any' }, create => {
        console.log('Created any', { create, paths, attrs });
      })
      .with({ kind: 'other' }, create => {
        console.log('Created other:', { create, paths, attrs });
      })
      .exhaustive();
  }

  private async handleModifyEvent(
    modify: WatchEventKindModify,
    paths: string[],
    attrs: unknown,
  ) {
    match(modify)
      .with({ kind: 'any' }, modify => {
        console.log('Modified any:', { modify, paths, attrs });
      })
      .with({ kind: 'other' }, modify => {
        console.log('Modified other:', { modify, paths, attrs });
      })
      .with({ kind: 'data' }, modify => {
        console.log('Modified data:', { modify, paths, attrs });
      })
      .with({ kind: 'metadata' }, modify => {
        console.log('Modified metadata:', { modify, paths, attrs });
      })
      .with({ kind: 'rename' }, modify => {
        console.log('Modified rename:', { modify, paths, attrs });
      })
      .exhaustive();
  }

  private async handleRemoveEvent(
    remove: WatchEventKindRemove,
    paths: string[],
    attrs: unknown,
  ) {
    match(remove)
      .with({ kind: 'file' }, remove => {
        console.log('Removed file:', { remove, paths, attrs });
      })
      .with({ kind: 'folder' }, remove => {
        console.log('Removed folder:', { remove, paths, attrs });
      })
      .with({ kind: 'any' }, remove => {
        console.log('Removed any:', { remove, paths, attrs });
      })
      .with({ kind: 'other' }, remove => {
        console.log('Removed other:', { remove, paths, attrs });
      })
      .exhaustive();
  }
}
