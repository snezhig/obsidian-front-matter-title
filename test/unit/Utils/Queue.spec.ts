import Queue from "../../../src/Utils/Queue";

type QueueSet = Set<number>;
const localItems: QueueSet = new Set();
const callback = jest.fn().mockImplementation((items: QueueSet) => items);

const delay = 10;
const queue = new Queue<number, QueueSet>(callback, delay);


describe('Queue Test', () => {
    let queueItems: QueueSet = null;
    test('Callback called after delay only', async () => {
        let last: Promise<QueueSet> = null;
        for (let i = 0; i <= 100; i++) {
            const value = Math.random();
            last = queue.add(value);
            localItems.add(value);
        }
        queueItems = await last;
        expect(callback).toHaveBeenCalledTimes(1);
    })

    test('Queue items must be equal to local items', () => {
        localItems.forEach(e => expect(queueItems.has(e)).toBeTruthy());
        queueItems.forEach(e => expect(localItems.has(e)).toBeTruthy());
    })
})