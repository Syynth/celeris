export class AssetImporter {
  private constructor(private projectDir: string) {}

  static fromProjectDir(projectDir: string): AssetImporter {
    return new AssetImporter(projectDir);
  }
}
