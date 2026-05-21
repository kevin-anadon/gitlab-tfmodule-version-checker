export interface TerraformModule {
  name: string;
  source: string;
  version: string;
  versionStart: number;
  versionEnd: number;
}

export function extractModules(text: string): TerraformModule[] {
  const modules: TerraformModule[] = [];

  const moduleRegex = /module\s+"([^"]+)"\s*{([\s\S]*?)}/g;
  const sourceRegex = /source\s*=\s*"([^"]+)"/;
  const versionRegex = /version\s*=\s*"([^"]+)"/;

  let match;

  while ((match = moduleRegex.exec(text)) !== null) {
    const block = match[2];

    const sourceMatch = sourceRegex.exec(block);
    const versionMatch = versionRegex.exec(block);

    if (sourceMatch && versionMatch) {
      const absoluteStart =
        match.index + match[0].indexOf(versionMatch[1]);

      const absoluteEnd =
        absoluteStart + versionMatch[1].length;

      modules.push({
        name: match[1],
        source: sourceMatch[1],
        version: versionMatch[1],
        versionStart: absoluteStart,
        versionEnd: absoluteEnd
      });
    }
  }

  return modules;
}