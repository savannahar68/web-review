# Lighthouse Viewer

Online at https://googlechrome.github.io/lighthouse/viewer/

## Development

Run the following in the root folder of a Lighthouse checkout:

* `yarn`
* `yarn build-viewer`

This compiles and minifies `app/src/main.js`. Results are written to `dist/viewer/`.

## Deploy

Deploys should be done as part of the Lighthouse release process. To push the viewer to the `gh-pages` branch under `viewer/`, run the following in the root folder of a Lighthouse checkout:

```sh
yarn deploy-viewer
```

For more information on deployment, see `releasing.md`.

## Gist

http://localhost:8000/?gist=bd1779783a5bbcb348564a58f80f7099

## PSI

Example:
```
http://localhost:8000/?psiurl=https://www.example.com&category=pwa&category=seo
```

Options:

`psiurl` - URL to audit
`category` - Category to enable. One per category.
`strategy` - mobile, desktop
`locale` - locale to render report with
`utm_source` - id that identifies the tool using the viewer
