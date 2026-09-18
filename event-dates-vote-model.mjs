// Ranked Pairs semantics match Humans RankedChoiceCounter:
// margin descending, winning votes descending, then authored candidate order.
export function rank(ballot, id) {
    const index = ballot.groups.findIndex(group => group.includes(id));
    return index < 0 ? Infinity : index;
}

export function preference(ballot, id) {
    const ranked = rank(ballot, id);
    return ranked < Infinity ? ranked : ballot.groups.length + (ballot.rejected.includes(id) ? 1 : 0);
}

export function count(options, ballots, active = options.map(o => o.id)) {
    const ids = options.map(o => o.id).filter(id => active.includes(id));
    const matrix = Object.fromEntries(ids.map(a => [a, Object.fromEntries(ids.map(b =>
        [b, a === b ? 0 : ballots.filter(ballot => preference(ballot, a) < preference(ballot, b)).length]))]));
    const edges = Object.fromEntries(ids.map(id => [id, []]));
    const victories = [];
    for (const a of ids) for (const b of ids) {
        if (matrix[a][b] > matrix[b][a]) victories.push({
            winner: a, loser: b, votes: matrix[a][b], against: matrix[b][a],
            margin: matrix[a][b] - matrix[b][a]
        });
    }
    victories.sort((a, b) => b.margin - a.margin || b.votes - a.votes ||
        ids.indexOf(a.winner) - ids.indexOf(b.winner) || ids.indexOf(a.loser) - ids.indexOf(b.loser));
    function path(a, b, seen = new Set()) {
        if (a === b) return true;
        if (seen.has(a)) return false;
        seen.add(a);
        return edges[a].some(next => path(next, b, seen));
    }
    for (const victory of victories) {
        victory.locked = !path(victory.loser, victory.winner);
        if (victory.locked) edges[victory.winner].push(victory.loser);
    }
    const remaining = new Set(ids), order = [];
    let orderTie = false;
    while (remaining.size) {
        const sources = ids.filter(id => remaining.has(id) &&
            !ids.some(other => remaining.has(other) && edges[other].includes(id)));
        if (sources.length > 1) orderTie = true;
        order.push(sources[0]);
        remaining.delete(sources[0]);
    }
    const stats = Object.fromEntries(ids.map(id => {
        let first = 0, sharedFirst = 0, fractionalFirst = 0, rejected = 0, borda = 0;
        const positions = Array(ids.length).fill(0);
        for (const ballot of ballots) {
            const groups = ballot.groups.map(g => g.filter(v => ids.includes(v))).filter(g => g.length);
            if (groups[0]?.includes(id)) {
                sharedFirst++;
                if (groups[0].length === 1) first++;
                fractionalFirst += 1 / groups[0].length;
            }
            if (ballot.rejected.includes(id)) rejected++;
            const unranked = ids.filter(v => rank(ballot, v) === Infinity && !ballot.rejected.includes(v));
            const bottom = ids.filter(v => ballot.rejected.includes(v));
            if (unranked.length) groups.push(unranked);
            if (bottom.length) groups.push(bottom);
            let position = 0;
            for (const group of groups) {
                if (group.includes(id)) {
                    borda += ids.length - 1 - position - (group.length - 1) / 2;
                    if (rank(ballot, id) !== Infinity) positions[position]++;
                }
                position += group.length;
            }
        }
        return [id, {first, sharedFirst, fractionalFirst, rejected, borda, positions,
            unranked: ballots.filter(b => rank(b, id) === Infinity && !b.rejected.includes(id)).length,
            ranked: ballots.filter(b => rank(b, id) < Infinity).length,
            wins: ids.filter(b => b !== id && matrix[id][b] > matrix[b][id]).length}];
    }));
    return {ids, matrix, victories, order, orderTie, stats,
        condorcet: ids.find(a => ids.every(b => a === b || matrix[a][b] > matrix[b][a])),
        strengthTie: victories.some((v, i) => i && v.margin === victories[i - 1].margin && v.votes === victories[i - 1].votes)};
}
