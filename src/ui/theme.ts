import pc from "picocolors";

export const paint = {
  brand: (value: string) => pc.bold(pc.cyan(value)),
  accent: (value: string) => pc.magenta(value),
  heading: (value: string) => pc.bold(pc.magenta(value)),
  success: (value: string) => pc.green(value),
  warning: (value: string) => pc.yellow(value),
  danger: (value: string) => pc.red(value),
  info: (value: string) => pc.cyan(value),
  muted: (value: string) => pc.dim(value)
};

export function banner(version: string): string {
  return `\n${paint.brand("◆ Commitry")} ${paint.accent(`v${version}`)}\n${paint.muted("  Try before you commit.")}\n`;
}

export function section(title: string): string { return paint.heading(`◆ ${title}`); }

export function statusLine(branch: string, staged: number, unstaged: number, untracked: number, conflicts = 0): string {
  const parts = [
    paint.accent(branch),
    paint.success(`${staged} staged`),
    paint.warning(`${unstaged} unstaged`),
    paint.info(`${untracked} untracked`)
  ];
  if (conflicts) parts.push(paint.danger(`${conflicts} conflicted`));
  return parts.join(paint.muted("  •  "));
}
