// tests/url.test.ts
// Unit tests for pure utility functions and the Fastify app (via inject).
// Run with: npm test
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { encodeBase62 } from "../src/common/utils/base62.js";
import { generateId } from "../src/common/utils/snowflake.js";
// ────────────────────────────────────────────────────────────
// Base62 Encoding
// ────────────────────────────────────────────────────────────
describe("Base62 Encoding", () => {
    it("encodes 0 as '0'", () => {
        assert.equal(encodeBase62(0n), "0");
    });
    it("encodes single-digit values correctly", () => {
        assert.equal(encodeBase62(1n), "1");
        assert.equal(encodeBase62(9n), "9");
        assert.equal(encodeBase62(10n), "a");
        assert.equal(encodeBase62(35n), "z");
        assert.equal(encodeBase62(36n), "A");
        assert.equal(encodeBase62(61n), "Z");
    });
    it("rolls over to two characters at 62", () => {
        assert.equal(encodeBase62(62n), "10");
    });
    it("produces unique codes for 1000 sequential inputs", () => {
        const codes = new Set();
        for (let i = 0n; i < 1000n; i++) {
            codes.add(encodeBase62(i));
        }
        assert.equal(codes.size, 1000);
    });
    it("encodes large snowflake-sized numbers to short strings", () => {
        // A typical snowflake ID is ~18 digits — the short code should be ≤ 11 chars
        const code = encodeBase62(7199254740992n);
        assert.ok(code.length <= 11, `Expected <= 11 chars, got ${code.length}`);
        assert.ok(code.length > 0);
    });
    it("is deterministic — same input always gives same output", () => {
        const a = encodeBase62(123456789n);
        const b = encodeBase62(123456789n);
        assert.equal(a, b);
    });
});
// ────────────────────────────────────────────────────────────
// Snowflake ID Generator
// ────────────────────────────────────────────────────────────
describe("Snowflake ID Generator", () => {
    it("returns a bigint", () => {
        const id = generateId();
        assert.equal(typeof id, "bigint");
    });
    it("generates positive IDs", () => {
        const id = generateId();
        assert.ok(id > 0n, `Expected positive, got ${id}`);
    });
    it("generates 100 unique IDs in a row", () => {
        const ids = new Set();
        for (let i = 0; i < 100; i++) {
            ids.add(generateId());
        }
        assert.equal(ids.size, 100, "Snowflake IDs must be globally unique");
    });
    it("generates IDs in ascending order (time-ordered)", () => {
        const ids = [];
        for (let i = 0; i < 50; i++) {
            ids.push(generateId());
        }
        for (let i = 1; i < ids.length; i++) {
            assert.ok(ids[i] > ids[i - 1], `ID ${i} was not greater than ID ${i - 1}`);
        }
    });
});
// ────────────────────────────────────────────────────────────
// End-to-End: Snowflake → Base62 Pipeline
// ────────────────────────────────────────────────────────────
describe("Snowflake → Base62 Pipeline", () => {
    it("produces a valid short code from a snowflake ID", () => {
        const id = generateId();
        const code = encodeBase62(id);
        // Short codes should only contain [0-9a-zA-Z]
        assert.match(code, /^[0-9a-zA-Z]+$/);
        // And be reasonably short
        assert.ok(code.length <= 12, `Code too long: ${code} (${code.length} chars)`);
    });
    it("produces unique short codes for unique IDs", () => {
        const codes = new Set();
        for (let i = 0; i < 200; i++) {
            codes.add(encodeBase62(generateId()));
        }
        assert.equal(codes.size, 200);
    });
});
