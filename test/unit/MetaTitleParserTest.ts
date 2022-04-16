import {suite, test} from "@testdeck/mocha";

import * as _chai from 'chai';
import * as sinon from 'sinon';
import MetaTitleParser from "../../src/MetaTitleParser";
import {TFile, Vault} from "../mock/obsidian";
import path = require("path");

_chai.should();
_chai.expect;

@suite
class MetaTitleParserTest {
	before(){
		// const vault = sinon.createStubInstance<Vault>(Vault);
		sinon.mock(TFile);
		new MetaTitleParser(sinon.mock(TFile))

	}
	@test
	d(){
	}
}
