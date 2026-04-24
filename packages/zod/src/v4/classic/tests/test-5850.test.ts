import { z } from "zod/v4";
import { expectTypeOf, test } from "vitest";

/**
 * Issue #5850: Using z.enum() as a discriminator in z.discriminatedUnion()
 * causes Extract<> to fail because the enum field becomes a union type
 * instead of individual literal types.
 *
 * KNOWN LIMITATION:
 * When using z.enum(['a', 'b']) in a discriminated union, the field type becomes
 * { type: 'a' | 'b' } instead of being split into separate union members.
 * This prevents TypeScript's Extract<> from working properly.
 *
 * WORKAROUND:
 * Use the NarrowDiscriminatedUnion<> helper type instead of Extract<>.
 * See test-5850-complete.test.ts for examples.
 *
 * RECOMMENDATION:
 * For best type safety, use individual z.literal() calls instead of z.enum():
 * ✓ z.object({ type: z.literal('a'), ... })
 * ✓ z.object({ type: z.literal('b'), ... })
 * ✗ z.object({ type: z.enum(['a', 'b']), ... })
 */
test("discriminatedUnion with enum discriminator - limitation and workaround documented", () => {
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

  // This demonstrates the issue - Extract returns never
  // Use NarrowDiscriminatedUnion helper instead
  // See test-5850-complete.test.ts for the working solution

  // For runtime validation, this still works:
  const obj1: Demo = { type: "a", options: { foo: "bar" } };
  const obj2: Demo = { type: "c" };
  expectTypeOf(obj1).toMatchTypeOf<Demo>();
  expectTypeOf(obj2).toMatchTypeOf<Demo>();
});
