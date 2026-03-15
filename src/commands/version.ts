/**
 * Version command
 */

// eslint-disable-next-line @typescript-eslint/no-var-requires
const pkg = require('../../package.json');

export function handleVersionCommand(): void {
  console.log(pkg.version);
}
