/**
 * Setup command - install skills into AI coding agents
 * Cross-platform: macOS, Windows, Linux
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export type SetupSubcommand = 'skills';

export interface SetupOptions {
  global?: boolean;
  agent?: string;
}

const SKILL_AGENT_PATHS: Array<{
  name: string;
  basePath: string;
  subdir?: string;
}> = [
  { name: 'cursor', basePath: '.cursor', subdir: 'skills' },
  { name: 'codex', basePath: '.codex', subdir: 'skills' },
  { name: 'claude', basePath: '.claude', subdir: 'skills' },
  { name: 'opencode', basePath: '.config/opencode', subdir: 'skills' },
  { name: 'agents', basePath: '.agents', subdir: 'skills' },
  { name: 'windsurf', basePath: '.windsurf', subdir: 'skills' },
  { name: 'continue', basePath: '.continue', subdir: 'skills' },
];

function getSkillsSourceDir(): string {
  // When installed: node_modules/pdf2markdown-cli/dist/commands -> ../../skills
  // When in repo: dist/commands -> ../../skills
  const possiblePaths = [
    path.join(__dirname, '..', '..', 'skills'),
    path.join(__dirname, '..', '..', '..', 'skills'),
    path.join(process.cwd(), 'skills'),
  ];
  for (const p of possiblePaths) {
    const resolved = path.resolve(p);
    if (fs.existsSync(resolved)) {
      return resolved;
    }
  }
  throw new Error(
    'Skills directory not found. Reinstall the package or run from project root.'
  );
}

function copyDir(src: string, dest: string): number {
  let count = 0;
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      count += copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
      count++;
    }
  }
  return count;
}

export async function handleSetupCommand(
  subcommand: SetupSubcommand,
  options: SetupOptions = {}
): Promise<void> {
  if (subcommand !== 'skills') {
    console.error(`Unknown subcommand: ${subcommand}`);
    console.log('\nAvailable:');
    console.log('  skills  Install PDF2Markdown skills into AI coding agents');
    process.exit(1);
  }

  const srcDir = getSkillsSourceDir();
  const homeDir = os.homedir();
  const cwd = process.cwd();
  const targetAgent = options.agent?.toLowerCase();

  const skillDirs = fs.readdirSync(srcDir, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name);

  if (skillDirs.length === 0) {
    console.log('No skills found in package.');
    return;
  }

  const targets: Array<{ name: string; path: string }> = [];

  const installTo = (agent: typeof SKILL_AGENT_PATHS[0], baseDir: string) => {
    if (targetAgent && agent.name !== targetAgent) return;
    const skillsDir = agent.subdir
      ? path.join(baseDir, agent.basePath, agent.subdir)
      : path.join(baseDir, agent.basePath);
    try {
      fs.mkdirSync(skillsDir, { recursive: true });
      for (const skillName of skillDirs) {
        const srcSkill = path.join(srcDir, skillName);
        const destSkill = path.join(skillsDir, skillName);
        copyDir(srcSkill, destSkill);
        targets.push({ name: `${agent.name}/${skillName}`, path: destSkill });
      }
    } catch {
      // Skip on permission/sandbox errors
    }
  };

  // Project-level: .cursor/skills (Cursor), .opencode/skills (OpenCode, matches firecrawl/skills)
  if (!targetAgent || targetAgent === 'project') {
    for (const projectDir of ['.cursor', '.opencode']) {
      const projectSkills = path.join(cwd, projectDir, 'skills');
      try {
        fs.mkdirSync(projectSkills, { recursive: true });
        for (const skillName of skillDirs) {
          const srcSkill = path.join(srcDir, skillName);
          const destSkill = path.join(projectSkills, skillName);
          copyDir(srcSkill, destSkill);
          targets.push({ name: `project/${projectDir}/${skillName}`, path: destSkill });
        }
      } catch (e) {
        console.warn(`  Project (${projectDir}): `, (e as Error).message);
      }
    }
  }

  // User-level: ~/.cursor, ~/.codex, etc.
  for (const agent of SKILL_AGENT_PATHS) {
    installTo(agent, homeDir);
  }

  if (targets.length === 0) {
    console.log('No targets installed.');
    if (targetAgent) {
      console.log(
        `  Agent "${targetAgent}" not found. Valid: ${SKILL_AGENT_PATHS.map((a) => a.name).join(', ')}`
      );
    } else {
      console.log(
        '  Create ~/.cursor, ~/.codex, etc. or run with --agent <name>'
      );
    }
    return;
  }

  console.log('Installed PDF2Markdown skills to:');
  for (const t of targets) {
    console.log(`  ${t.name}: ${t.path}`);
  }
}
