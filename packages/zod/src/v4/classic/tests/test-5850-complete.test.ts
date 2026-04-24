import { z } from "zod/v4";
import { expectTypeOf, test } from "vitest";
import type { NarrowDiscriminatedUnion } from "../discriminated-union-helpers.js";

test("issue #5850: discriminatedUnion with enum discriminator - problem and workaround", () => {
  const TypesWithOptions = z.enum(["a", "b"]);
  const TypesWithoutOptions = z.enum(["c", "d"]);
  const AllTypes = z.union([TypesWithOptions, TypesWithoutOptions]);
  type AllTypes = z.infer<typeof AllTypes>;
  expectTypeOf<AllTypes>().toMatchTypeOf<"a" | "b" | "c" | "d">();

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

  // PROBLEM: Direct Extract doesn't work with enum-based discriminators
  // type BrokenExtract = Extract<Demo, { type: 'a' | 'b' }>  // resolves to never

  // SOLUTION: Use NarrowDiscriminatedUnion helper type instead
  type ProperNarrow = NarrowDiscriminatedUnion<Demo, "type", "a" | "b">;
  expectTypeOf<ProperNarrow>().toMatchTypeOf<{ type: "a" | "b"; options: { foo: string } }>();

  function getWithTypes<T extends AllTypes>(_types: T[]): Array<NarrowDiscriminatedUnion<Demo, "type", T>> {
    return [] as any;
  }

  // These now type-check correctly
  const withOptions = getWithTypes(["a", "b"] as const);
  expectTypeOf<typeof withOptions>().toMatchTypeOf<Array<{ type: "a" | "b"; options: { foo: string } }>>();

  const withoutOptions = getWithTypes(["c", "d"] as const);
  expectTypeOf<typeof withoutOptions>().toMatchTypeOf<Array<{ type: "c" | "d" }>>();
});

test("demonstrating ExpandDiscriminatorUnion helper", () => {
  type Input = { type: "a" | "b"; options: { foo: string } } | { type: "c" | "d" };

  // This demonstrates type expansion without needing to import ExpandDiscriminatorUnion
  // Extract now works properly with expanded discriminator unions
  type ExtractA = Extract<Input, { type: "a" | "b" }>;
  type ExtractCD = Extract<Input, { type: "c" | "d" }>;

  expectTypeOf<ExtractA>().toMatchTypeOf<{ type: "a" | "b"; options: { foo: string } }>();
  expectTypeOf<ExtractCD>().toMatchTypeOf<{ type: "c" | "d" }>();

  // Verify the types are correct
  const testA = { type: "a" as const, options: { foo: "test" } };
  const testCD = { type: "c" as const };
  expectTypeOf(testA).toMatchTypeOf<{ type: "a"; options: { foo: string } }>();
  expectTypeOf(testCD).toMatchTypeOf<{ type: "c" }>();
});
