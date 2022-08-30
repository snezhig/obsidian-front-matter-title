import ExplorerSort from "@src/Managers/Features/ExplorerSort";
import {mock} from "jest-mock-extended";
import ResolverInterface, {Resolving} from "@src/Interfaces/ResolverInterface";
import ExplorerViewUndefined from "@src/Managers/Exceptions/ExplorerViewUndefined";
import {TFileExplorerView} from "obsidian";
import LoggerInterface from "@src/Components/Debug/LoggerInterface";

const sort = new ExplorerSort(mock<ResolverInterface<Resolving.Sync>>(), mock<LoggerInterface>());
const view = mock<TFileExplorerView>();

test('Should be disabled', () => expect(sort.isEnabled()).toBeFalsy());

test('Should throw exception because there is no explorer', () => expect(() => sort.enable()).toThrow(ExplorerViewUndefined));

test('Should be enabled after set view', () => {
    expect(sort.setView(view).enable().isEnabled()).toBeTruthy();
})