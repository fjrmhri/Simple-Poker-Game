import { deepClone } from "./models";

describe("deepClone", () => {
  it("copies objects without losing data types", () => {
    const original = {
      date: new Date("2024-01-01T00:00:00Z"),
      map: new Map([[1, { foo: "bar" }]]),
      set: new Set([1, 2, 3]),
      nested: { arr: [1, 2, { a: 3 }] },
    };

    const copy = deepClone(original);

    expect(copy).not.toBe(original);
    expect(copy.date instanceof Date).toBe(true);
    expect(copy.date.getTime()).toBe(original.date.getTime());
    expect(copy.map instanceof Map).toBe(true);
    expect(copy.map.get(1)).toEqual({ foo: "bar" });
    expect(copy.set instanceof Set).toBe(true);
    expect(copy.set.has(2)).toBe(true);
    expect(copy.nested).toEqual(original.nested);
  });
});
