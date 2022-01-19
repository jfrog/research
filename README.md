# JFrog Security Research

## Before Setup
Make sure you have `yarn` and `gridsome` installed globally.
For more details:
[Yarn](https://classic.yarnpkg.com/lang/en/docs/install/)
[Gridsome](https://gridsome.org/docs/gridsome-cli/)
## Setup
Clone the repo and run `yarn` in the root folder.
## Starting the dev Server
Run `gridsome develop`. The default port would be `8080` and you can visit your local instance at [http://localhost:8080/](http://localhost:8080/)

## Content
### Vulnerabilities
To add a Vulnerability post, add a markdown file to `./vulnerabilities`. Make sure the `.md` file has all of the required metadata & content. You can take a look at the rest of the `.md` files in the folder and figure the metadata & content convention.

### Malicious Packages
To add a `Malicious Package` item, just add an object to the JSON array in `src/malicious/malicious-data.json`. Same here - pay attention to the object structure and add an object with the exact same structure. Make sure to add your `Malicious Package` object in the right place according to its date. The first object in the array is the one with the latest date.
## Deploy to Github Pages
first push your changes to `main` branch, then run `yarn deploy`

