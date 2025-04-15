// Base URLs
export const apiUrl = (concourseUrl: string): string =>
  `${concourseUrl}/api/v1`;

export const skyTokenUrl = (concourseUrl: string): string =>
  `${concourseUrl}/sky/token`;
export const skyIssuerTokenUrl = (concourseUrl: string): string =>
  `${concourseUrl}/sky/issuer/token`;

// Global Info
export const infoUrl = (apiUrl: string): string =>
  `${apiUrl}/info`;

// Global Lists
export const allTeamsUrl = (apiUrl: string): string =>
  `${apiUrl}/teams`;
export const allWorkersUrl = (apiUrl: string): string =>
  `${apiUrl}/workers`;
export const allPipelinesUrl = (apiUrl: string): string =>
  `${apiUrl}/pipelines`;
export const allJobsUrl = (apiUrl: string): string =>
  `${apiUrl}/jobs`;
export const allBuildsUrl = (apiUrl: string): string =>
  `${apiUrl}/builds`;
export const allResourcesUrl = (apiUrl: string): string =>
  `${apiUrl}/resources`;

// Workers
export const workerPruneUrl = (apiUrl: string, workerName: string): string =>
  `${apiUrl}/workers/${encodeURIComponent(workerName)}/prune`;

// Builds (Global)
export const buildUrl = (apiUrl: string, buildId: number): string =>
  `${apiUrl}/builds/${buildId}`;
export const buildResourcesUrl = (apiUrl: string, buildId: number): string =>
  `${apiUrl}/builds/${buildId}/resources`;

// Teams
export const teamAuthTokenUrl = (apiUrl: string, teamName: string): string =>
  `${apiUrl}/teams/${encodeURIComponent(teamName)}/auth/token`;

export const teamUrl = (apiUrl: string, teamName: string): string =>
  `${apiUrl}/teams/${encodeURIComponent(teamName)}`;
export const teamRenameUrl = (apiUrl: string, teamName: string): string =>
  `${apiUrl}/teams/${encodeURIComponent(teamName)}/rename`;

export const teamPipelinesUrl = (apiUrl: string, teamName: string): string =>
  `${apiUrl}/teams/${encodeURIComponent(teamName)}/pipelines`;

export const teamBuildsUrl = (apiUrl: string, teamName: string): string =>
  `${apiUrl}/teams/${encodeURIComponent(teamName)}/builds`;

export const teamContainersUrl = (apiUrl: string, teamName: string): string =>
  `${apiUrl}/teams/${encodeURIComponent(teamName)}/containers`;
export const teamContainerUrl = (apiUrl: string, teamName: string, containerId: string): string =>
  `${apiUrl}/teams/${encodeURIComponent(teamName)}/containers/${encodeURIComponent(containerId)}`;

export const teamVolumesUrl = (apiUrl: string, teamName: string): string =>
  `${apiUrl}/teams/${encodeURIComponent(teamName)}/volumes`;

// Pipelines
export const teamPipelineUrl = (apiUrl: string, teamName: string, pipelineName: string): string =>
  `${apiUrl}/teams/${encodeURIComponent(teamName)}/pipelines/${encodeURIComponent(pipelineName)}`;
export const teamPipelinePauseUrl = (apiUrl: string, teamName: string, pipelineName: string): string =>
  `${apiUrl}/teams/${encodeURIComponent(teamName)}/pipelines/${encodeURIComponent(pipelineName)}/pause`;
export const teamPipelineUnpauseUrl = (apiUrl: string, teamName: string, pipelineName: string): string =>
  `${apiUrl}/teams/${encodeURIComponent(teamName)}/pipelines/${encodeURIComponent(pipelineName)}/unpause`;
export const teamPipelineRenameUrl = (apiUrl: string, teamName: string, pipelineName: string): string =>
  `${apiUrl}/teams/${encodeURIComponent(teamName)}/pipelines/${encodeURIComponent(pipelineName)}/rename`;
export const teamPipelineConfigUrl = (apiUrl: string, teamName: string, pipelineName: string): string =>
  `${apiUrl}/teams/${encodeURIComponent(teamName)}/pipelines/${encodeURIComponent(pipelineName)}/config`;
export const teamPipelineBuildsUrl = (apiUrl: string, teamName: string, pipelineName: string): string =>
  `${apiUrl}/teams/${encodeURIComponent(teamName)}/pipelines/${encodeURIComponent(pipelineName)}/builds`;
export const teamPipelineJobsUrl = (apiUrl: string, teamName: string, pipelineName: string): string =>
  `${apiUrl}/teams/${encodeURIComponent(teamName)}/pipelines/${encodeURIComponent(pipelineName)}/jobs`;
export const teamPipelineResourcesUrl = (apiUrl: string, teamName: string, pipelineName: string): string =>
  `${apiUrl}/teams/${encodeURIComponent(teamName)}/pipelines/${encodeURIComponent(pipelineName)}/resources`;
export const teamPipelineResourceTypesUrl = (apiUrl: string, teamName: string, pipelineName: string): string =>
  `${apiUrl}/teams/${encodeURIComponent(teamName)}/pipelines/${encodeURIComponent(pipelineName)}/resource-types`;

// Jobs
export const teamPipelineJobUrl = (apiUrl: string, teamName: string, pipelineName: string, jobName: string): string =>
  `${apiUrl}/teams/${encodeURIComponent(teamName)}/pipelines/${encodeURIComponent(pipelineName)}/jobs/${encodeURIComponent(jobName)}`;
export const teamPipelineJobPauseUrl = (apiUrl: string, teamName: string, pipelineName: string, jobName: string): string =>
  `${apiUrl}/teams/${encodeURIComponent(teamName)}/pipelines/${encodeURIComponent(pipelineName)}/jobs/${encodeURIComponent(jobName)}/pause`;
export const teamPipelineJobUnpauseUrl = (apiUrl: string, teamName: string, pipelineName: string, jobName: string): string =>
  `${apiUrl}/teams/${encodeURIComponent(teamName)}/pipelines/${encodeURIComponent(pipelineName)}/jobs/${encodeURIComponent(jobName)}/unpause`;
export const teamPipelineJobBuildsUrl = (apiUrl: string, teamName: string, pipelineName: string, jobName: string): string =>
  `${apiUrl}/teams/${encodeURIComponent(teamName)}/pipelines/${encodeURIComponent(pipelineName)}/jobs/${encodeURIComponent(jobName)}/builds`;
export const teamPipelineJobBuildUrl = (apiUrl: string, teamName: string, pipelineName: string, jobName: string, buildName: string): string =>
  `${apiUrl}/teams/${encodeURIComponent(teamName)}/pipelines/${encodeURIComponent(pipelineName)}/jobs/${encodeURIComponent(jobName)}/builds/${encodeURIComponent(buildName)}`;
export const teamPipelineJobInputsUrl = (apiUrl: string, teamName: string, pipelineName: string, jobName: string): string =>
  `${apiUrl}/teams/${encodeURIComponent(teamName)}/pipelines/${encodeURIComponent(pipelineName)}/jobs/${encodeURIComponent(jobName)}/inputs`;

// Resources
export const teamPipelineResourceUrl = (apiUrl: string, teamName: string, pipelineName: string, resourceName: string): string =>
  `${apiUrl}/teams/${encodeURIComponent(teamName)}/pipelines/${encodeURIComponent(pipelineName)}/resources/${encodeURIComponent(resourceName)}`;
export const teamPipelineResourcePauseUrl = (apiUrl: string, teamName: string, pipelineName: string, resourceName: string): string =>
  `${apiUrl}/teams/${encodeURIComponent(teamName)}/pipelines/${encodeURIComponent(pipelineName)}/resources/${encodeURIComponent(resourceName)}/pause`;
export const teamPipelineResourceUnpauseUrl = (apiUrl: string, teamName: string, pipelineName: string, resourceName: string): string =>
  `${apiUrl}/teams/${encodeURIComponent(teamName)}/pipelines/${encodeURIComponent(pipelineName)}/resources/${encodeURIComponent(resourceName)}/unpause`;
export const teamPipelineResourceVersionsUrl = (apiUrl: string, teamName: string, pipelineName: string, resourceName: string): string =>
  `${apiUrl}/teams/${encodeURIComponent(teamName)}/pipelines/${encodeURIComponent(pipelineName)}/resources/${encodeURIComponent(resourceName)}/versions`;

// Resource Versions
export const teamPipelineResourceVersionUrl = (apiUrl: string, teamName: string, pipelineName: string, resourceName: string, versionId: number): string =>
  `${apiUrl}/teams/${encodeURIComponent(teamName)}/pipelines/${encodeURIComponent(pipelineName)}/resources/${encodeURIComponent(resourceName)}/versions/${versionId}`;
export const teamPipelineResourceVersionCausalityUrl = (apiUrl: string, teamName: string, pipelineName: string, resourceName: string, versionId: number): string =>
  `${apiUrl}/teams/${encodeURIComponent(teamName)}/pipelines/${encodeURIComponent(pipelineName)}/resources/${encodeURIComponent(resourceName)}/versions/${versionId}/causality`;
export const teamPipelineResourceVersionInputToUrl = (apiUrl: string, teamName: string, pipelineName: string, resourceName: string, versionId: number): string =>
  `${apiUrl}/teams/${encodeURIComponent(teamName)}/pipelines/${encodeURIComponent(pipelineName)}/resources/${encodeURIComponent(resourceName)}/versions/${versionId}/input_to`;
export const teamPipelineResourceVersionOutputOfUrl = (apiUrl: string, teamName: string, pipelineName: string, resourceName: string, versionId: number): string =>
  `${apiUrl}/teams/${encodeURIComponent(teamName)}/pipelines/${encodeURIComponent(pipelineName)}/resources/${encodeURIComponent(resourceName)}/versions/${versionId}/output_of`; 