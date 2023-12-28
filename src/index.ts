import * as github from '@actions/github';
import * as core from '@actions/core';
import handleError from './errHandle';
import { verifyPr } from './lint';
import type { pullRequest } from './interfaces';

async function run(): Promise<void> {
	const pullRequestPayload = github.context.payload.pull_request;
	const configPayload = core.getInput('cl-config');
	const useDescription = !!core.getInput('useDescription');

	if (!pullRequestPayload?.title)
		throw new Error('Pull Request or Title not found!');

	const pullRequestObject: pullRequest = {
		title: pullRequestPayload.title as string,
		number: pullRequestPayload.number,
	};

	await verifyPr(pullRequestObject, configPayload, useDescription);
}

run().catch(handleError);
