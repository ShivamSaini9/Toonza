import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// Recognizes lines like:
//   Neha: Where are you going?
//   KARAN (angry): I don't know.
//   Narrator - The sun was setting.
// Anything without a "Name:" / "Name -" prefix is bucketed under "Narrator".
const LINE_PATTERN = /^\s*([A-Za-z][A-Za-z0-9 .'_-]{0,40}?)\s*(?:\([^)]*\))?\s*[:\-–—]\s*(.+)$/;

const normalizeName = (raw) =>
  raw
    .trim()
    .replace(/\s+/g, " ")
    .replace(/^./, (c) => c.toUpperCase());

const parseScript = (script) => {
  const rawLines = script
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const order = [];
  const byCharacter = new Map();

  const pushLine = (character, text) => {
    if (!byCharacter.has(character)) {
      byCharacter.set(character, []);
      order.push(character);
    }
    byCharacter.get(character).push(text);
  };

  for (const line of rawLines) {
    const match = line.match(LINE_PATTERN);
    if (match) {
      const character = normalizeName(match[1]);
      const text = match[2].trim();
      // Guard against false positives like a stray "http://..." or a
      // sentence containing a colon; require the "name" part to look like
      // a name (no more than 4 words).
      if (character.split(" ").length <= 4 && text.length > 0) {
        pushLine(character, text);
        continue;
      }
    }
    pushLine("Narrator", line);
  }

  return order.map((character) => ({
    character,
    lineCount: byCharacter.get(character).length,
    lines: byCharacter.get(character),
  }));
};

const separateDialogue = asyncHandler(async (req, res) => {
  const { script } = req.body;

  if (!script || script.trim().length < 5) {
    throw new ApiError(400, "Please paste a script with at least a few lines");
  }
  if (script.length > 50000) {
    throw new ApiError(400, "Script is too long (50,000 character limit)");
  }

  const characters = parseScript(script);

  return res
    .status(200)
    .json(new ApiResponse(200, { characters }, "Script separated by character"));
});

export { separateDialogue };
