import { expect } from "chai";
import Output from "../../commonjs/model/Output.js";
import data from "../testsupport/data.js";

describe("Output", () => {
	it("exposes its attributes", () => {
		const outputData = data.randomOutput();

		const output = new Output(outputData);

		expect(output.getName()).to.eql(outputData.name);
		expect(output.getResourceName()).to.eql(outputData.resource);
	});
});
