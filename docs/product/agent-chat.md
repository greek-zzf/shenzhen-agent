# Global agent chat

Site-wide retrieval chat at `/agent`. This is not a general Shenzhen chatbot.

The run-page **Ask this step** helper (`src/components/copilot/playbook-help.tsx`) stays step-focused. Both surfaces can share the same retrieval and citation types in `src/lib/agent-corpus/`.

## Grounding rules

- Factual claims come only from the founder corpus: SOP YAML under `src/content/sops/`, `docs/field-research/**`, and `docs/field-verification*.md`.
- Do not invent hours, fees, hall street addresses, or NIA nationality lists.
- `last_verified` stays null unless a source already sets it. The chat must not claim field verification.
- Conflicts stay side by side. Resolution is always `verify_at_window`. The model does not pick a winner.
- Refuse VPN how-to, fake registration, friend-bind, yellow-cow SIMs, and other illegal workarounds.
- For an executable errand, prefer a link to `/run/:playbookId` when a playbook matches.
- No sources after retrieval → refuse. Do not guess.

## Source kinds

Each non-trivial claim should carry `sources[]`:

| `kind` | Meaning | Typical `url` |
| --- | --- | --- |
| `official` | Government / operator page | `https://…` |
| `user_report` | Reddit, Xiaohongshu, English guides (non-legal) | thread or article URL |
| `sop` | Playbook YAML note | `/run/pb-XX` |
| `docs` | Field-research / verification markdown | repo path |

Optional `date` and `quote` come from SOP `as_of` / `claim_en` when present.

The Reddit `1t9yeli` thread is included wherever the corpus already cites it.

## Architecture

1. `buildCorpus` chunks YAML (overview, steps, conflicts, stuck nodes) and markdown headings.
2. `retrieveChunks` scores with a BM25-ish keyword ranker (no live scrape).
3. `answerAgentQuestion` hard-refuses, then calls Gemini structured JSON when a key exists, else an extractive quote from the top chunks.
4. `POST /api/agent-chat` returns `{ answerMarkdown, sources[], playbookSuggestions?, refused, live }`.

Session history stays on the client. The API is public and rate-limited.

## Limits

- No multi-user long-term memory.
- No live Reddit / Xiaohongshu scrape inside the request.
- Chat does not replace playbooks.
