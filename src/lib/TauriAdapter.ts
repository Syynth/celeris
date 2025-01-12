import { resolve } from '@tauri-apps/api/path';
import { readFile } from '@tauri-apps/plugin-fs';
import {
  Adapter,
  BrowserAdapter,
  ICanvas,
  ICanvasRenderingContext2D,
  loadTextures,
} from 'pixi.js';

import { ProjectReference } from './Project';

export class TauriAdapter implements Adapter {
  private projectRef: ProjectReference | null = null;

  constructor() {
    if (loadTextures.config) {
      loadTextures.config.preferWorkers = false;
    }
  }

  set project(project: ProjectReference) {
    this.projectRef = project;
  }

  async fetch(url: RequestInfo, options?: RequestInit): Promise<Response> {
    let urlStr = url.toString();
    if (urlStr.startsWith('project://')) {
      urlStr = urlStr.replace('project://', '');
      const path = await resolve(this.projectRef?.path ?? '', '..', urlStr);
      return readFile(path)
        .then(data => new Response(data))
        .catch(error => {
          console.error('TauriAdapter.fetch error:', error);
          return new Response(null, { status: 404 });
        });
    }
    return BrowserAdapter.fetch(url, options);
  }

  createCanvas(width?: number, height?: number): ICanvas {
    return BrowserAdapter.createCanvas(width, height);
  }

  getCanvasRenderingContext2D(): { prototype: ICanvasRenderingContext2D } {
    return BrowserAdapter.getCanvasRenderingContext2D();
  }

  getWebGLRenderingContext(): typeof WebGLRenderingContext {
    return BrowserAdapter.getWebGLRenderingContext();
  }

  getNavigator(): { userAgent: string; gpu: GPU | null } {
    return BrowserAdapter.getNavigator();
  }

  getBaseUrl(): string {
    return 'project://';
  }

  getFontFaceSet(): FontFaceSet | null {
    return BrowserAdapter.getFontFaceSet();
  }

  parseXML(xml: string): Document {
    return BrowserAdapter.parseXML(xml);
  }
}
