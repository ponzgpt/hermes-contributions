/* Wiring. Everything with logic worth checking lives in its own module and is
   tested; this file only connects those modules to the document. */

import {
  SKINS,
  applySkin,
  findSkin,
  nextSkin,
  readStoredSkin,
  skinFromQuery,
  skinVars,
  storeSkin,
  STORAGE_KEY,
} from './skins.js'
import { COMMANDS, SHORTCUTS, filterCommands, moveIndex } from './commands.js'
import { runSettle } from './settle.js'
import { play } from './transcript.js'

const $ = (sel) => document.querySelector(sel)
const $$ = (sel) => Array.from(document.querySelectorAll(sel))

/* ----------------------------------------------------------------- toast -- */
const toastEl = $('#toast')
let toastTimer = 0
function toast(message) {
  toastEl.textContent = message
  toastEl.classList.add('is-on')
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => toastEl.classList.remove('is-on'), 2200)
}

/* ----------------------------------------------------------------- skins -- */
let current = skinFromQuery(location.search) || readStoredSkin()

function paint(slug, { announce = false } = {}) {
  const skin = applySkin(slug)
  current = skin.slug
  storeSkin(skin.slug)
  try {
    localStorage.setItem(
      'hermes-skin-vars',
      JSON.stringify({ slug: skin.slug, vars: skinVars(skin) })
    )
  } catch {
    /* the pre-paint script will just fall back to nous */
  }
  $('#skin-name').textContent = skin.name
  $('#shot-skin').textContent = skin.name
  $$('.skin-btn').forEach((b) =>
    b.setAttribute('aria-pressed', String(b.dataset.skin === skin.slug))
  )
  settleHeadline()
  if (announce) toast(`/skin ${skin.slug}`)
}

const skinList = $('#skin-list')
skinList.innerHTML = SKINS.map(
  (s) => `
  <li>
    <button class="skin-btn" type="button" data-skin="${s.slug}" aria-pressed="false"
            style="background:${s.bg};color:${s.fg}">
      <span class="skin-btn__swatch" style="border-color:${s.fg}33">
        <i style="background:${s.fg}"></i>
        <i style="background:${s.accent}"></i>
        <i style="background:${s.ok}"></i>
      </span>
      <span class="skin-btn__label">
        <b style="color:${s.accent}">${s.name}</b>
        <small style="color:${s.fg}99">${s.note}</small>
      </span>
    </button>
  </li>`
).join('')

skinList.addEventListener('click', (e) => {
  const btn = e.target.closest('.skin-btn')
  if (btn) paint(btn.dataset.skin, { announce: true })
})
$('#skin-next').addEventListener('click', () => paint(nextSkin(current).slug, { announce: true }))

/* -------------------------------------------------------------- headline -- */
const headline = $('#headline')
let stopSettle = () => {}
function settleHeadline() {
  stopSettle()
  headline.classList.add('is-settling')
  stopSettle = runSettle(headline, headline.dataset.text, {
    duration: 1500,
    onDone: () => headline.classList.remove('is-settling'),
  })
}
if (document.fonts?.ready) document.fonts.ready.then(settleHeadline)
else settleHeadline()

/* ------------------------------------------------------------ transcripts -- */
const esc = (s) => s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c])

function renderTerm(el, lines, done) {
  el.innerHTML =
    lines.map((l) => `<span class="${l.kind}">${esc(l.text)}</span>`).join('\n') +
    (done ? '\n<span class="in"><span class="cursor"></span></span>' : '')
}

/* Real output from ./0th next in two states — the shell-not-reloaded case that
   stops most newcomers, then the finished one. Copied from the script in
   ../../onboarding/0th and held to it by tests/hero.test.js: a marketing page
   that invents its own screenshots is exactly what this repo is not. */
const HERO_LINES = [
  { kind: 'in', text: './0th next' },
  { kind: 'note', text: 'Next step' },
  { kind: 'out', text: '  ! Hermes is installed, but this shell cannot see it.' },
  { kind: 'note', text: '' },
  { kind: 'out', text: '  source ~/.bashrc   # or ~/.zshrc, or open a new terminal' },
  { kind: 'note', text: '' },
  { kind: 'note', text: '    This is the number one reason people think the install failed.' },
  { kind: 'note', text: '' },
  { kind: 'in', text: './0th next' },
  { kind: 'note', text: 'Next step' },
  { kind: 'tool', text: '  \u2713 Installed, configured, and a provider is set.' },
  { kind: 'note', text: '' },
  { kind: 'out', text: '  Prove it works before adding anything else:' },
  { kind: 'note', text: '' },
  { kind: 'out', text: '  hermes' },
]

play($('#hero-term'), HERO_LINES, { render: renderTerm, speed: 2.2 })

/* --------------------------------------------------------- command list -- */
const cmdPreview = $('#cmd-preview')
function renderPreview(query = '') {
  const hits = filterCommands(query).slice(0, 6)
  cmdPreview.innerHTML = hits
    .map((c) => `<li><b>${c.name}</b><span>${esc(c.desc)}</span></li>`)
    .join('')
}
renderPreview()

/* --------------------------------------------------------------- palette -- */
const dialog = $('#palette')
const input = $('#palette-input')
const list = $('#palette-list')
let hits = COMMANDS
let index = 0

function renderPalette() {
  hits = filterCommands(input.value)
  index = Math.min(index, Math.max(0, hits.length - 1))
  list.innerHTML = hits.length
    ? hits
        .map(
          (c, i) =>
            `<li role="option" data-i="${i}" aria-selected="${i === index}">` +
            `<b>${c.name}</b><span>${esc(c.desc)}</span></li>`
        )
        .join('')
    : '<li class="palette__empty" role="option" aria-selected="false">No command matches. Try /help.</li>'
}

function openPalette() {
  input.value = ''
  index = 0
  renderPalette()
  if (!dialog.open) dialog.showModal()
  input.focus()
}

function run(command) {
  dialog.close()
  if (!command) return
  if (command.name === '/skin') {
    paint(nextSkin(current).slug, { announce: true })
    return
  }
  if (command.name === '/help') {
    sheet.showModal()
    return
  }
  toast(`${command.name} — ${command.desc.toLowerCase()}`)
}

input.addEventListener('input', () => {
  index = 0
  renderPalette()
  renderPreview(input.value)
})

input.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowDown' || (e.key === 'n' && e.ctrlKey)) {
    e.preventDefault()
    index = moveIndex(index, 1, hits.length)
    renderPalette()
  } else if (e.key === 'ArrowUp' || (e.key === 'p' && e.ctrlKey)) {
    e.preventDefault()
    index = moveIndex(index, -1, hits.length)
    renderPalette()
  } else if (e.key === 'Tab') {
    e.preventDefault()
    if (hits[index]) {
      input.value = hits[index].name.replace(/^\//, '')
      renderPalette()
    }
  } else if (e.key === 'Enter') {
    e.preventDefault()
    run(hits[index])
  }
})

list.addEventListener('click', (e) => {
  const li = e.target.closest('li[data-i]')
  if (li) run(hits[Number(li.dataset.i)])
})

$('#palette-open').addEventListener('click', openPalette)
$('#palette-open-2').addEventListener('click', openPalette)

/* ------------------------------------------------------------- shortcuts -- */
const sheet = $('#sheet')
$('#sheet-list').innerHTML = SHORTCUTS.map(
  (s) => `<li><kbd>${esc(s.keys)}</kbd><span>${esc(s.does)}</span></li>`
).join('')

/* ------------------------------------------------------- global keyboard -- */
const typing = (el) => el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA')

document.addEventListener('keydown', (e) => {
  if (e.metaKey || e.ctrlKey || e.altKey || typing(e.target)) return
  if (e.key === '/') {
    e.preventDefault()
    openPalette()
  } else if (e.key === '?') {
    e.preventDefault()
    if (!sheet.open) sheet.showModal()
  } else if (e.key === 's') {
    paint(nextSkin(current).slug, { announce: true })
  }
})

/* ----------------------------------------------------------- install box -- */
const cmdEl = $('#install-cmd')
$$('.install-box__tabs button').forEach((tab) => {
  tab.addEventListener('click', () => {
    $$('.install-box__tabs button').forEach((t) => {
      t.classList.toggle('is-on', t === tab)
      t.setAttribute('aria-selected', String(t === tab))
    })
    cmdEl.textContent = tab.dataset.cmd
  })
})
$('#install-copy').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(cmdEl.textContent)
    toast('Copied')
  } catch {
    toast('Select and copy it')
  }
})

/* ---------------------------------------------------------- footer curve -- */
/* Skills the agent has written, session over session. It only goes up. */
function drawCurve() {
  const el = $('#footer-art')
  const cols = Math.max(48, Math.min(180, Math.floor(el.clientWidth / 6)))
  const rows = 11
  const grid = Array.from({ length: rows }, () => new Array(cols).fill(' '))
  for (let x = 0; x < cols; x++) {
    const t = x / (cols - 1)
    const h = Math.pow(t, 1.7) * (rows - 1.5)
    const y = rows - 1 - Math.round(h)
    for (let k = y; k < rows; k++) grid[k][x] = k === y ? '▄' : '░'
  }
  el.textContent = grid.map((r) => r.join('')).join('\n')
}
drawCurve()
addEventListener('resize', drawCurve)

/* Restore the skin the visitor last chose (or nous), and light up the grid. */
paint(current)
try {
  if (!localStorage.getItem(STORAGE_KEY)) storeSkin(findSkin(current).slug)
} catch {
  /* fine */
}
