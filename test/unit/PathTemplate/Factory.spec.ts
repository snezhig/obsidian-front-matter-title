import {expect} from "@jest/globals";
import Factory from "../../../src/PathTemplate/Factory";
import Simple from "../../../src/PathTemplate/Simple";
import Composite from "../../../src/PathTemplate/Composite";

describe('Factory Test', () => {
    test('Return Simple Template', () => {
        const template = Factory.create('title.path');
        expect(template).toBeInstanceOf(Simple);
        expect(template).not.toBeInstanceOf(Composite);
    })

        //TODO add more variants of template
    test('Composite Simple Template', () => {
        const template = Factory.create('{{title.path}}');
        expect(template).toBeInstanceOf(Composite);
        expect(template).not.toBeInstanceOf(Simple);
    })
});