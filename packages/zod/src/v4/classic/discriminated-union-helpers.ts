/**
 * Helper types for narrowing discriminated unions with enum-based discriminators.
 * Enables Extract<DiscriminatedUnion, { discriminator: EnumValue }> to work properly
 * when the discriminator field uses z.enum() instead of individual z.literal() calls.
 */

/**
 * Expands enum-based discriminators in union members.
 * If a member has a discriminator field with type A | B, it expands to:
 * - Original member with discriminator = A
 * - Original member with discriminator = B
 *
 * @example
 * type Input = { type: 'a' | 'b', options: {...} } | { type: 'c' | 'd' }
 * type Expanded = ExpandDiscriminatorUnion<Input, 'type'>
 * // Result: { type: 'a', options: {...} } | { type: 'b', options: {...} } | { type: 'c' } | { type: 'd' }
 */
export type ExpandDiscriminatorUnion<T, K extends PropertyKey> = T extends any
  ? T extends Record<K, infer V>
    ? V extends any
      ? Omit<T, K> & Record<K, V>
      : never
    : T
  : never;

/**
 * Narrows a discriminated union to members matching a specific discriminator value.
 * Works with both literal and enum-based discriminators by using ExpandDiscriminatorUnion.
 *
 * @example
 * type Demo = { type: 'a' | 'b', options: {...} } | { type: 'c' | 'd' }
 * type Narrowed = NarrowDiscriminatedUnion<Demo, 'type', 'a' | 'b'>
 * // Result: { type: 'a' | 'b', options: {...} }
 */
export type NarrowDiscriminatedUnion<T, K extends PropertyKey, V extends PropertyKey> = Extract<
  ExpandDiscriminatorUnion<T, K>,
  Record<K, V>
>;
