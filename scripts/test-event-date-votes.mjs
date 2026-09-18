import {strict as assert} from 'node:assert';
import {readFileSync} from 'node:fs';
import {count, rank} from '../event-dates-vote-model.mjs';

const data = JSON.parse(readFileSync(new URL('../data/event-dates-2027-vote/ballots.json',import.meta.url)));
const r = count(data.options,data.ballots);
const expectedOrder = ['jun-7','sep-6','sep-13','sep-20','jun-14','may-31','sep-27','jul-5'];
// Independently supplied reference matrix, from results.png.
const expectedMatrix = [
    [0,53,50,58,53,66,70,75],
    [39,0,42,51,47,52,64,64],
    [41,36,0,61,52,58,70,62],
    [35,30,17,0,49,44,68,56],
    [31,45,42,44,0,51,56,65],
    [20,37,33,45,34,0,55,58],
    [25,21,13,11,34,28,0,48],
    [19,26,29,33,19,28,38,0]
];
assert.deepEqual(r.order,expectedOrder);
assert.deepEqual(expectedOrder.map(a=>expectedOrder.map(b=>r.matrix[a][b])),expectedMatrix);
assert.equal(r.condorcet,'jun-7');
assert.equal(r.strengthTie,false);
assert.equal(r.orderTie,false);
assert.deepEqual(r.victories.filter(v=>!v.locked).map(v=>[v.winner,v.loser,v.votes,v.against]),[['may-31','sep-20',45,44]]);
assert.equal(r.victories.length,28);
assert.equal(data.ballots.length,97);
assert.equal(new Set(data.ballots.map(b=>b.number)).size,97);
assert.equal(r.stats['jun-7'].rejected,2);
assert.equal(r.stats['jul-5'].rejected,33);
assert.ok(Math.abs(Object.values(r.stats).reduce((n,s)=>n+s.fractionalFirst,0)-97)<1e-8);
assert.equal(Object.values(r.stats).reduce((n,s)=>n+s.borda,0),97*28);

// Every possible scenario with at least two candidates: invariant checks.
let scenarios=0;
for(let mask=0;mask<256;mask++) {
    const ids=data.options.filter((_,i)=>mask&(1<<i)).map(o=>o.id);
    if(ids.length<2) continue;
    scenarios++;
    const s=count(data.options,data.ballots,ids);
    assert.equal(s.order.length,ids.length);
    assert.equal(new Set(s.order).size,ids.length);
    for(const a of ids) {
        const stats=s.stats[a];
        assert.equal(stats.ranked+stats.rejected+stats.unranked,97);
        assert.equal(stats.positions.reduce((a,b)=>a+b,0),stats.ranked);
        for(const b of ids) assert.equal(s.matrix[a][b],r.matrix[a][b]);
    }
    for(const v of s.victories.filter(v=>v.locked)) assert.ok(s.order.indexOf(v.winner)<s.order.indexOf(v.loser));
    if(s.condorcet) assert.equal(s.order[0],s.condorcet);
    assert.ok(Math.abs(Object.values(s.stats).reduce((n,v)=>n+v.borda,0)-97*ids.length*(ids.length-1)/2)<1e-8);
}
const opts=['a','b','c'].map(id=>({id,label:id}));
const ballot=(groups,rejected=[])=>({groups,rejected});
assert.equal(rank(ballot([['a','b']],['c']),'c'),Infinity);
const tied=count(opts,[ballot([['a','b']],['c'])]);
assert.equal(tied.matrix.a.b,0); assert.equal(tied.matrix.a.c,1);
assert.equal(tied.stats.a.fractionalFirst,.5);
assert.equal(tied.stats.a.borda,1.5);
assert.equal(tied.orderTie,true);
const omitted=count(opts,[ballot([['a']],['b'])]);
assert.equal(omitted.matrix.b.c,0);
assert.equal(omitted.matrix.c.b,1);
assert.equal(omitted.stats.c.unranked,1);
const cycle=count(opts,[ballot([['a'],['b'],['c']]),ballot([['b'],['c'],['a']]),ballot([['c'],['a'],['b']])]);
assert.equal(cycle.condorcet,undefined);
assert.equal(cycle.strengthTie,true);
assert.equal(cycle.victories.filter(v=>!v.locked).length,1);
const empty=count(opts,[ballot([],['a','b','c'])]);
assert.equal(empty.victories.length,0);assert.equal(empty.stats.a.fractionalFirst,0);
assert.equal(empty.stats.a.borda,1);
console.log(`PASS: reference matrix, result, data integrity, tie/rejection/cycle fixtures, and ${scenarios} candidate scenarios.`);
