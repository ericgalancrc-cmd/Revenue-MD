# Downloading already-worked claims into RevenueMD

How claims that a biller or coder has already worked at a third-party billing
company (Assertus, Inmediata, Practice Fusion, etc.) get into RevenueMD for
pre-submission scrubbing.

---

## The big picture

RevenueMD does **not** replace the biller's existing system — it sits between
that system and the clearinghouse and catches payer-specific issues *before*
the claim is transmitted.

```
   ┌──────────────────────┐     ┌──────────────┐     ┌──────────┐     ┌───────────────┐
   │ Biller/coder works   │     │              │     │          │     │               │
   │ the claim in their   │ ──► │  RevenueMD   │ ──► │  Scrub   │ ──► │ Clearinghouse │
   │ billing system       │     │  (download)  │     │  & fix   │     │ (Inmediata…)  │
   │ (Assertus, etc.)     │     │              │     │          │     │               │
   └──────────────────────┘     └──────────────┘     └──────────┘     └───────────────┘
```

Every claim that comes in has already been touched by a human upstream.
RevenueMD's job is additive: a payer-aware rules engine + AI scrubber that
finds Plan Vital / Triple-S / MMM / ASES issues a general-purpose billing
system won't catch.

---

## Three ways to download claims — ranked by how soon they're realistic

### (a) Manual file export — **available today**

The biller exports an EDI 837 (or CSV) from their billing system the same way
they would when sending it to a clearinghouse, then drops that file into
RevenueMD. Every billing system in Puerto Rico supports this. **No vendor
agreement required.**

This is what the current Intake → "Import claims" tab is built around — see
`src/App.jsx:480-539`.

### (b) SFTP drop-folder — **short-term roadmap**

The billing company writes a nightly 837 batch to a shared SFTP folder;
RevenueMD polls that folder and ingests automatically. This is the standard
"first integration" pattern in PR healthcare — common enough that most vendors
will set it up with just a data-sharing letter, not a full API contract.

### (c) Direct API — **long-term roadmap**

A real-time pull via the vendor's REST or SOAP API. Requires a signed
integration agreement and BAA with each vendor (Assertus, Inmediata, etc.).
This is what the **"Direct connection"** cards in the Intake screen are
flagged as — see `src/App.jsx:527-535` (rendered as disabled "roadmap" cards
today).

---

## Vendor-by-vendor notes

| Vendor              | What they expose today              | What RevenueMD needs   | Status today                |
| ------------------- | ----------------------------------- | ---------------------- | --------------------------- |
| **Inmediata**       | Manual 837 export + SFTP            | Data-sharing letter    | Pilot-ready via SFTP        |
| **Assertus**        | Manual 837 export, API in roadmap   | BAA + API agreement    | Demo-only · needs agreement |
| **Practice Fusion** | Manual CSV/837 export, REST API     | BAA + API credentials  | Demo-only · needs agreement |
| **Any 837 file**    | The national EDI 837 standard       | Nothing — file upload  | Available today             |

> **Honest status note:** All vendor cards in the current UI are mocked. The
> "Available now" badge means *the file-upload mechanism is built*, not that
> we have signed agreements with each vendor.

---

## End-to-end flow for method (a) — what the biller actually does

This is the flow you can demo today using the existing UI:

1. **Biller finishes the claim** in Assertus / Inmediata / Practice Fusion
   like they always do.
2. **Biller exports the EDI 837** (or CSV) from that system — every billing
   tool has an "Export claims" or "Generate batch" button.
3. In RevenueMD: **Sign in → Intake → Import claims tab.**
4. **Click the source card** for the vendor they exported from
   (Inmediata, Assertus, Practice Fusion, or "Any EDI 837 file").
5. **Pick the 837/CSV** they just exported. RevenueMD parses it,
   normalizes the data, and routes the claims into the **Batch queue**.
6. The scrubber runs. Claims fall into three lanes:
   - **Auto-clear** — clean, ready to submit
   - **Quick review** — minor issues, one-click to approve
   - **Needs work** — payer-specific issues that would have caused a denial
7. **Biller works the Needs-work claims** (in the Claims / AI Analysis
   modules), approves the rest, and **exports the clean 837** back out to
   their clearinghouse (Inmediata).

The flow strings in the app (`src/App.jsx:82-83`) describe the same pipeline:
*Export an 837/CSV → RevenueMD reads & normalizes → Rules + AI scrub →
Send the clean claim on to your clearinghouse.*

---

## Data provenance & "already worked" handling

RevenueMD treats every imported claim as **human-touched upstream**. The
rules engine is additive — it assumes the biller already did the general
coding work, and looks for payer/PR-specific issues that general-purpose
systems miss (Plan Vital unit caps, BlueCard prefixes, ASES auth rules,
modifier mismatches, etc.).

**Field gap to close before production:** the current `BATCH_SEED` shape in
`src/App.jsx:268-277` does not carry provenance fields. Before real claims
flow, every claim record should include:

- `source` — which billing system it came from (`"inmediata"`, `"assertus"`,
  `"practice_fusion"`, `"manual_837"`)
- `worked_by` — biller/coder identifier from the source system
- `imported_at` — timestamp
- `original_file_id` — pointer back to the 837 batch it came from (for audit)

This makes it possible to attribute denials back to upstream patterns
(e.g. "Assertus exports are missing modifier 95 on 90% of telehealth claims")
and feeds the Compliance / audit log.

---

## What needs to exist before this is real, not demo

- [ ] **Signed BAAs** with each vendor whose claims flow through RevenueMD.
- [ ] **A real backend service** to parse 837 files — the current app is
  front-end only (already noted in `README_FOR_CLAUDE_CODE.md`). The actual
  parser/rules-engine work lives in the separate `revenuemd-platform` /
  `claimpro-architecture` project.
- [ ] **SFTP credentials store** + audit logging for method (b).
- [ ] **Vendor API agreements** for method (c).
- [ ] **Certified PR coder sign-off** on the rules engine before any real
  claim is scrubbed in production (already noted in
  `README_FOR_CLAUDE_CODE.md:54`).

---

## References (where this lives in the code today)

| What                                | File                                |
| ----------------------------------- | ----------------------------------- |
| Vendor source cards (file import)   | `src/App.jsx:257-265`               |
| Vendor cards (API roadmap)          | `src/App.jsx:263-265`               |
| Intake → Import claims tab          | `src/App.jsx:480-539`               |
| Sample batch shape                  | `src/App.jsx:268-277`               |
| Flow strings (4-step pipeline)      | `src/App.jsx:82-83`                 |
| "Sits before clearinghouse" note    | `src/App.jsx:147`                   |
