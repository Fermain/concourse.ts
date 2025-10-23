// URL helpers for composing Concourse API endpoints

export const apiUrl = (baseUrl: string): string => `${baseUrl}/api/v1`;

export const infoUrl = (api: string): string => `${api}/info`;

export const allTeamsUrl = (api: string): string => `${api}/teams`;
export const allWorkersUrl = (api: string): string => `${api}/workers`;
export const allPipelinesUrl = (api: string): string => `${api}/pipelines`;
export const allJobsUrl = (api: string): string => `${api}/jobs`;
export const allBuildsUrl = (api: string): string => `${api}/builds`;
export const allResourcesUrl = (api: string): string => `${api}/resources`;

export const buildUrl = (api: string, buildId: string | number): string =>
	`${api}/builds/${buildId}`;

export const teamUrl = (api: string, teamName: string): string =>
	`${api}/teams/${encodeURIComponent(teamName)}`;

export const teamPipelinesUrl = (api: string, teamName: string): string =>
	`${api}/teams/${encodeURIComponent(teamName)}/pipelines`;
export const teamPipelineUrl = (
	api: string,
	teamName: string,
	pipelineName: string,
): string =>
	`${api}/teams/${encodeURIComponent(teamName)}/pipelines/${encodeURIComponent(pipelineName)}`;
export const teamPipelineConfigUrl = (
	api: string,
	teamName: string,
	pipelineName: string,
): string => `${teamPipelineUrl(api, teamName, pipelineName)}/config`;

export const teamPipelinePauseUrl = (
	api: string,
	teamName: string,
	pipelineName: string,
): string => `${teamPipelineUrl(api, teamName, pipelineName)}/pause`;
export const teamPipelineUnpauseUrl = (
	api: string,
	teamName: string,
	pipelineName: string,
): string => `${teamPipelineUrl(api, teamName, pipelineName)}/unpause`;
export const teamPipelineRenameUrl = (
	api: string,
	teamName: string,
	pipelineName: string,
): string => `${teamPipelineUrl(api, teamName, pipelineName)}/rename`;

export const teamPipelineJobsUrl = (
	api: string,
	teamName: string,
	pipelineName: string,
): string => `${teamPipelineUrl(api, teamName, pipelineName)}/jobs`;
export const teamPipelineJobUrl = (
	api: string,
	teamName: string,
	pipelineName: string,
	jobName: string,
): string =>
	`${teamPipelineJobsUrl(api, teamName, pipelineName)}/${encodeURIComponent(jobName)}`;
export const teamPipelineJobBuildsUrl = (
	api: string,
	teamName: string,
	pipelineName: string,
	jobName: string,
): string =>
	`${teamPipelineJobUrl(api, teamName, pipelineName, jobName)}/builds`;

export const teamPipelineResourcesUrl = (
	api: string,
	teamName: string,
	pipelineName: string,
): string => `${teamPipelineUrl(api, teamName, pipelineName)}/resources`;
export const teamPipelineResourceUrl = (
	api: string,
	teamName: string,
	pipelineName: string,
	resourceName: string,
): string =>
	`${teamPipelineResourcesUrl(api, teamName, pipelineName)}/${encodeURIComponent(resourceName)}`;
export const teamPipelineResourceTypesUrl = (
	api: string,
	teamName: string,
	pipelineName: string,
): string => `${teamPipelineUrl(api, teamName, pipelineName)}/resource-types`;
export const teamPipelineResourceVersionsUrl = (
	api: string,
	teamName: string,
	pipelineName: string,
	resourceName: string,
): string =>
	`${teamPipelineResourceUrl(api, teamName, pipelineName, resourceName)}/versions`;
export const teamPipelineResourceCheckUrl = (
	api: string,
	teamName: string,
	pipelineName: string,
	resourceName: string,
): string =>
	`${teamPipelineResourceUrl(api, teamName, pipelineName, resourceName)}/check`;

export const userUrl = (api: string): string => `${api}/user`;
export const usersUrl = (api: string): string => `${api}/users`;

export const teamBuildsUrl = (api: string, teamName: string): string =>
	`${api}/teams/${encodeURIComponent(teamName)}/builds`;

export const teamPipelineBuildsUrl = (
	api: string,
	teamName: string,
	pipelineName: string,
): string => `${teamPipelineUrl(api, teamName, pipelineName)}/builds`;

export const teamRenameUrl = (api: string, teamName: string): string =>
	`${teamUrl(api, teamName)}/rename`;
