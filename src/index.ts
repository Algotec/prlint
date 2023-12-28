import * as github from '@actions/github';
import * as core from '@actions/core';
import handleError from './errHandle';
import { verifyPr } from './lint';
import type { pullRequest } from './interfaces';

async function run(): Promise<void> {
	const pullRequestPayload = github.context.payload.pull_request;
	const configPath = core.getInput('cl-config');
	const useDescription = core.getBooleanInput('useDescription') ?? false;
	const convertToCJS = core.getBooleanInput('convertToCJS') ?? false;

	if (!pullRequestPayload?.title)
		throw new Error('Pull Request or Title not found!');

	const pullRequestObject: pullRequest = {
		title: pullRequestPayload.title as string,
		number: pullRequestPayload.number,
	};

	await verifyPr(pullRequestObject, { configPath, useDescription, convertToCJS });
}

run().catch(handleError);
