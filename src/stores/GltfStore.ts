import { observable, computed, action } from "mobx";
import { GltfSource, GltfScene, GltfCamera } from "../types";
import { VariantSetManager } from "../variants";

export class GltfStore {
  private defaultGltf: string | null;
  private externalGltfUrl: string | null;

  public constructor() {
    const urlParams = new URLSearchParams(window.location.search);
    this.defaultGltf = urlParams.get("gltf");
    this.externalGltfUrl = urlParams.get("url");
  }

  @observable
  public gltfs: GltfSource[] = [];

  @observable
  public gltf?: GltfSource;

  @observable
  public sceneHierarchy?: GltfScene;

  @observable
  public camera?: GltfCamera;

  @observable
  public levelVariantSetId?: number;

  @computed
  public get variantSetManager(): VariantSetManager | undefined {
    return this.sceneHierarchy?.variantSetManager;
  }

  @computed
  public get cameras(): GltfCamera[] {
    return this.sceneHierarchy?.cameras ?? [];
  }

  @computed
  public get hasBackdrops(): boolean {
    return this.sceneHierarchy?.hasBackdrops ?? false;
  }

  @action.bound
  public setGltf(gltf?: GltfSource) {
    this.gltf = gltf;
  }

  @action.bound
  public setCamera(camera?: GltfCamera) {
    this.camera = camera;
  }

  @action.bound
  public showLevelVariantSet(id?: number) {
    this.levelVariantSetId = id;
  }

  @action.bound
  public setGltfs(gltfs: GltfSource[]) {
    this.gltfs = gltfs;

    if (!this.gltf) {
      if (this.externalGltfUrl) {
        // Load external GLB file from URL
        // Extract filename from URL for display name
        let displayName = "External GLB";
        try {
          const url = new URL(this.externalGltfUrl);
          const pathname = url.pathname;
          const filename = pathname.substring(pathname.lastIndexOf("/") + 1);
          if (filename && filename.match(/\.(gltf|glb)$/i)) {
            displayName = filename.replace(/\.(gltf|glb)$/i, "");
          }
        } catch (e) {
          // Invalid URL, use default name
        }

        const externalGltf: GltfSource = {
          name: displayName,
          filePath: this.externalGltfUrl,
          description: `Loaded from: ${this.externalGltfUrl}`,
        };
        this.setGltf(externalGltf);
      } else if (gltfs.length > 0) {
        if (this.defaultGltf) {
          this.setGltf(gltfs.find(m => m.name === this.defaultGltf));
        } else if (gltfs.length === 1) {
          this.setGltf(gltfs[0]);
        }
      }
    }
  }

  @action.bound
  public setSceneHierarchy(sceneHierarchy?: GltfScene) {
    this.camera = sceneHierarchy?.cameras[0];
    this.sceneHierarchy = sceneHierarchy;
    this.levelVariantSetId = undefined;
  }
}
