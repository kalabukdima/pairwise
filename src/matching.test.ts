import { generateMatchings } from "./matching";

test("generates matchings correctly", () => {
    expect(generateMatchings(0)).toEqual([
    ]);
    expect(generateMatchings(1)).toEqual([
    ]);
    expect(generateMatchings(3)).toEqual([
        [[0, null], [1, 2]],
        [[0, 1], [2, null]],
        [[0, 2], [1, null]],
    ]);
    expect(generateMatchings(4)).toEqual([
        [[0, 3], [1, 2]],
        [[0, 1], [2, 3]],
        [[0, 2], [1, 3]],
    ]);
    expect(generateMatchings(5)).toEqual([
        [[0, null], [1, 4], [2, 3]],
        [[0, 1], [2, 4], [3, null]],
        [[0, 2], [1, null], [3, 4]],
        [[0, 3], [1, 2], [4, null]],
        [[0, 4], [1, 3], [2, null]],
    ]);
    expect(generateMatchings(6)).toEqual([
        [[0, 5], [1, 4], [2, 3]],
        [[0, 1], [2, 4], [3, 5]],
        [[0, 2], [1, 5], [3, 4]],
        [[0, 3], [1, 2], [4, 5]],
        [[0, 4], [1, 3], [2, 5]],
    ]);
});
