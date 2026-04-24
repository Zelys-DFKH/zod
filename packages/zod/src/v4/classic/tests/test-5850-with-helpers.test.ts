import { expectTypeOf, test } from "vitest";
import { type NarrowDiscriminatedUnion } from "../discriminated-union-helpers.js";
import { z } from "zod/v4";

test("discriminatedUnion with enum discriminator using helper types", () => {
  const TypesWithOptions = z.enum(['a', 'b'])
  const TypesWithoutOptions = z.enum(['c', 'd'])
  const AllTypes = z.union([TypesWithOptions, TypesWithoutOptions])
  type AllTypes = z.infer<typeof AllTypes>
  expectTypeOf<AllTypes>().toMatchTypeOf<'a' | 'b' | 'c' | 'd'>()

  const Demo = z.discriminatedUnion('type', [
    z.object({
      type: TypesWithOptions,
      options: z.object({ foo: z.string() })
    }),
    z.object({
      type: TypesWithoutOptions
    })
  ])

  type Demo = z.infer<typeof Demo>

  // Using the helper types instead of Extract directly
  type WithOptionsNarrowed = NarrowDiscriminatedUnion<Demo, 'type', 'a' | 'b'>
  type WithoutOptionsNarrowed = NarrowDiscriminatedUnion<Demo, 'type', 'c' | 'd'>
  
  expectTypeOf<WithOptionsNarrowed>().toMatchTypeOf<{ type: 'a' | 'b', options: { foo: string } }>()
  expectTypeOf<WithoutOptionsNarrowed>().toMatchTypeOf<{ type: 'c' | 'd' }>()

  function getWithTypes<T extends AllTypes>(
    _types: T[]
  ): Array<NarrowDiscriminatedUnion<Demo, 'type', T>> {
    return [] as any;
  }

  // These should now type-check correctly with the helpers
  const withOptions = getWithTypes(['a', 'b'] as const)
  expectTypeOf<typeof withOptions>().toMatchTypeOf<Array<{ type: 'a' | 'b', options: { foo: string } }>>()

  const withoutOptions = getWithTypes(['c', 'd'] as const)
  expectTypeOf<typeof withoutOptions>().toMatchTypeOf<Array<{ type: 'c' | 'd' }>>()
});
