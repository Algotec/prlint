export type pullRequest = {
	title: string
	description?: string
	number: number
};

export type verifyOptions = {
	convertToCJS?: boolean
	useDescription?: boolean
	configPath?: string

};
