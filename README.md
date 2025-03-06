# @harperdb/astro

A [Harper Component](https://docs.harperdb.io/docs/developers/components) for running [Astro](https://astro.build/) applications.

## Getting Started

1. Add the [`@astrojs/node`](https://docs.astro.build/en/guides/integrations-guide/node/) integration to the Astro application, and set the mode to `'middleware'`.

   1. For example:

   ```js
   import { defineConfig } from 'astro/config';
   import node from '@astrojs/node';

   export default defineConfig({
   	adapter: node({
   		mode: 'middleware',
   	}),
   });
   ```

2. Create a `config.yaml` in the root of the Astro app containing:
   ```yaml
   '@harperdb/astro':
   	package: '@harperdb/astro'
   	files: './'
   ```
3. Run the application using Harper. For more information reference the [Harper Component documentation](https://docs.harperdb.io/docs/developers/components).

## Options

> All configuration options are optional

### `buildCommand: string`

Specify a custom build command. Defaults to `astro build`.

> Note: the extension will skip building if the `prebuilt` option is set to `true`.

### `port: number`

Specify a port for the Astro handlers. Defaults to the Harper default port (generally 9926).

### `prebuilt: boolean`

When enabled, the extension will look for a `dist` directory in the root of the component, and skip executing the `buildCommand` if detected. Defaults to `false`.

### `securePort: number`

Specify a secure port for the Astro handlers. Defaults to the Harper default secure port.

## Example

This repo contains an example Astro app that is already configured to work with Harper.

1. Clone the repo, and navigate to the example directory
   ```sh
   cd example
   ```
2. Install dependencies
   ```sh
   npm install
   ```
3. Run the example with Harper
   ```sh
   harperdb run .
   ```
