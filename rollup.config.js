import path from 'path';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import livereload from 'rollup-plugin-livereload';
import { terser } from 'rollup-plugin-terser';
import copy from 'rollup-plugin-copy';
import del from 'rollup-plugin-delete';
import postcss from 'rollup-plugin-postcss';
import postcssImport from 'postcss-import';
import childProcess from 'child_process';
import json from '@rollup/plugin-json';
import babel from '@rollup/plugin-babel';
import cssnano from 'cssnano';

const production = !process.env.ROLLUP_WATCH;
const onwarn = (message, warn) => {
	const ignored = {
		EVAL: ['lottie.js'],
		CIRCULAR_DEPENDENCY: ['factory'],
	};
	const ignoredKeys = Object.keys(ignored);
	const ignoredValues = Object.values(ignored);

	for (let i = 0, l = ignoredKeys.length; i < l; ++i) {
		for (const ignoredValue of ignoredValues) {
			if (!(message.code === ignoredKeys[i]
				&& message.toString().includes(ignoredValue))) {
				continue;
			}

			return;
		}
	}

	warn(message);
};
const watch = {
	clearScreen: false,
};
const commonPlugins = [
	json({
		compact: production,
		preferConst: true,
	}),

	// If you have external dependencies installed from
	// npm, you'll most likely need these plugins. In
	// some cases you'll need additional configuration -
	// consult the documentation for details:
	// https://github.com/rollup/plugins/tree/master/packages/commonjs
	resolve({
		browser: true,
		dedupe: ['svelte'],
	}),

	commonjs(),

	production && babel({
		extensions: ['.js', '.mjs', '.html'],
		include: ['src/**'],
		babelHelpers: 'bundled',
	}),

	// If we're building for production (npm run build
	// instead of npm run dev), minify
	production && terser(),
];
const commonPostCSSPlugins = [
	postcssImport(),
	production && cssnano({
		preset: ['default', {
			cssDeclarationSorter: true,
		}],
	}),
];

export default (commandLineArgs) => [{
	input: 'src/assets/js/main.js',
	output: {
		sourcemap: true,
		format: 'iife',
		name: 'app',
		file: 'public/bundle.js',
	},
	onwarn,
	watch,
	plugins: [
		del({
			targets: [
				// delete raw files because apparently there's conflict
				// with the copy plugin
				'public/assets/*',
			],
			hook: 'load',
		}),

		copy({
			targets: [
				{
					src: 'src/index.html',
					dest: 'public',
				},
				{
					src: 'src/assets/js/raw',
					dest: 'public/assets/js',
				},
				{
					src: 'src/assets/img',
					dest: 'public/assets',
				},
				{
					src: 'src/assets/md',
					dest: 'public/assets',
				},
			],
			// hook: 'load',
		}),

		postcss({
			extract: path.resolve('public/bundle.css'),
			plugins: [
				...commonPostCSSPlugins
			],
		}),

		
		// typescript(),

		// In dev mode, call `npm run start` once
		// the bundle has been generated
		!production && serve((() => {
			switch (true) {
				case commandLineArgs['config-electron']:
					return ['serve-electron'];
				case commandLineArgs['config-web']:
				default:
					return ['serve-web', '--', '--dev'];
			}
		})()),

		// Watch the `public` directory and refresh the
		// browser on changes when not in production
		!production && !commandLineArgs['config-electron'] && livereload('public'),

		...commonPlugins,
	],
}, {
	input: 'src/portfolio/assets/js/main.js',
	output: {
		sourcemap: true,
		format: 'iife',
		name: 'app',
		file: 'public/portfolio/bundle.js',
	},
	onwarn,
	watch,
	plugins: [
		del({
			targets: [
				// delete raw files because apparently there's conflict
				// with the copy plugin
				'public/portfolio/assets/*',
			],
			hook: 'load',
		}),

		copy({
			targets: [
				{
					src: 'src/portfolio/index.html',
					dest: 'public/portfolio',
				},
				{
					src: 'src/portfolio/assets/js/raw',
					dest: 'public/portfolio/assets/js',
				},
				{
					src: 'src/portfolio/assets/img',
					dest: 'public/portfolio/assets',
				},
				{
					src: [
						'src/fid',
						'.gitignore',
					],
					dest: 'public'
				},
				{
					src: [
						'public/index.html',
						'public/bundle.js',
						'public/bundle.css',
						'public/assets',
					],
					dest: 'public/fid/ccts'
				},
				{
					src: [
						'public/index.html',
						'public/bundle.js',
						'public/bundle.css',
						'public/assets',
					],
					dest: 'public/fid/photo'
				},
			],
			// hook: 'load',
		}),

		postcss({
			extract: path.resolve('public/portfolio/bundle.css'),
			plugins: [
				...commonPostCSSPlugins
			],
		}),

		...commonPlugins,
	],
}];

function serve(npmScript = ['serve', '--', '--dev']) {
	let server;

	function toExit() {
		if (server) server.kill(0);
	}

	return {
		writeBundle() {
			if (server) return;
			server = childProcess.spawn('npm', ['run', ...npmScript], {
				stdio: ['ignore', 'inherit', 'inherit'],
				shell: true,
			});

			process.on('SIGTERM', toExit);
			process.on('exit', toExit);
		},
	};
}
