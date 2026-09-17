import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import test from "node:test";

const repositoryRoot = new URL("../../", import.meta.url);
const skillsRoot = new URL(".agents/skills/", repositoryRoot);

test("documents the OpenSpec Codex skill refresh workflow", async () => {
  const agents = await readFile(new URL("AGENTS.md", repositoryRoot), "utf8");
  const checklist = await readFile(
    new URL("AGENTS_TEMPLATE_USAGE_CHECKLIST.md", repositoryRoot),
    "utf8",
  );
  const guidance = `${agents}\n${checklist}`;

  assert.match(guidance, /openspec update \./);
  assert.match(guidance, /openspec doctor --json/);
  assert.match(guidance, /generatedBy.*openspec --version/is);
  assert.match(guidance, /\$openspec-\*/);
  assert.match(guidance, /reopen Codex/i);
});

test("keeps OpenSpec skill folders discoverable by Codex", async () => {
  const target = await readFile(new URL(".openspec-target", skillsRoot), "utf8");
  assert.equal(target.trim(), "codex");

  const skillDirectories = (await readdir(skillsRoot, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory() && entry.name.startsWith("openspec-"));

  assert.ok(skillDirectories.length > 0, "expected generated OpenSpec skills");

  for (const directory of skillDirectories) {
    const skill = await readFile(
      new URL(`${directory.name}/SKILL.md`, skillsRoot),
      "utf8",
    );
    const frontmatterName = skill.match(/^name:\s*(.+)$/m)?.[1]?.trim();
    assert.equal(frontmatterName, directory.name);
  }
});
