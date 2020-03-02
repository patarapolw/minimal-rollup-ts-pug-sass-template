# minimal-rollup-ts-pug-sass-template

Rollup + TypeScript + Pug + SASS template with no plan for JavaScript frameworks, whatsoever

## Usage

```sh
npx degit patarapolw/minimal-rollup-ts-pug-sass-template PATH_TO_YOUR_PROJECT_FOLDER_OR_OMIT
```

## Modes

- `ROUTER_MODE=history` for SPA history mode
- `ELECTRON=1` for Electron mode (coupled with `yarn build:electron` and `yarn watch:electron`)

## Caveats

Rollup currently have a problem of [HTML not being watched](https://github.com/rollup/rollup/issues/1828). Serve in JavaScript / TypeScript to prevent this.
