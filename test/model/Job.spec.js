import * as chai from "chai";
import { expect } from "chai";
import { map, times } from "ramda";
import * as R from "ramda";
import sinon from "sinon";
import sinonChai from "sinon-chai";

import Build from "../../commonjs/model/Build.js";
import Input, { toInput } from "../../commonjs/model/Input.js";
import Job from "../../commonjs/model/Job.js";
import JobSet from "../../commonjs/model/JobSet.js";
import Output, { toOutput } from "../../commonjs/model/Output.js";
import data from "../testsupport/data.js";

chai.use(sinonChai);

// Helper mock client for Input/Output instantiation
const mockClient = {};

describe("Job", () => {
	it("exposes its attributes", () => {
		const jobData = data.randomJob();
		const client = mockClient; // Use the mock client
		const job = new Job({ ...jobData, client });

		expect(job.getId()).to.eql(jobData.id);
		expect(job.getName()).to.eql(jobData.name);
		expect(job.getPipelineName()).to.eql(jobData.pipelineName);
		expect(job.getTeamName()).to.eql(jobData.teamName);

		// Check inputs by comparing properties
		const actualInputs = job.getInputs();
		const expectedRawInputs = jobData.inputs || [];
		expect(actualInputs).to.have.lengthOf(expectedRawInputs.length);
		actualInputs.forEach((input, i) => {
			expect(input).to.be.instanceOf(Input);
			expect(input.getName()).to.equal(expectedRawInputs[i].name);
			expect(input.getResourceName()).to.equal(expectedRawInputs[i].resource);
		});

		// Check outputs by comparing properties
		const actualOutputs = job.getOutputs();
		const expectedRawOutputs = jobData.outputs || [];
		expect(actualOutputs).to.have.lengthOf(expectedRawOutputs.length);
		actualOutputs.forEach((output, i) => {
			expect(output).to.be.instanceOf(Output);
			expect(output.getName()).to.equal(expectedRawOutputs[i].name);
			expect(output.getResourceName()).to.equal(expectedRawOutputs[i].resource);
		});

		expect(job.getGroups()).to.eql(jobData.groups);
	});

	describe("getInputForResource", () => {
		it("finds input by resource name", () => {
			const firstResourceName = data.randomResourceName();
			const secondResourceName = data.randomResourceName();

			const firstInputData = data.randomInput({ resource: firstResourceName });
			const secondInputData = data.randomInput({
				resource: secondResourceName,
			});
			const rawInputs = [firstInputData, secondInputData];

			const jobData = data.randomJob({ inputs: rawInputs });
			const job = new Job({
				...jobData,
				inputs: map(toInput(mockClient), rawInputs),
				outputs: map(toOutput(mockClient), jobData.outputs || []),
				client: mockClient,
			});

			const actualFirstInput = job.getInputForResource(firstResourceName);
			const actualSecondInput = job.getInputForResource(secondResourceName);

			// Compare properties instead of whole object
			expect(actualFirstInput).to.be.instanceOf(Input);
			expect(actualFirstInput.getName()).to.eql(firstInputData.name);
			expect(actualFirstInput.getResourceName()).to.eql(
				firstInputData.resource,
			);

			expect(actualSecondInput).to.be.instanceOf(Input);
			expect(actualSecondInput.getName()).to.eql(secondInputData.name);
			expect(actualSecondInput.getResourceName()).to.eql(
				secondInputData.resource,
			);
		});

		it("returns undefined when no input exists for resource name", () => {
			const resourceName = data.randomResourceName();

			const jobData = data.randomJob();
			const job = new Job({ ...jobData, client: mockClient });

			expect(job.getInputForResource(resourceName)).to.eql(undefined);
		});
	});

	describe("getOutputForResource", () => {
		it("finds output by resource name", () => {
			const firstResourceName = data.randomResourceName();
			const secondResourceName = data.randomResourceName();

			const firstOutputData = data.randomOutput({
				resource: firstResourceName,
			});
			const secondOutputData = data.randomOutput({
				resource: secondResourceName,
			});
			const rawOutputs = [firstOutputData, secondOutputData];

			const jobData = data.randomJob({ outputs: rawOutputs });
			const job = new Job({
				...jobData,
				inputs: map(toInput(mockClient), jobData.inputs || []),
				outputs: map(toOutput(mockClient), rawOutputs),
				client: mockClient,
			});

			const actualFirstOutput = job.getOutputForResource(firstResourceName);
			const actualSecondOutput = job.getOutputForResource(secondResourceName);

			// Compare properties instead of whole object
			expect(actualFirstOutput).to.be.instanceOf(Output);
			expect(actualFirstOutput.getName()).to.eql(firstOutputData.name);
			expect(actualFirstOutput.getResourceName()).to.eql(
				firstOutputData.resource,
			);

			expect(actualSecondOutput).to.be.instanceOf(Output);
			expect(actualSecondOutput.getName()).to.eql(secondOutputData.name);
			expect(actualSecondOutput.getResourceName()).to.eql(
				secondOutputData.resource,
			);
		});
	});

	describe("hasDependencyJobs", () => {
		it("returns true when the job has an input that requires other jobs to " +
			"have passed", () => {
			const otherInputData = data.randomInput();
			const inputRequiringData = data.randomInput({
				passed: [data.randomJobName()],
			});
			const rawInputs = [otherInputData, inputRequiringData];

			const jobData = data.randomJob({ inputs: rawInputs });
			const job = new Job({
				...jobData,
				inputs: map(toInput(mockClient), rawInputs), // Instantiate Inputs
				outputs: map(toOutput(mockClient), jobData.outputs || []), // Instantiate Outputs too for consistency
				client: mockClient, // Pass mock client
			});

			expect(job.hasDependencyJobs()).to.eql(true);
		});

		it("returns false when the job has inputs that do not require other", () => {
			const firstInputData = data.randomInput();
			const secondInputData = data.randomInput();
			const rawInputs = [firstInputData, secondInputData];

			const jobData = data.randomJob({ inputs: rawInputs });
			const job = new Job({
				...jobData,
				inputs: map(toInput(mockClient), rawInputs), // Instantiate Inputs
				outputs: map(toOutput(mockClient), jobData.outputs || []), // Instantiate Outputs
				client: mockClient, // Pass mock client
			});

			expect(job.hasDependencyJobs()).to.eql(false);
		});
	});

	describe("getDependencyJobs", () => {
		it("returns the set of jobs that the input resource requires to have " +
			"passed for this job to be run when there is a single input " +
			"resource", async () => {
			const teamName = data.randomTeamName();
			const pipelineName = data.randomPipelineName();

			const firstDependencyJobName = data.randomJobName();
			const secondDependencyJobName = data.randomJobName();

			const inputRequiringData = data.randomInput({
				passed: [firstDependencyJobName, secondDependencyJobName],
			});
			const rawInputs = [inputRequiringData];

			const firstDependencyJobData = data.randomJob({
				name: firstDependencyJobName,
			});
			const secondDependencyJobData = data.randomJob({
				name: secondDependencyJobName,
			});
			const dependentJobData = data.randomJob({ inputs: rawInputs });

			const getJob = sinon.stub();
			const pipelineClient = { getJob };

			const forPipeline = sinon
				.stub()
				.withArgs(pipelineName)
				.returns(pipelineClient);
			const teamClient = { forPipeline };

			const forTeam = sinon.stub().withArgs(teamName).returns(teamClient);
			const client = { forTeam };

			const firstDependencyJob = new Job({ ...firstDependencyJobData, client });
			const secondDependencyJob = new Job({
				...secondDependencyJobData,
				client,
			});

			getJob.withArgs(firstDependencyJobName).resolves(firstDependencyJobData);
			getJob
				.withArgs(secondDependencyJobName)
				.resolves(secondDependencyJobData);

			const job = new Job({
				...dependentJobData,
				inputs: map(toInput(client), rawInputs), // Use actual client here
				outputs: map(toOutput(client), dependentJobData.outputs || []), // Use actual client
				client: client, // Use actual client
			});

			const dependencyJobs = await job.getDependencyJobs();

			// Compare job IDs or names instead of full objects
			const actualJobIds = dependencyJobs.map((j) => j.getId());
			const expectedJobIds = [
				firstDependencyJob.getId(),
				secondDependencyJob.getId(),
			];
			expect(actualJobIds).to.have.members(expectedJobIds);
			expect(actualJobIds).to.have.lengthOf(expectedJobIds.length);
		});

		it("returns the set of jobs that must have passed for all input " +
			"resources for this job to be run when there are many input " +
			"resources", async () => {
			const teamName = data.randomTeamName();
			const pipelineName = data.randomPipelineName();

			const firstDependencyJobName = data.randomJobName();
			const secondDependencyJobName = data.randomJobName();
			const thirdDependencyJobName = data.randomJobName();

			const firstInputData = data.randomInput({
				passed: [firstDependencyJobName, secondDependencyJobName],
			});
			const secondInputData = data.randomInput({
				passed: [secondDependencyJobName, thirdDependencyJobName],
			});
			const rawInputs = [firstInputData, secondInputData];

			const firstDependencyJobData = data.randomJob({
				name: firstDependencyJobName,
			});
			const secondDependencyJobData = data.randomJob({
				name: secondDependencyJobName,
			});
			const thirdDependencyJobData = data.randomJob({
				name: thirdDependencyJobName,
			});
			const dependentJobData = data.randomJob({ inputs: rawInputs });

			const getJob = sinon.stub();
			const pipelineClient = { getJob };

			const forPipeline = sinon
				.stub()
				.withArgs(pipelineName)
				.returns(pipelineClient);
			const teamClient = { forPipeline };

			const forTeam = sinon.stub().withArgs(teamName).returns(teamClient);
			const client = { forTeam };

			const firstDependencyJob = new Job({ ...firstDependencyJobData, client });
			const secondDependencyJob = new Job({
				...secondDependencyJobData,
				client,
			});
			const thirdDependencyJob = new Job({ ...thirdDependencyJobData, client });

			getJob.withArgs(firstDependencyJobName).resolves(firstDependencyJobData);
			getJob
				.withArgs(secondDependencyJobName)
				.resolves(secondDependencyJobData);
			getJob.withArgs(thirdDependencyJobName).resolves(thirdDependencyJobData);

			const job = new Job({
				...dependentJobData,
				inputs: map(toInput(client), rawInputs), // Use actual client
				outputs: map(toOutput(client), dependentJobData.outputs || []), // Use actual client
				client: client, // Use actual client
			});

			const dependencyJobs = await job.getDependencyJobs();

			// Compare job IDs or names
			const actualJobIds = dependencyJobs.map((j) => j.getId());
			const expectedJobIds = [
				firstDependencyJob.getId(),
				secondDependencyJob.getId(),
				thirdDependencyJob.getId(),
			];
			expect(actualJobIds).to.have.members(expectedJobIds);
			expect(actualJobIds).to.have.lengthOf(expectedJobIds.length);
		});

		it("returns no jobs when no input resources require jobs to have " +
			"passed", async () => {
			const rawInputs = [
				data.randomInput({ passed: [] }),
				data.randomInput({ passed: [] }),
			];
			const dependentJobData = data.randomJob({ inputs: rawInputs });

			const job = new Job({
				...dependentJobData,
				inputs: map(toInput(mockClient), rawInputs), // Can use mock client here
				outputs: map(toOutput(mockClient), dependentJobData.outputs || []),
				client: mockClient,
			});

			const dependencyJobs = await job.getDependencyJobs();
			expect(dependencyJobs).to.eql([]);
		});
	});

	describe("getDependencyJobsFor", () => {
		it("returns the set of jobs that the specified input resource requires " +
			"to have passed for this job to be run", async () => {
			const teamName = data.randomTeamName();
			const pipelineName = data.randomPipelineName();

			const firstDependencyJobName = data.randomJobName();
			const secondDependencyJobName = data.randomJobName();
			const thirdDependencyJobName = data.randomJobName();

			const firstResourceName = data.randomResourceName();
			const secondResourceName = data.randomResourceName();

			const firstInputData = data.randomInput({
				resource: firstResourceName,
				passed: [firstDependencyJobName, secondDependencyJobName],
			});
			const secondInputData = data.randomInput({
				resource: secondResourceName,
				passed: [thirdDependencyJobName],
			});
			const rawInputs = [firstInputData, secondInputData];

			const firstDependencyJobData = data.randomJob({
				name: firstDependencyJobName,
			});
			const secondDependencyJobData = data.randomJob({
				name: secondDependencyJobName,
			});
			const thirdDependencyJobData = data.randomJob({
				name: thirdDependencyJobName,
			});
			const dependentJobData = data.randomJob({ inputs: rawInputs });

			const getJob = sinon.stub();
			const pipelineClient = { getJob };

			const forPipeline = sinon
				.stub()
				.withArgs(pipelineName)
				.returns(pipelineClient);
			const teamClient = { forPipeline };

			const forTeam = sinon.stub().withArgs(teamName).returns(teamClient);
			const client = { forTeam };

			const firstDependencyJob = new Job({ ...firstDependencyJobData, client });
			const secondDependencyJob = new Job({
				...secondDependencyJobData,
				client,
			});

			getJob.withArgs(firstDependencyJobName).resolves(firstDependencyJobData);
			getJob
				.withArgs(secondDependencyJobName)
				.resolves(secondDependencyJobData);

			const job = new Job({
				...dependentJobData,
				inputs: map(toInput(client), rawInputs), // Use actual client
				outputs: map(toOutput(client), dependentJobData.outputs || []),
				client: client,
			});

			const dependencyJobs = await job.getDependencyJobsFor(firstResourceName);

			// Compare job IDs or names
			const actualJobIds = dependencyJobs.map((j) => j.getId());
			const expectedJobIds = [
				firstDependencyJob.getId(),
				secondDependencyJob.getId(),
			];
			expect(actualJobIds).to.have.members(expectedJobIds);
			expect(actualJobIds).to.have.lengthOf(expectedJobIds.length);
		});

		it("returns no jobs when the specified input resource does not require " +
			"any jobs to have passed for this job to be run", async () => {
			const resourceName = data.randomResourceName();
			const rawInputs = [
				data.randomInput({ resource: resourceName, passed: [] }),
			];
			const dependentJobData = data.randomJob({ inputs: rawInputs });

			const job = new Job({
				...dependentJobData,
				inputs: map(toInput(mockClient), rawInputs), // Can use mock client
				outputs: map(toOutput(mockClient), dependentJobData.outputs || []),
				client: mockClient,
			});

			const dependencyJobs = await job.getDependencyJobsFor(resourceName);
			expect(dependencyJobs).to.eql([]);
		});

		it("throws an exception when the specified input resource does not exist", async () => {
			const matchingResourceName = data.randomResourceName();
			const otherResourceName = data.randomResourceName();

			const matchingInput = data.randomInput({
				resource: matchingResourceName,
				passed: [],
			});

			const dependentJobData = data.randomJob({
				inputs: data.randomJobInputs({
					inputs: [matchingInput],
				}),
			});

			const client = {};

			const job = new Job({ ...dependentJobData, client });

			try {
				await job.getDependencyJobsFor(otherResourceName);
				expect.fail("Expected an exception to be thrown but none was.");
			} catch (e) {
				expect(e.message).to.eql(
					`No input found for resource name: ${otherResourceName}`,
				);
			}
		});
	});

	describe("hasDependentJobsIn", () => {
		it("returns true when any job in the job set requires the job to " +
			"have passed", () => {
			const firstResourceName = data.randomResourceName();
			const secondResourceName = data.randomResourceName();

			const jobData = data.randomJob({
				outputs: data.randomJobOutputs({
					outputs: [
						data.randomOutput({ resource: firstResourceName }),
						data.randomOutput({ resource: secondResourceName }),
					],
				}),
			});

			const firstDependentJobInputData = data.randomInput({
				resource: firstResourceName,
				passed: [jobData.name],
			});
			const firstDependentJobData = data.randomJob({
				inputs: data.randomJobInputs({
					inputs: [firstDependentJobInputData],
				}),
			});

			const otherJobInputData = data.randomInput({
				resource: secondResourceName,
			});
			const otherJobData = data.randomJob({
				inputs: data.randomJobInputs({ inputs: [otherJobInputData] }),
			});

			const job = new Job({
				...jobData,
				inputs: map(toInput(mockClient), jobData.inputs || []),
				outputs: map(toOutput(mockClient), jobData.outputs || []),
				client: mockClient,
			});
			const dependentJob = new Job({
				...firstDependentJobData,
				inputs: map(toInput(mockClient), [firstDependentJobInputData]),
				outputs: map(toOutput(mockClient), firstDependentJobData.outputs || []),
				client: mockClient,
			});
			const otherJob = new Job({
				...otherJobData,
				inputs: map(toInput(mockClient), [otherJobInputData]),
				outputs: map(toOutput(mockClient), otherJobData.outputs || []),
				client: mockClient,
			});

			const jobSet = new JobSet([dependentJob, otherJob]);

			expect(job.hasDependentJobsIn(jobSet)).to.eql(true);
		});

		it("returns false when no job in the job set requires the job to " +
			"have passed", () => {
			const firstResourceName = data.randomResourceName();
			const secondResourceName = data.randomResourceName();

			const jobData = data.randomJob({
				outputs: data.randomJobOutputs({
					outputs: [
						data.randomOutput({ resource: firstResourceName }),
						data.randomOutput({ resource: secondResourceName }),
					],
				}),
			});

			const firstOtherJobInputData = data.randomInput({
				resource: firstResourceName,
			});
			const firstOtherJobData = data.randomJob({
				inputs: data.randomJobInputs({ inputs: [firstOtherJobInputData] }),
			});

			const secondOtherJobInputData = data.randomInput({
				resource: secondResourceName,
			});
			const secondOtherJobData = data.randomJob({
				inputs: data.randomJobInputs({ inputs: [secondOtherJobInputData] }),
			});

			const job = new Job({
				...jobData,
				inputs: map(toInput(mockClient), jobData.inputs || []),
				outputs: map(toOutput(mockClient), jobData.outputs || []),
				client: mockClient,
			});
			const firstOtherJob = new Job({
				...firstOtherJobData,
				inputs: map(toInput(mockClient), [firstOtherJobInputData]),
				outputs: map(toOutput(mockClient), firstOtherJobData.outputs || []),
				client: mockClient,
			});
			const secondOtherJob = new Job({
				...secondOtherJobData,
				inputs: map(toInput(mockClient), [secondOtherJobInputData]),
				outputs: map(toOutput(mockClient), secondOtherJobData.outputs || []),
				client: mockClient,
			});

			const jobSet = new JobSet([firstOtherJob, secondOtherJob]);

			expect(job.hasDependentJobsIn(jobSet)).to.eql(false);
		});
	});

	describe("isAutomatic", () => {
		it("returns true if any of the job inputs cause the job to trigger", () => {
			const firstInputData = data.randomInput({ trigger: false });
			const secondInputData = data.randomInput({ trigger: true });
			const rawInputs = [firstInputData, secondInputData];

			const jobData = data.randomJob({ inputs: rawInputs });
			const job = new Job({
				...jobData,
				inputs: map(toInput(mockClient), rawInputs),
				outputs: map(toOutput(mockClient), jobData.outputs || []),
				client: mockClient,
			});

			expect(job.isAutomatic()).to.eql(true);
		});

		it("returns true if all of the job inputs cause the job to trigger", () => {
			const firstInputData = data.randomInput({ trigger: true });
			const secondInputData = data.randomInput({ trigger: true });
			const rawInputs = [firstInputData, secondInputData];

			const jobData = data.randomJob({ inputs: rawInputs });
			const job = new Job({
				...jobData,
				inputs: map(toInput(mockClient), rawInputs),
				outputs: map(toOutput(mockClient), jobData.outputs || []),
				client: mockClient,
			});

			expect(job.isAutomatic()).to.eql(true);
		});

		it("returns false if none of the job inputs cause the job to trigger", () => {
			const firstInputData = data.randomInput({ trigger: false });
			const secondInputData = data.randomInput({ trigger: false });
			const rawInputs = [firstInputData, secondInputData];

			const jobData = data.randomJob({ inputs: rawInputs });
			const job = new Job({
				...jobData,
				inputs: map(toInput(mockClient), rawInputs),
				outputs: map(toOutput(mockClient), jobData.outputs || []),
				client: mockClient,
			});

			expect(job.isAutomatic()).to.eql(false);
		});
	});

	describe("isManual", () => {
		it("returns false if any of the job inputs cause the job to trigger", () => {
			const firstInputData = data.randomInput({ trigger: false });
			const secondInputData = data.randomInput({ trigger: true });
			const rawInputs = [firstInputData, secondInputData];

			const jobData = data.randomJob({ inputs: rawInputs });
			const job = new Job({
				...jobData,
				inputs: map(toInput(mockClient), rawInputs),
				outputs: map(toOutput(mockClient), jobData.outputs || []),
				client: mockClient,
			});

			expect(job.isManual()).to.eql(false);
		});

		it("returns false if all of the job inputs cause the job to trigger", () => {
			const firstInputData = data.randomInput({ trigger: true });
			const secondInputData = data.randomInput({ trigger: true });
			const rawInputs = [firstInputData, secondInputData];

			const jobData = data.randomJob({ inputs: rawInputs });
			const job = new Job({
				...jobData,
				inputs: map(toInput(mockClient), rawInputs),
				outputs: map(toOutput(mockClient), jobData.outputs || []),
				client: mockClient,
			});

			expect(job.isManual()).to.eql(false);
		});

		it("returns true if none of the job inputs cause the job to trigger", () => {
			const firstInputData = data.randomInput({ trigger: false });
			const secondInputData = data.randomInput({ trigger: false });
			const rawInputs = [firstInputData, secondInputData];

			const jobData = data.randomJob({ inputs: rawInputs });
			const job = new Job({
				...jobData,
				inputs: map(toInput(mockClient), rawInputs),
				outputs: map(toOutput(mockClient), jobData.outputs || []),
				client: mockClient,
			});

			expect(job.isManual()).to.eql(true);
		});
	});

	describe("getLatestBuild", () => {
		it("returns the latest build (i.e., first build result) for the job", async () => {
			const pipelineName = data.randomPipelineName();
			const teamName = data.randomTeamName();

			const jobData = data.randomJob({
				pipelineName,
			});

			const buildData = data.randomBuild({
				pipelineName,
			});

			const listBuilds = sinon.stub();
			listBuilds.resolves([buildData]);
			const jobClient = { listBuilds };

			const forJob = sinon.stub().withArgs(jobData.name).returns(jobClient);
			const pipelineClient = { forJob };

			const forPipeline = sinon
				.stub()
				.withArgs(pipelineName)
				.returns(pipelineClient);
			const teamClient = { forPipeline };

			const forTeam = sinon.stub().withArgs(teamName).returns(teamClient);
			const client = { forTeam };

			const job = new Job({ ...jobData, client });

			const expectedBuild = new Build({ ...buildData, client });

			const actualBuild = await job.getLatestBuild();

			// Compare Build by ID
			expect(actualBuild).to.be.instanceOf(Build);
			expect(actualBuild.getId()).to.equal(expectedBuild.getId());
		});

		it("returns null when the job has no builds", async () => {
			const pipelineName = data.randomPipelineName();
			const teamName = data.randomTeamName();

			const jobData = data.randomJob({
				pipelineName,
			});

			const listBuilds = sinon.stub();
			listBuilds.resolves([]);
			const jobClient = { listBuilds };

			const forJob = sinon.stub().withArgs(jobData.name).returns(jobClient);
			const pipelineClient = { forJob };

			const forPipeline = sinon
				.stub()
				.withArgs(pipelineName)
				.returns(pipelineClient);
			const teamClient = { forPipeline };

			const forTeam = sinon.stub().withArgs(teamName).returns(teamClient);
			const client = { forTeam };

			const job = new Job({ ...jobData, client });

			const actualBuild = await job.getLatestBuild();

			expect(actualBuild).to.eql(null);
		});
	});

	describe("getLatestBuildWithStatus", () => {
		it("returns the first build with the provided status", async () => {
			const pipelineName = data.randomPipelineName();
			const teamName = data.randomTeamName();

			const jobData = data.randomJob({
				pipelineName,
			});

			const firstBuildData = data.randomBuild({
				pipelineName,
				status: "pending",
			});
			const secondBuildData = data.randomBuild({
				pipelineName,
				status: "succeeded",
			});
			const thirdBuildData = data.randomBuild({
				pipelineName,
				status: "failed",
			});

			const listBuilds = sinon.stub();
			listBuilds.resolves([firstBuildData, secondBuildData, thirdBuildData]);
			const jobClient = { listBuilds };

			const forJob = sinon.stub().withArgs(jobData.name).returns(jobClient);
			const pipelineClient = { forJob };

			const forPipeline = sinon
				.stub()
				.withArgs(pipelineName)
				.returns(pipelineClient);
			const teamClient = { forPipeline };

			const forTeam = sinon.stub().withArgs(teamName).returns(teamClient);
			const client = { forTeam };

			const job = new Job({ ...jobData, client });

			const expectedBuild = new Build({ ...thirdBuildData, client });

			const actualBuild = await job.getLatestBuildWithStatus("failed");

			// Compare Build by ID
			expect(actualBuild).to.be.instanceOf(Build);
			expect(actualBuild.getId()).to.equal(expectedBuild.getId());
		});

		it("returns null when the job has no builds", async () => {
			const pipelineName = data.randomPipelineName();
			const teamName = data.randomTeamName();

			const jobData = data.randomJob({
				pipelineName,
			});

			const listBuilds = sinon.stub();
			listBuilds.resolves([]);
			const jobClient = { listBuilds };

			const forJob = sinon.stub().withArgs(jobData.name).returns(jobClient);
			const pipelineClient = { forJob };

			const forPipeline = sinon
				.stub()
				.withArgs(pipelineName)
				.returns(pipelineClient);
			const teamClient = { forPipeline };

			const forTeam = sinon.stub().withArgs(teamName).returns(teamClient);
			const client = { forTeam };

			const job = new Job({ ...jobData, client });

			const actualBuild = await job.getLatestBuildWithStatus("pending");

			expect(actualBuild).to.eql(null);
		});

		it("returns null when the job has no builds with the " +
			"provided status", async () => {
			const pipelineName = data.randomPipelineName();
			const teamName = data.randomTeamName();

			const jobData = data.randomJob({
				pipelineName,
			});

			const firstBuildData = data.randomBuild({
				pipelineName,
				status: "pending",
			});
			const secondBuildData = data.randomBuild({
				pipelineName,
				status: "succeeded",
			});
			const thirdBuildData = data.randomBuild({
				pipelineName,
				status: "failed",
			});

			const listBuilds = sinon.stub();
			listBuilds.resolves([firstBuildData, secondBuildData, thirdBuildData]);
			const jobClient = { listBuilds };

			const forJob = sinon.stub().withArgs(jobData.name).returns(jobClient);
			const pipelineClient = { forJob };

			const forPipeline = sinon
				.stub()
				.withArgs(pipelineName)
				.returns(pipelineClient);
			const teamClient = { forPipeline };

			const forTeam = sinon.stub().withArgs(teamName).returns(teamClient);
			const client = { forTeam };

			const job = new Job({ ...jobData, client });

			const actualBuild = await job.getLatestBuildWithStatus("aborted");

			expect(actualBuild).to.eql(null);
		});
	});
});
