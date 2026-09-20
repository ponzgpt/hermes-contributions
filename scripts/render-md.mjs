// A Markdown file rendered into one page, in the house shell.
//
// 0th-hermes and hermes-pkm-toolkit each carried a byte-identical copy of this
// with its own template; this is the one that survived. Relative links in the
// source point at files in this repo, so they are rewritten to GitHub.
import { readFileSync } from 'node:fs'
import { marked } from 'marked'
import { noticeHtml } from './notice.mjs'

const REPO = 'https://github.com/ponzgpt/hermes-contributions'

export function renderMarkdown({ markdown, base, title, subtitle, active }) {
  const body = marked
    .parse(markdown, { gfm: true })
    .replace(
      /(href|src)="(?!https?:|#|mailto:|\/)([^"]+)"/g,
      (_, attr, path) =>
        `${attr}="${REPO}/${attr === 'src' ? 'raw' : 'blob'}/main/${base}/${path.replace(/^\.\//, '')}"`
    )
  return shell({ title, subtitle, active, body })
}

export function shell({ title, subtitle, active, body }) {
  const nav = [
    ['/', 'Overview'],
    ['/onboarding/', 'Onboarding'],
    ['/field-guide/', 'Field guide'],
    ['/pkm-toolkit/', 'PKM toolkit'],
  ]
    .map(([href, label]) =>
      href === active
        ? `<a href="${href}" aria-current="page">${label}</a>`
        : `<a href="${href}">${label}</a>`
    )
    .join('')
  return readFileSync(new URL('./template.html', import.meta.url), 'utf8')
    .replaceAll('{{TITLE}}', esc(title))
    .replaceAll('{{SUBTITLE}}', esc(subtitle))
    .replace('{{NAV}}', nav)
    .replace('{{NOTICE}}', noticeHtml())
    .replace('{{BODY}}', body)
}

const esc = (s) =>
  String(s).replace(
    /[<>&"]/g,
    (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' })[c]
  )
