/**
 * Defines relative API paths for Concourse v1 API endpoints.
 * Use these paths with the configured httpClient (which has the baseURL set).
 */

const encode = encodeURIComponent;

export const WEB_PATHS = {
	login: "/login",
	sky: {
		token: "/sky/token",
		issuerToken: "/sky/issuer/token",
	},
} as const;

export const API_PATHS = {
	info: "/info",
	/** Global lists (unscoped) */
	list: {
		teams: "/teams",
		workers: "/workers",
		pipelines: "/pipelines",
		jobs: "/jobs",
		builds: "/builds",
		resources: "/resources",
	},
	/** Worker-specific actions */
	workers: {
		prune: (workerName: string) => `/workers/${encode(workerName)}/prune`,
	},
	/** Global build actions */
	builds: {
		details: (buildId: number) => `/builds/${buildId}`,
		resources: (buildId: number) => `/builds/${buildId}/resources`,
	},
	/** Team-specific actions */
	teams: {
		details: (teamName: string) => `/teams/${encode(teamName)}`,
		listPipelines: (teamName: string) => `/teams/${encode(teamName)}/pipelines`,
		listBuilds: (teamName: string) => `/teams/${encode(teamName)}/builds`,
		listContainers: (teamName: string) =>
			`/teams/${encode(teamName)}/containers`,
		containerDetails: (teamName: string, containerId: string) =>
			`/teams/${encode(teamName)}/containers/${encode(containerId)}`,
		listVolumes: (teamName: string) => `/teams/${encode(teamName)}/volumes`,
		// Actions requiring team context but not directly part of the resource path
		authToken: (teamName: string) => `/teams/${encode(teamName)}/auth/token`, // Kept here for consistency, though used by session logic
		rename: (teamName: string) => `/teams/${encode(teamName)}/rename`,
		/** Team pipeline actions */
		pipelines: {
			details: (teamName: string, pipelineName: string) =>
				`/teams/${encode(teamName)}/pipelines/${encode(pipelineName)}`,
			pause: (teamName: string, pipelineName: string) =>
				`/teams/${encode(teamName)}/pipelines/${encode(pipelineName)}/pause`,
			unpause: (teamName: string, pipelineName: string) =>
				`/teams/${encode(teamName)}/pipelines/${encode(pipelineName)}/unpause`,
			rename: (teamName: string, pipelineName: string) =>
				`/teams/${encode(teamName)}/pipelines/${encode(pipelineName)}/rename`,
			config: (teamName: string, pipelineName: string) =>
				`/teams/${encode(teamName)}/pipelines/${encode(pipelineName)}/config`,
			listBuilds: (teamName: string, pipelineName: string) =>
				`/teams/${encode(teamName)}/pipelines/${encode(pipelineName)}/builds`,
			listJobs: (teamName: string, pipelineName: string) =>
				`/teams/${encode(teamName)}/pipelines/${encode(pipelineName)}/jobs`,
			listResources: (teamName: string, pipelineName: string) =>
				`/teams/${encode(teamName)}/pipelines/${encode(
					pipelineName,
				)}/resources`,
			listResourceTypes: (teamName: string, pipelineName: string) =>
				`/teams/${encode(teamName)}/pipelines/${encode(
					pipelineName,
				)}/resource-types`,
			/** Team pipeline job actions */
			jobs: {
				details: (teamName: string, pipelineName: string, jobName: string) =>
					`/teams/${encode(teamName)}/pipelines/${encode(
						pipelineName,
					)}/jobs/${encode(jobName)}`,
				pause: (teamName: string, pipelineName: string, jobName: string) =>
					`/teams/${encode(teamName)}/pipelines/${encode(
						pipelineName,
					)}/jobs/${encode(jobName)}/pause`,
				unpause: (teamName: string, pipelineName: string, jobName: string) =>
					`/teams/${encode(teamName)}/pipelines/${encode(
						pipelineName,
					)}/jobs/${encode(jobName)}/unpause`,
				listBuilds: (teamName: string, pipelineName: string, jobName: string) =>
					`/teams/${encode(teamName)}/pipelines/${encode(
						pipelineName,
					)}/jobs/${encode(jobName)}/builds`,
				buildDetails: (
					teamName: string,
					pipelineName: string,
					jobName: string,
					buildName: string,
				) =>
					`/teams/${encode(teamName)}/pipelines/${encode(
						pipelineName,
					)}/jobs/${encode(jobName)}/builds/${encode(buildName)}`,
				listInputs: (teamName: string, pipelineName: string, jobName: string) =>
					`/teams/${encode(teamName)}/pipelines/${encode(
						pipelineName,
					)}/jobs/${encode(jobName)}/inputs`,
			},
			/** Team pipeline resource actions */
			resources: {
				details: (
					teamName: string,
					pipelineName: string,
					resourceName: string,
				) =>
					`/teams/${encode(teamName)}/pipelines/${encode(
						pipelineName,
					)}/resources/${encode(resourceName)}`,
				pause: (teamName: string, pipelineName: string, resourceName: string) =>
					`/teams/${encode(teamName)}/pipelines/${encode(
						pipelineName,
					)}/resources/${encode(resourceName)}/pause`,
				unpause: (
					teamName: string,
					pipelineName: string,
					resourceName: string,
				) =>
					`/teams/${encode(teamName)}/pipelines/${encode(
						pipelineName,
					)}/resources/${encode(resourceName)}/unpause`,
				listVersions: (
					teamName: string,
					pipelineName: string,
					resourceName: string,
				) =>
					`/teams/${encode(teamName)}/pipelines/${encode(
						pipelineName,
					)}/resources/${encode(resourceName)}/versions`,
				/** Team pipeline resource version actions */
				versions: {
					details: (
						teamName: string,
						pipelineName: string,
						resourceName: string,
						versionId: number,
					) =>
						`/teams/${encode(teamName)}/pipelines/${encode(
							pipelineName,
						)}/resources/${encode(resourceName)}/versions/${versionId}`,
					causality: (
						teamName: string,
						pipelineName: string,
						resourceName: string,
						versionId: number,
					) =>
						`/teams/${encode(teamName)}/pipelines/${encode(
							pipelineName,
						)}/resources/${encode(
							resourceName,
						)}/versions/${versionId}/causality`,
					inputTo: (
						teamName: string,
						pipelineName: string,
						resourceName: string,
						versionId: number,
					) =>
						`/teams/${encode(teamName)}/pipelines/${encode(
							pipelineName,
						)}/resources/${encode(
							resourceName,
						)}/versions/${versionId}/input_to`,
					outputOf: (
						teamName: string,
						pipelineName: string,
						resourceName: string,
						versionId: number,
					) =>
						`/teams/${encode(teamName)}/pipelines/${encode(
							pipelineName,
						)}/resources/${encode(
							resourceName,
						)}/versions/${versionId}/output_of`,
				},
			},
		},
	},
} as const;
