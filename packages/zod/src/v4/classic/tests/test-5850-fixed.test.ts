import { z } from "zod/v4";
import { expectTypeOf, test } from "vitest";

test("discriminatedUnion with enum discriminator type narrowing", () => {
  const TypesWithOptions = z.enum(["a", "b"]);
  const TypesWithoutOptions = z.enum(["c", "d"]);
  const AllTypes = z.union([TypesWithOptions, TypesWithoutOptions]);
  type AllTypes = z.infer<typeof AllTypes>;

  const Demo = z.discriminatedUnion("type", [
    z.object({
      type: TypesWithOptions,
      options: z.object({ foo: z.string() }),
    }),
    z.object({
      type: TypesWithoutOptions,
    }),
  ]);

  type Demo = z.infer<typeof Demo>;

  const availableObjs: Demo[] = [
    { type: "a", options: { foo: "bar" } },
    { type: "b", options: { foo: "bar" } },
    { type: "c" },
    { type: "d" },
  ];

  function getWithTypes<T extends AllTypes>(types: T[]): Array<Extract<Demo, { type: T }>> {
    return availableObjs.filter((obj): obj is Extract<Demo, { type: T }> => types.includes(obj.type as T));
  }

  // Test runtime behavior
  const result1 = getWithTypes(["a", "b"] as const);
  const result2 = getWithTypes(["c", "d"] as const);

  // Type expectations
  expectTypeOf<typeof result1>().toMatchTypeOf<Array<{ type: "a" | "b"; options: { foo: string } }>>();
  expectTypeOf<typeof result2>().toMatchTypeOf<Array<{ type: "c" | "d" }>>();
});
