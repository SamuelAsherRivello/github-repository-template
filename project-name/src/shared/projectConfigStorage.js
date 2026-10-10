export const projectConfigStorageKey = "github-repository-template.config";

export function readProjectConfig(storage) {
  try {
    const saved = JSON.parse(storage.getItem(projectConfigStorageKey) ?? "null");
    return saved && typeof saved === "object" && !Array.isArray(saved) ? saved : {};
  } catch {
    return {};
  }
}

export function writeProjectConfigPatch(storage, patch) {
  try {
    storage.setItem(projectConfigStorageKey, JSON.stringify({ ...readProjectConfig(storage), ...patch }));
    return true;
  } catch {
    return false;
  }
}
