import globals from 'globals';
import pluginJs from '@eslint/js';

/** @type {import('eslint').Linter.Config[]} */
export default [
	{ ignores: ['example/.astro', 'example/dist'] },
	{ languageOptions: { globals: globals.node } },
	pluginJs.configs.recommended,
];
