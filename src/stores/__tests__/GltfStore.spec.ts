import "jest";
import { GltfStore } from "../GltfStore";
import { gltfs } from "../__fixtures__/gltfs";

const mockLocationSearch = (search: string) =>
  Object.defineProperty(window, "location", {
    writable: true,
    value: {
      search,
    },
  });

describe("GltfStore", () => {
  const originalLocation = window.location;

  afterAll(() => {
    Object.defineProperty(window, "location", {
      value: originalLocation,
    });
  });

  it("should load glTFs", async () => {
    const store = new GltfStore();
    store.setGltfs(gltfs);
    expect(store.gltfs).toEqual(gltfs);
  });

  it("should not have default glTF", async () => {
    const store = new GltfStore();
    store.setGltfs(gltfs);
    expect(store.gltf).toBeUndefined();
  });

  it("should have glTF after setGltf is called", async () => {
    const store = new GltfStore();
    store.setGltfs(gltfs);
    store.setGltf(store.gltfs[5]);
    expect(store.gltf).toBe(store.gltfs[5]);
  });

  it("should automatically set glTF from url param", async () => {
    mockLocationSearch("?gltf=DamagedHelmet");

    const store = new GltfStore();
    store.setGltfs(gltfs);

    expect(store.gltf).toBeDefined();
    expect(store.gltf).toEqual(gltfs.find(m => m.name === "DamagedHelmet"));
  });

  it("should not have glTF if glTF from url param is not found", async () => {
    mockLocationSearch("?gltf=none");

    const store = new GltfStore();
    store.setGltfs(gltfs);

    expect(store.gltf).toBeUndefined();
  });

  it("should load external glTF from url param", async () => {
    mockLocationSearch("?url=https://example.com/model.glb");

    const store = new GltfStore();
    store.setGltfs(gltfs);

    expect(store.gltf).toBeDefined();
    expect(store.gltf?.filePath).toBe("https://example.com/model.glb");
    expect(store.gltf?.name).toBe("model");
    expect(store.gltf?.description).toBe(
      "Loaded from: https://example.com/model.glb",
    );
  });

  it("should extract filename correctly from complex URLs", async () => {
    mockLocationSearch("?url=https://example.com/path/to/MyModel.glb");

    const store = new GltfStore();
    store.setGltfs(gltfs);

    expect(store.gltf).toBeDefined();
    expect(store.gltf?.name).toBe("MyModel");
  });

  it("should handle invalid URLs gracefully", async () => {
    mockLocationSearch("?url=not-a-valid-url");

    const store = new GltfStore();
    store.setGltfs(gltfs);

    expect(store.gltf).toBeDefined();
    expect(store.gltf?.name).toBe("External GLB");
    expect(store.gltf?.filePath).toBe("not-a-valid-url");
  });

  it("should prioritize url param over gltf param", async () => {
    mockLocationSearch("?gltf=DamagedHelmet&url=https://example.com/model.glb");

    const store = new GltfStore();
    store.setGltfs(gltfs);

    expect(store.gltf).toBeDefined();
    expect(store.gltf?.filePath).toBe("https://example.com/model.glb");
  });
});
