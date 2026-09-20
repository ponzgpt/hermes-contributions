/* Hermes' slash commands, and the matching the palette does over them.
   Same shape as the CLI: type after the slash, Tab or Enter takes the top hit. */

export const COMMANDS = [
  { name: '/help', desc: 'Show command help' },
  { name: '/model', desc: 'Show or change the current model' },
  { name: '/tools', desc: 'List currently available tools' },
  { name: '/skills browse', desc: 'Browse the skills hub and the official optional skills' },
  { name: '/skin', desc: 'Show or switch the active CLI skin' },
  { name: '/personality', desc: "Set a predefined personality to change the agent's tone" },
  { name: '/memory', desc: 'Inspect what the agent has kept about you' },
  { name: '/context', desc: 'Visual context-usage breakdown — glyph block grid' },
  { name: '/status', desc: 'Session info — model, profile, tokens, duration' },
  { name: '/sessions', desc: 'Open an interactive session picker' },
  { name: '/bg', desc: 'Run a prompt in a separate background session' },
  { name: '/btw', desc: 'Ask a side question about the current conversation' },
  { name: '/steer', desc: 'Inject a message into the current run' },
  { name: '/reasoning high', desc: 'Increase reasoning effort' },
  { name: '/voice on', desc: 'Enable CLI voice mode — Ctrl+B to record' },
  { name: '/compress', desc: 'Trigger context compression' },
  { name: '/usage', desc: 'Detailed breakdown, including per-category costs' },
  { name: '/title', desc: 'Name the current session' },
  { name: '/stop', desc: 'Cancel the turn and any foreground work' },
]

export const SHORTCUTS = [
  { keys: 'Tab', does: 'accept the suggestion / complete a slash command' },
  { keys: 'Alt+Enter', does: 'new line' },
  { keys: 'Ctrl+B', does: 'start or stop voice recording' },
  { keys: 'Ctrl+G', does: 'open the draft in $EDITOR' },
  { keys: 'Ctrl+S', does: 'stash the prompt' },
  { keys: 'Alt+V', does: 'paste an image from the clipboard' },
  { keys: 'Ctrl+C', does: 'interrupt — twice in 2s to exit' },
  { keys: '!cmd', does: 'shell mode, no model turn' },
]

const norm = (s) => s.toLowerCase().replace(/^\//, '').trim()

/** Score one command against a query. Higher is better; 0 means no match. */
export function score(command, query) {
  const q = norm(query)
  if (!q) return 1
  const name = norm(command.name)
  if (name === q) return 100
  if (name.startsWith(q)) return 80 - name.length
  if (name.includes(q)) return 50 - name.length
  if (command.desc.toLowerCase().includes(q)) return 20
  return 0
}

/** The palette's visible list: matches only, best first, original order on ties. */
export function filterCommands(query, commands = COMMANDS) {
  return commands
    .map((c, i) => ({ c, i, s: score(c, query) }))
    .filter((r) => r.s > 0)
    .sort((a, b) => b.s - a.s || a.i - b.i)
    .map((r) => r.c)
}

/** Wrap the selection around the list; an empty list stays at 0. */
export function moveIndex(index, step, length) {
  if (length <= 0) return 0
  return (index + step + length) % length
}
