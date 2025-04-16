import { expect } from "chai";
import { map } from "ramda";

import { toInput } from "../../commonjs/model/Input.js";
import Job from "../../commonjs/model/Job.js";
import JobSet from "../../commonjs/model/JobSet.js";
import { toOutput } from "../../commonjs/model/Output.js";
import data from "../testsupport/data.js";

const mockClient = {};

describe("JobSet", () => {
	it("determines the set of jobs having each resource as input", () => {
		const firstResourceName = data.randomResourceName();
		const secondResourceName = data.randomResourceName();
		const thirdResourceName = data.randomResourceName();

		const job1Input1Data = data.randomInput({ resource: firstResourceName });
		const job1Input2Data = data.randomInput({ resource: secondResourceName });
		const job1InputsData = [job1Input1Data, job1Input2Data];
		const job1Data = data.randomJob({ inputs: job1InputsData });
		const job1 = new Job({
			...job1Data,
			inputs: map(toInput(mockClient), job1InputsData),
			outputs: map(toOutput(mockClient), job1Data.outputs || []),
			client: mockClient,
		});

		const job2Input1Data = data.randomInput({
			resource: firstResourceName,
			passed: [job1.getName()],
		});
		const job2Input2Data = data.randomInput({ resource: thirdResourceName });
		const job2InputsData = [job2Input1Data, job2Input2Data];
		const job2Data = data.randomJob({ inputs: job2InputsData });
		const job2 = new Job({
			...job2Data,
			inputs: map(toInput(mockClient), job2InputsData),
			outputs: map(toOutput(mockClient), job2Data.outputs || []),
			client: mockClient,
		});

		const jobSet = new JobSet([job1, job2]);

		expect(jobSet.getJobsByInputResource()).to.eql({
			[firstResourceName]: [job1, job2],
			[secondResourceName]: [job1],
			[thirdResourceName]: [job2],
		});
	});
});
