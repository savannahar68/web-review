# `legacy-javascript` Validation Tool

Run:

```sh
yarn install
node run.js
# STAGE=build|audit|all to just build the audits or run LegacyJavascript on them. Defaults to both (`all`).
```

`summary-signals.json` - summarizes the signals that LegacyJavascript finds for each variant. Variants in `variantsMissingSignals` (excluding `core-js-3-preset-env-esmodules/true`) signify a lack of detection for that variant. Full coverage isn't necessary.

`summary-sizes.json` - lists the size of each minified variant. Useful for understanding how many bytes each polyfill / transform adds.

## Future Work

* Use real apps to see how over-transpiling affects real code. Necessary for making an opprotunity.

## Notes

Digging into core-js: https://gist.github.com/connorjclark/cc583554ff07cba7cdc416c06721fd6a
