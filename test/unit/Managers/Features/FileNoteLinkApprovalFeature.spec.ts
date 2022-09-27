import { mock } from "jest-mock-extended";
import DispatcherInterface from "@src/Components/EventDispatcher/Interfaces/DispatcherInterface";
import { AppEvents } from "@src/Types";
import CallbackInterface from "@src/Components/EventDispatcher/Interfaces/CallbackInterface";
import Event from "@src/Components/EventDispatcher/Event";
import { Feature } from "@src/enum";
import LinkNoteApproveFeature from "@src/Managers/Features/FileNoteLinkApproveFeature";
import ChangeApproveModal from "@src/UI/ChangeApproveModal";
import { Modal } from "obsidian";
import LoggerInterface from "@src/Components/Debug/LoggerInterface";

const mockDispatcher = mock<DispatcherInterface<AppEvents>>();
let cb: CallbackInterface<AppEvents["note:link:change:approve"]> = null;

const mockObsModal = mock<Modal>();
const mockModal = mock<ChangeApproveModal>();

mockModal.create.mockImplementationOnce((p, c, r) => {
    r(false);
    return mockObsModal;
});

const feature = new LinkNoteApproveFeature(mock<LoggerInterface>(), mockDispatcher, mockModal);
test("Should return right id", () => {
    expect(LinkNoteApproveFeature.id()).toEqual(Feature.FileNoteLinkApproval);
    expect(feature.getId()).toEqual(Feature.FileNoteLinkApproval);
});

test("Should not add listener", () => {
    expect(mockDispatcher.addListener).not.toHaveBeenCalled();
});

test("Should add listener and be enabled", async () => {
    mockDispatcher.addListener.mockImplementationOnce(
        (n, c: CallbackInterface<AppEvents["note:link:change:approve"]>) => (cb = c)
    );
    await feature.enable();
    await feature.enable();
    expect(feature.isEnabled()).toBeTruthy();
    expect(mockDispatcher.addListener).toHaveBeenCalledTimes(1);
    expect(mockDispatcher.addListener).toHaveBeenCalledWith("note:link:change:approve", cb);
});

test("Should not add listener twice", async () => {
    await feature.enable();
    expect(mockDispatcher.addListener).toHaveBeenCalledTimes(1);
});
describe("Test callback", () => {
    const event = new Event<AppEvents["note:link:change:approve"]>({
        changes: [],
        path: "",
        approve: Promise.resolve(true),
    });

    test("Should return promise with false", async () => {
        const actual = await cb.execute(event).get().approve;
        expect(actual).toBeFalsy();
    });
    test("Should remove listener and be disabled", async () => {
        await feature.disable();
        expect(feature.isEnabled()).toBeFalsy();
        expect(mockDispatcher.removeListener).toHaveBeenCalledWith("note:link:change:approve", cb);
    });
});

test("Should not dispatch anything and only 1 listener has been added", () => {
    expect(mockDispatcher.dispatch).not.toHaveBeenCalled();
    expect(mockDispatcher.addListener).toHaveBeenCalledTimes(1);
});
