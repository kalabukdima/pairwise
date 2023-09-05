export type Assignment = [number, number | null];
export type Matching = Assignment[];

function createArray<T>(n: number, init: (index: number) => T): T[] {
    return [...Array(n).keys()].map((_, index) => init(index));
}

// Generates non-intersecting matchings covering all edges of a complete graph with n nodes
export function generateMatchings(n: number): Matching[] {
    if (n < 2) {
        return [];
    }
    if (n % 2 != 0) {
        const matchings = generateMatchings(n + 1);
        return matchings.map(matching => matching.map(pair => {
            if (pair[0] == n)
                return [pair[1]!, null];
            if (pair[1] == n)
                return [pair[0]!, null];
            return pair;
        }));
    }

    // https://en.wikipedia.org/wiki/Round-robin_tournament#Berger_tables
    const matchings: Matching[] = createArray(n - 1, () => []);
    for (let i = 0; i <= n - 2; ++i) {
        for (let j = i + 1; j <= n - 2; ++j) {
            const round = (i + j) % (n - 1);
            matchings[round].push([i, j]);
        }
        matchings[(i + i) % (n - 1)].push([i, n - 1]);
    }
    return matchings;
}
