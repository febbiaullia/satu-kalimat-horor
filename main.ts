// One Line, One Chill
// make.fun bounty: u-azazex-one-line-one-chill-6d4d5488
//
// The entry is one line of horror — a single sentence that has to
// frighten a reader in one breath — stored as one string constant in
// this repository. Running the program writes the line into the
// harness output directory as entry.txt, with no trailing newline,
// then reads the copy back and checks it against the original byte
// for byte, so the two graded runs always produce identical output.
// No network is used and nothing is read from outside the
// repository: the one line is the deliverable.

import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// The entry: one line, one sentence. Every morning the chair is
// pulled out, and the cushion is still warm — someone sat at the
// table all night, listening.
const LINE =
  "Every morning the chair at the end of the table is pulled out, and the cushion is still warm from someone who sat there all night, listening.";

// The gate allows 1 to 200 characters (code points) in total.
const MIN_CHARS = 1;
const MAX_CHARS = 200;

// The harness sets MAKEFUN_OUTPUT_DIR; without it, write to /output.
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
const outputPath = join(outputDir, "entry.txt");

function fail(message: string): never {
  console.error(message);
  process.exit(1);
}

// Check the line before writing it: 1–200 characters in total
// (counted in code points, so an emoji or accented letter counts
// once), not only white space, exactly one line with no "\n" and no
// "\r", and no leading or trailing whitespace — otherwise the gate
// would refuse the entry instead of judging it.
function checkLine(text: string): void {
  const chars = [...text].length;
  if (chars < MIN_CHARS || chars > MAX_CHARS) {
    fail(`entry must be ${MIN_CHARS}–${MAX_CHARS} characters, got ${chars}`);
  }
  if (text.trim().length === 0) {
    fail("entry must not be only white space");
  }
  if (text.includes("\n") || text.includes("\r")) {
    fail("entry must be exactly one line");
  }
  if (text !== text.trim()) {
    fail("entry must not start or end with whitespace");
  }
  // One sentence: it ends with a full stop and holds no other
  // sentence-ending punctuation before it.
  if (!text.endsWith(".")) {
    fail("entry must be a single sentence ending with a full stop");
  }
  if (/[.?!][^"]/.test(text.slice(0, -1))) {
    fail("entry must be a single sentence");
  }
  // The gate reads UTF-8 text: refuse a text that does not survive a
  // UTF-8 round trip unchanged (for example a lone surrogate), so what
  // is written is exactly the text that was checked.
  if (Buffer.from(text, "utf8").toString("utf8") !== text) {
    fail("entry must be valid UTF-8 text");
  }
}

function sha256Hex(bytes: Buffer): string {
  return createHash("sha256").update(bytes).digest("hex");
}

checkLine(LINE);
console.log(`Line: ${LINE}`);
console.log(`Entry (${[...LINE].length} characters):`);
console.log(LINE);
console.log(`Entry sha256: ${sha256Hex(Buffer.from(LINE, "utf8"))}`);

mkdirSync(outputDir, { recursive: true });
writeFileSync(outputPath, LINE, "utf8");

// Read the copy back and prove it matches the original byte for byte.
const written = readFileSync(outputPath);
const original = Buffer.from(LINE, "utf8");
if (!written.equals(original)) {
  fail(
    `copy mismatch: ${outputPath} is ${written.length} bytes, ` +
      `expected ${original.length}`,
  );
}

console.log(`Wrote ${written.length} bytes to ${outputPath} (byte-identical copy)`);
