export class PatchDTOHelper {
  public static sanitize<T extends Record<string, unknown>>(
    patchData: Partial<T>,
    allowedKeys: (keyof T)[],
  ): Partial<T> {
    const cleanObject: Partial<T> = {};

    for (const key of allowedKeys) {
      if (patchData[key] !== undefined) {
        cleanObject[key] = patchData[key];
      }
    }

    return cleanObject;
  }
}
