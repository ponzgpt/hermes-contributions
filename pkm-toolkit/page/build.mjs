// Renders README.md into a one-page site. Relative links point at the GitHub repo.
import { readFileSync, writeFileSync } from 'node:fs';
import { marked } from 'marked';

const repo = process.argv[2];
const md = readFileSync('README.md', 'utf8');
const title = (md.match(/^#\s+(.+)$/m) || [, repo])[1];
const body = marked.parse(md, { gfm: true }).replace(
  /(href|src)="(?!https?:|#|mailto:)([^"]+)"/g,
  (_, attr, path) => `${attr}="https://github.com/ponzgpt/${repo}/${attr === 'src' ? 'raw' : 'blob'}/main/${path.replace(/^\.\//, '')}"`,
);
const html = readFileSync('page/template.html', 'utf8')
  .replaceAll('{{TITLE}}', title.replace(/[<>&"]/g, ''))
  .replaceAll('{{REPO}}', repo)
  .replace('{{BODY}}', body);
writeFileSync('index.html', html);
