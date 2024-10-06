import fs from 'fs';
import path from 'path';

interface CoverageSummaryItem {
  total: number,
  covered: number,
  skipped: number,
  pct: number,
}

interface CoverageSummary {
  total: {
    lines: CoverageSummaryItem,
    statements: CoverageSummaryItem,
    functions: CoverageSummaryItem,
    branches: CoverageSummaryItem,
    branchesTrue: CoverageSummaryItem,
  },
}

function formatCoverageDetailName(key: string): string {
  return key.split(/(?=[A-Z])/)
    .map(word => word.toLowerCase())
    .join(' ');
}

function formatCoveragePct(pct: CoverageSummaryItem['pct']): string {
  return `${pct.toFixed(2)} %`;
}

const coverageSummary = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '../coverage/coverage-summary.json'), {
    encoding: 'utf-8',
  }),
) as CoverageSummary;

const itemsToAverage: Array<keyof CoverageSummary['total']> = [
  'lines',
  'statements',
  'functions',
  'branches',
];

const output = `
## Code coverage: ${formatCoveragePct(
  itemsToAverage
    .map(itemKey => coverageSummary.total[itemKey].pct)
    .reduce((acc, curr) => acc + curr, 0) / itemsToAverage.length
)}

### Details:
${
Object.entries(coverageSummary.total)
  .map(([key, {pct}]) => `- ${formatCoverageDetailName(key)}: ${formatCoveragePct(pct)}`)
  .join('\n')
}
`.trim();

process.stdout.write(`${output}\n`);
