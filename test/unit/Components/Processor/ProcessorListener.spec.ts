import { mock } from "jest-mock-extended";
import ProcessorListener from "../../../../src/Components/Processor/ProccessorListener";
import { EventDispatcher } from "../../../../src/Components/EventDispatcher/EventDispatcher";
import { AppEvents } from "../../../../src/Types";
import { ProcessorFactory } from "../../../../src/Components/Processor/ProcessorUtils";

const mockDispatcher = mock<EventDispatcher<AppEvents>>();
const mockFactory = mock<ProcessorFactory>();

const listener = new ProcessorListener(mockDispatcher, mockFactory);

test("Stub", () => {
    expect(1).toEqual(1);
});
