import LogicPlaceholder from "@src/Creator/Template/Placeholders/LogicPlaceholder";
import { TemplatePlaceholderFactoryInterface, TemplatePlaceholderInterface } from "@src/Creator/Interfaces";
import { mock } from "jest-mock-extended"; // Import your actual interfaces

// Create mock implementations for the interfaces
const mockFactory = mock<TemplatePlaceholderFactoryInterface>();

describe("LogicPlaceholder", () => {
    let logicPlaceholder: LogicPlaceholder;

    beforeEach(() => {
        logicPlaceholder = new LogicPlaceholder(mockFactory);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should set the placeholder and create child placeholders", () => {
        const placeholder = "child1|child2|child3";
        logicPlaceholder.setPlaceholder(placeholder);

        expect(logicPlaceholder.getPlaceholder()).toBe(placeholder);

        // Ensure create was called for each child
        expect(mockFactory.create).toHaveBeenCalledTimes(3);
        expect(mockFactory.create).toHaveBeenCalledWith("child1");
        expect(mockFactory.create).toHaveBeenCalledWith("child2");
        expect(mockFactory.create).toHaveBeenCalledWith("child3");
    });

    it("should recursively call makeValue on child placeholders and return the first non-null value", () => {
        const child1 = mock<TemplatePlaceholderInterface>();
        const child2 = mock<TemplatePlaceholderInterface>();
        const child3 = mock<TemplatePlaceholderInterface>();
        const path = "somePath";

        // Configure mock children
        child1.makeValue.mockReturnValue(null);
        child2.makeValue.mockReturnValue("value2");
        child3.makeValue.mockReturnValue("value3");

        const placeholder = "child1|child2|child3";

        mockFactory.create.mockImplementation((p: string) => {
            switch (p) {
                case "child1":
                    return child1;
                case "child2":
                    return child2;
                case "child3":
                    return child3;
            }
        });

        // Set the children
        logicPlaceholder.setPlaceholder(placeholder);

        const result = logicPlaceholder.makeValue(path);

        expect(result).toBe("value2"); // It should return the first non-null value

        // Ensure makeValue was called for each child in the correct order
        expect(child1.makeValue).toHaveBeenCalledWith(path);
        expect(child2.makeValue).toHaveBeenCalledWith(path);
        expect(child3.makeValue).not.toHaveBeenCalled(); // It should short-circuit after finding a non-null value
    });
});
