import process from 'node:process';
import { describe, expect, it } from 'vitest';
import load from '@commitlint/load';
import { testLintOptions, verifyPr } from '../src/lint';

const { getLintOptions, convertESMtoCJS } = testLintOptions;

const emptyConfigOption = {
	defaultIgnores: true,
	helpUrl: 'https://github.com/conventional-changelog/commitlint/#what-is-commitlint',
	ignores: undefined,
	parserOpts: {
		breakingHeaderPattern: /^(\w*)(?:\((.*)\))?!: (.*)$/,
		headerCorrespondence: [
			'type',
			'scope',
			'subject',
		],
		headerPattern: /^(\w*)(?:\((.*)\))?!?: (.*)$/,
		issuePrefixes: ['#'],
		noteKeywords: [
			'BREAKING CHANGE',
			'BREAKING-CHANGE',
		],
		revertCorrespondence: [
			'header',
			'hash',
		],
		revertPattern: /^(?:Revert|revert:)\s"?([\s\S]+?)"?\s*This reverts commit (\w*)\./i,
	},
	plugins: {},
};

const emptyConfigOptionNoParserOpts = {
	defaultIgnores: true,
	helpUrl: 'https://github.com/conventional-changelog/commitlint/#what-is-commitlint',
	ignores: undefined,
	parserOpts: undefined,
	plugins: {},
};

describe('commitlint', async () => {
	const emptyConfig = await load({});
	const defaultConfig = await load({ extends: '@commitlint/config-conventional' });
	const currentConfig = await load({}, { file: 'commitlint.config.mjs', cwd: process.cwd() });

	it('configurations return proper extensions and rules', () => {
		expect(emptyConfig).toHaveProperty('extends', ['@commitlint/config-conventional']);
		expect(defaultConfig).toHaveProperty('extends', ['@commitlint/config-conventional']);
		expect(currentConfig).toHaveProperty('rules.subject-case', [2, 'always', 'sentence-case']);
	});

	it('configuration returns the right qualified lint options', () => {
		expect(getLintOptions(emptyConfig)).toMatchObject(emptyConfigOption);
		expect(getLintOptions(defaultConfig)).toMatchObject(emptyConfigOption);
		expect(getLintOptions(currentConfig)).toMatchObject(emptyConfigOption);
		delete currentConfig.parserPreset?.parserOpts;
		expect(getLintOptions(currentConfig)).toMatchObject(emptyConfigOptionNoParserOpts);
	});

	it('throw error on incorrect title', async () => {
		await expect(verifyPr({ number: 1, title: 'foo: bar' })).rejects.toThrowError(/check failed/);
		await expect(verifyPr({ number: 1, title: 'foo: bar' }, { configPath: 'something.config.js' })).rejects.toThrowError(/subject-case/);
		await expect(verifyPr({ number: 1, title: 'test: add tests' }, { configPath: 'commitlint.config.js' })).rejects.toThrowError(/sentence-case/);
	});

	it('take the description too', async () => {
		let longString = '';
		while (longString.length < 200)
			longString = longString.concat('long long long ');

		await expect(verifyPr({ number: 1, title: 'foo: bar', description: longString }, { configPath: 'something.config.js', useDescription: true })).rejects.toThrowError(/check failed/);
	});
	it('return true if title is valid', async () => {
		await expect(verifyPr({ number: 1, title: 'fix: Add new commets' })).resolves.toEqual(true);
		await expect(verifyPr({ number: 1, title: 'feat: Title is short and nice!' }, { configPath: 'something.config.js' })).resolves.toEqual(true);
		await expect(verifyPr({ number: 1, title: 'test: Add test suites' }, { configPath: 'commitlint.config.mjs' })).resolves.toEqual(true);
	});

	it('return error if file for esm conversion does not exist', async () => {
		await expect(convertESMtoCJS('dne.js', 'dne.cjs')).rejects.toThrowError(/no such file or directory/);
	});
});
