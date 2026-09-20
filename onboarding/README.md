# 0TH Hermes

**Zero To Hero Hermes.** An opinionated shortest path to a working
[Hermes Agent](https://hermes-agent.nousresearch.com/), plus a small script that
tells you the one next thing to do.

> **This is unofficial and temporary.** Nous Research wrote the installer, the
> docs and the tool. Their documentation is genuinely good — the problem is that
> there is a *lot* of it, and a newcomer cannot tell which twenty per cent to
> read first. That is the only gap this fills. When Nous ships a first-run
> experience that decides for you, delete this repository.

---

## The problem this solves

Installing Hermes is one line and it works. What stops people is the next hour.

The docs are around 1,900 documents. Setup offers three modes. There are more
than twenty model providers to choose between. There is a gateway, a tool
gateway, skills, plugins, MCP servers, cron, profiles, secrets backends, an
egress proxy, checkpoints, bot mode. Every one of those is worth having
eventually, and none of them is worth having in the first ten minutes.

A newcomer reads that and does not think *"what a rich tool"*. They think
*"which of these do I need before it will answer me?"*

The answer is: **four things.** This repository is that answer, and a script
that checks which of the four you have done.

---

## The ten-minute path

### 1. Install

macOS or Windows, and you want the desktop app too — download the installer from
[hermes-agent.nousresearch.com](https://hermes-agent.nousresearch.com/).

Command line only:

```bash
curl -fsSL https://hermes-agent.nousresearch.com/install.sh | bash
```

Windows, in PowerShell:

```powershell
iex (irm https://hermes-agent.nousresearch.com/install.ps1)
```

The installer brings its own Python, Node, ripgrep and ffmpeg. You need `git`.
On Linux you also need `curl` and `xz-utils`, and `build-essential` if you want
the desktop app. Run `./0th check` first and it will tell you.

### 2. Reload your shell

```bash
source ~/.bashrc    # or ~/.zshrc, or just open a new terminal
```

**Do not skip this.** It is the single most common reason people believe the
install failed. The installer put `hermes` on your PATH; the shell you ran it
from does not know that yet.

### 3. Choose a provider

This is the step that actually blocks people, because there are twenty-odd
options and no obvious default. Here is the default:

```bash
hermes setup --portal
```

One OAuth login. It sets Nous Portal as your provider, gives you 300+ models,
and switches on the Tool Gateway — web search, image generation, text to speech,
a cloud browser — without you managing a single API key. It is a paid
subscription, and it is the fastest way to a working agent by a wide margin.

**If you would rather not:**

| You have | Run | Notes |
|---|---|---|
| An OpenRouter key | `hermes model` → OpenRouter | Many models, one key, pay per token |
| An Anthropic key or Max plan | `hermes model` → Anthropic | OAuth needs Max **plus** credits |
| A ChatGPT or Codex subscription | `hermes model` → ChatGPT/Codex | Device-code login |
| A model on your own hardware | `hermes model` → custom endpoint | See [local models](#running-a-model-on-your-own-hardware) |
| No idea | `hermes setup --portal` | Come back and change it later; it is one command |

You can change provider at any time with `hermes model`. Nothing about this
decision is permanent, which is the part nobody tells you, and which is why
agonising over it now is wasted time.

### 4. Prove it works

```bash
hermes
```

Ask it something ordinary. If it answers, setup is finished.

**Do not add anything else until it answers.** Not the gateway, not skills, not
cron. If you bolt on four subsystems and then something breaks, you have four
suspects instead of one. Get a clean conversation first.

---

## What to ignore, for now

Everything below is good and you will want some of it. None of it belongs in
your first session.

| Thing | What it is | Come back when |
|---|---|---|
| **Gateway** | Puts Hermes on Telegram, Discord, Slack, WhatsApp, Signal, email | You want to message it from your phone |
| **Skills** | Markdown files that teach it a capability | You have repeated yourself twice |
| **Cron** | Scheduled runs | You want a morning briefing |
| **MCP servers** | Tools it can call | You need it to reach a system it cannot reach |
| **Profiles / Bot mode** | Several named agents, each with its own memory | One agent is not enough |
| **Egress proxy** | Controls and credentials for outbound traffic | You are deploying this somewhere shared |
| **Checkpoints** | Filesystem snapshots before destructive edits | You let it write to a real repository |
| **Secrets backends** | 1Password, Bitwarden | Your keys should not sit in a dotfile |

The full documentation is at
[hermes-agent.nousresearch.com/docs](https://hermes-agent.nousresearch.com/docs).
Read it *after* step 4, not before.

---

## The script

```bash
curl -fsSL https://raw.githubusercontent.com/ponzgpt/0th-hermes/main/0th -o 0th && sh 0th
```

It is one self-contained POSIX shell script; `git clone https://github.com/ponzgpt/0th-hermes.git` works too.

| Command | What it does |
|---|---|
| `./0th` or `./0th next` | Looks at your machine and prints the one next step |
| `./0th check` | Preflight: git, curl, xz, disk space, existing install |
| `./0th install` | Runs the official installer, then tells you to reload your shell |
| `./0th doctor` | `hermes doctor`, plus the four checks it does not cover |
| `./0th local URL` | Points Hermes at a local OpenAI-compatible endpoint |

`next` is the useful one. It walks the state of your machine in order and stops
at the first thing that is not done, so you get one instruction rather than a
checklist:

```
Next step
  ! Hermes is installed, but this shell cannot see it.

  source ~/.bashrc   # or ~/.zshrc, or open a new terminal

    This is the number one reason people think the install failed.
```

**The script never reimplements the installer.** It shells out to the official
one at `hermes-agent.nousresearch.com/install.sh` and otherwise only reads
state. There is a check in `check.sh` that fails if that ever stops being true —
a helper that quietly forks upstream's install logic is worse than no helper.

---

## Running a model on your own hardware

Not in the ten-minute path, but it is why a lot of people are here, and the docs
scatter it across several pages.

If you already have an OpenAI-compatible server running — llama.cpp's
`llama-server`, Ollama, vLLM, LM Studio — then:

```bash
./0th local http://127.0.0.1:8080/v1
```

That checks the endpoint actually answers before it sends you into the wizard,
which saves the most common failure: configuring Hermes against a server that
was never started.

Do the wiring through `hermes model` rather than by editing `config.yaml` by
hand. The wizard also sets the context length and the auth mode, and those are
easy to get wrong silently.

Official page:
[Local Models](https://hermes-agent.nousresearch.com/docs/user-guide/local-models).

---

## When it breaks

```bash
./0th doctor
```

That runs `hermes doctor` and then adds four checks aimed at the mistakes a
newcomer actually makes:

1. **`hermes` is not on PATH** — installed, shell not reloaded.
2. **No config** — installed, never set up.
3. **No model provider** — set up, but nothing chosen, so it cannot answer.
4. **Gateway configured but not running** — with the log path, because that is
   the next thing you will be asked for.

Where things live:

```
~/.hermes/config.yaml        settings
~/.hermes/.env               API keys
~/.hermes/auth.json          OAuth credentials
~/.hermes/logs/gateway.log   gateway log
~/.hermes/hermes-agent/      the code itself
```

Set `HERMES_HOME` to move all of that somewhere else.

---

## Why this exists

I am a technical support person by trade. Ten years of it, most of them stood in
front of somebody holding a machine that was not doing what they wanted.

The gap between *"the documentation is complete"* and *"a normal person can get
this working"* is not a documentation problem. It is a **decision** problem. The
docs correctly describe twenty providers because there are twenty providers. The
newcomer needs one of them named, with permission to change it later.

That is the only thing this repository does.

---

## Scope

- **Unofficial.** Not affiliated with, endorsed by or produced for Nous Research.
- **Not a fork.** No Hermes code is vendored here. `./0th install` runs their
  installer, unmodified.
- **Aimed at a moving target.** Written against the docs as of September 2026.
  If a command here disagrees with
  [the official docs](https://hermes-agent.nousresearch.com/docs), the official
  docs are right — please open an issue.
- **Meant to become unnecessary.** The best outcome is that Nous ships a first
  run that makes this pointless.

MIT. See [LICENSE](LICENSE).
