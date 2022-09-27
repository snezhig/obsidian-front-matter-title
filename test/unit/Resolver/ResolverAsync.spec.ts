import ResolverAsync from "@src/Resolver/ResolverAsync";
import { mock } from "jest-mock-extended";
import ResolverInterface from "@src/Interfaces/ResolverInterface";

const path = "/path/to/file.md";
const expected = "resolver_value";
const resolverSync = mock<ResolverInterface>();
resolverSync.resolve.mockImplementation(() => expected);
const resolver = new ResolverAsync(resolverSync);

describe("Test Resolver", () => {
    test("Should return promise with answer from sync resolver", async () => {
        await expect(resolver.resolve(path)).resolves.toEqual(expected);
        expect(resolverSync.resolve).toHaveBeenCalledTimes(1);
        expect(resolverSync.resolve).toHaveBeenCalledWith(path);
    });
});
