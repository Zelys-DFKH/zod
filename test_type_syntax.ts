import { expectTypeOf } from "vitest";

// Test 1: Multi-line with object literal
type TestType1 = { name: string; age: number };
expectTypeOf<TestType1>().toEqualTypeOf<{
  name: string;
  age: number;
}>();

// Test 2: Single line
type TestType2 = { name: string; age: number };
expectTypeOf<TestType2>().toEqualTypeOf<{ name: string; age: number }>();

// Test 3: Using type alias
type TestType3 = { name: string; age: number };
type Expected3 = { name: string; age: number };
expectTypeOf<TestType3>().toEqualTypeOf<Expected3>();
