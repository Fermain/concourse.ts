import { describe, expect, it, vi } from "vitest";
import type { ConcourseClient } from "../client";
import type { TeamClient } from "../clients/TeamClient";
import type { TeamPipelineClient } from "../clients/TeamPipelineClient";
import type { TeamPipelineJobClient } from "../clients/TeamPipelineJobClient";
import { FlyClient } from "../fly";
import type { AtcBuild, AtcJob, AtcPipeline } from "../types/atc";

const pipelineFixture: AtcPipeline = {
	id: 1,
	name: "pipeline",
	paused: false,
	public: false,
	archived: false,
	team_name: "main",
};

const jobFixture: AtcJob = {
	id: 1,
	name: "job",
	team_name: "main",
	pipeline_id: 1,
	pipeline_name: "pipeline",
	next_build: null,
	finished_build: null,
};

const buildFixture: AtcBuild = {
	id: 1,
	team_name: "main",
	name: "1",
	status: "succeeded",
	api_url: "/api/v1/builds/1",
	comment: null,
	job_name: "job",
	resource_name: null,
	pipeline_id: 1,
	pipeline_name: "pipeline",
	pipeline_instance_vars: null,
	start_time: null,
	end_time: null,
	reap_time: null,
	rerun_number: null,
	rerun_of: null,
	created_by: null,
};

const createFly = () => {
	const jobClient: Pick<TeamPipelineJobClient, "listBuilds"> = {
		listBuilds: vi.fn().mockResolvedValue([buildFixture]),
	};

	const pipelineClient: Pick<
		TeamPipelineClient,
		"listJobs" | "listBuilds" | "forJob"
	> = {
		listJobs: vi.fn().mockResolvedValue([jobFixture]),
		listBuilds: vi.fn().mockResolvedValue([buildFixture]),
		forJob: vi.fn().mockReturnValue(jobClient as TeamPipelineJobClient),
	};

	const teamClient: Pick<
		TeamClient,
		"listPipelines" | "listBuilds" | "forPipeline"
	> = {
		listPipelines: vi.fn().mockResolvedValue([pipelineFixture]),
		listBuilds: vi.fn().mockResolvedValue([buildFixture]),
		forPipeline: vi.fn().mockReturnValue(pipelineClient as TeamPipelineClient),
	};

	const concourseClient: Pick<
		ConcourseClient,
		"listPipelines" | "listBuilds" | "forTeam"
	> = {
		listPipelines: vi.fn().mockResolvedValue([pipelineFixture]),
		listBuilds: vi.fn().mockResolvedValue([buildFixture]),
		forTeam: vi.fn().mockReturnValue(teamClient as TeamClient),
	};

	const fly = new FlyClient({
		baseUrl: "https://ci.example.com",
		teamName: "main",
		client: concourseClient as ConcourseClient,
	});

	return { fly, concourseClient, teamClient, pipelineClient, jobClient };
};

describe("FlyClient", () => {
	it("lists pipelines across all teams when all flag is set", async () => {
		const { fly, concourseClient, teamClient } = createFly();

		const pipelines = await fly.pipelines({ all: true });

		expect(concourseClient.listPipelines).toHaveBeenCalledTimes(1);
		expect(teamClient.listPipelines).not.toHaveBeenCalled();
		expect(pipelines).toEqual([pipelineFixture]);
	});

	it("lists pipelines scoped to the configured team by default", async () => {
		const { fly, concourseClient, teamClient } = createFly();

		const pipelines = await fly.pipelines();

		expect(concourseClient.listPipelines).not.toHaveBeenCalled();
		expect(teamClient.listPipelines).toHaveBeenCalledTimes(1);
		expect(pipelines).toEqual([pipelineFixture]);
	});

	it("lists jobs for the requested pipeline", async () => {
		const { fly, pipelineClient } = createFly();

		const jobs = await fly.jobs({ pipeline: "sample" });

		expect(pipelineClient.listJobs).toHaveBeenCalledTimes(1);
		expect(jobs).toEqual([jobFixture]);
	});

	it("lists builds globally when no filters are provided", async () => {
		const { fly, concourseClient } = createFly();

		const builds = await fly.builds();

		expect(concourseClient.listBuilds).toHaveBeenCalledWith({ limit: 50 });
		expect(builds).toEqual([buildFixture]);
	});

	it("lists builds for a given pipeline", async () => {
		const { fly, pipelineClient } = createFly();

		const builds = await fly.builds({ pipeline: "sample", count: 10 });

		expect(pipelineClient.listBuilds).toHaveBeenCalledWith({ limit: 10 });
		expect(builds).toEqual([buildFixture]);
	});

	it("lists builds for a given job reference", async () => {
		const { fly, pipelineClient, jobClient } = createFly();

		const builds = await fly.builds({ job: "sample/job" });

		expect(pipelineClient.forJob).toHaveBeenCalledWith("job");
		expect(jobClient.listBuilds).toHaveBeenCalledTimes(1);
		expect(builds).toEqual([buildFixture]);
	});

	it("throws when team operations are requested without a configured team", async () => {
		const jobClient: Pick<TeamPipelineJobClient, "listBuilds"> = {
			listBuilds: vi.fn().mockResolvedValue([buildFixture]),
		};
		const pipelineClient: Pick<
			TeamPipelineClient,
			"listJobs" | "listBuilds" | "forJob"
		> = {
			listJobs: vi.fn().mockResolvedValue([jobFixture]),
			listBuilds: vi.fn().mockResolvedValue([buildFixture]),
			forJob: vi.fn().mockReturnValue(jobClient as TeamPipelineJobClient),
		};
		const teamClient: Pick<
			TeamClient,
			"listPipelines" | "listBuilds" | "forPipeline"
		> = {
			listPipelines: vi.fn().mockResolvedValue([pipelineFixture]),
			listBuilds: vi.fn().mockResolvedValue([buildFixture]),
			forPipeline: vi
				.fn()
				.mockReturnValue(pipelineClient as TeamPipelineClient),
		};
		const concourseClient = {
			forTeam: vi.fn().mockReturnValue(teamClient as TeamClient),
			listPipelines: vi.fn(),
			listBuilds: vi.fn(),
		} as unknown as ConcourseClient;

		const fly = new FlyClient({
			baseUrl: "https://ci.example.com",
			client: concourseClient,
		});

		await expect(() => fly.pipelines()).rejects.toThrow(
			"Team name is required",
		);
	});

	it("omits the limit parameter when count is null", async () => {
		const { fly, teamClient } = createFly();

		await fly.builds({ count: null, team: true });

		expect(teamClient.listBuilds).toHaveBeenCalledWith({ limit: undefined });
	});
});
