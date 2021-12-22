import assert from 'assert/strict';
// Assume you scan a bunch of package.jsons or whatever and you have the
// following object as a result:
// http://www.plantuml.com/plantuml/png/SoWkIImgAStDuShBJqbLo4tCp2ieoizAJIw12EIabgNc62OYSOnGE4b87ED4P4uI5nUIQGgwkdPmmw0qGim8HGnkD8G6Yy5jWCeH44lYSaZDIm5w2m00
const packages = Object.freeze([
    { "name": "aaa-level2a", "requires": ["level3a"] },
    { "name": "level3a", "requires": [] },
    { "name": "zzz-level1a", "requires": ["aaa-level2a", "level2b"] },
    { "name": "mainproject", "requires": ["zzz-level1a"] },
    { "name": "level3b", "requires": [] },
    { "name": "level2b", "requires": ["level3a", "level3b"] },
])

const expectedOrder = [
    "level3b",
    "level3a",
    "level2b",
    "aaa-level2a",
    "zzz-level1a",
    "mainproject",
];

function getOrder(pkgs, rootName) {
    if (pkgs.length < 1) {
        return [];
    }
    pkgs.sort((a, b) => a.name.localeCompare(b.name))
    // build adjacency list
    const adj = new Map();
    for (const p of pkgs) {
        adj.set(p.name, new Set(p.requires))
    }
    const ordered = [];
    const q = new Set([rootName]);
    // Walk the dag
    // Not doing this recursively so it's easy to plug in sanity checks and
    // other logic.
    for (const current of q) {
        q.delete(current);
        ordered.push(current)
        const deps = adj.get(current);
        for (const d of deps) {
            q.add(d)
        }
    }

    ordered.reverse();
    return ordered;
}

// # tests
// ## base cases
assert.deepEqual(getOrder([], null), []);
assert.deepEqual(getOrder([{ name: "a", requires: ["b"] }, { name: "b", requires: [] }], "a"), ["b", "a"]);
assert.deepEqual(getOrder([{ name: "a", requires: [] }, { name: "b", requires: [] }], "b"), ["b"]);
assert.deepEqual(getOrder([{ name: "a", requires: [] }, { name: "b", requires: [] }], "a"), ["a"]);
assert.deepEqual(getOrder([{ name: "a", requires: [] }], "a"), ["a"]);

// ## realistic
const case1 = packages.slice();
console.log(getOrder(case1, "mainproject"))
assert.deepEqual(getOrder(case1, "mainproject"), expectedOrder);
const case2 = packages.slice();
case2.reverse();
assert.deepEqual(getOrder(case2, "mainproject"), expectedOrder);
const case3 = packages.slice();
case3.sort((a, b) => a.name.localeCompare(b.name))
assert.deepEqual(getOrder(case3, "mainproject"), expectedOrder);
const case4 = packages.slice();
case4.sort((a, b) => -a.name.localeCompare(b.name))
assert.deepEqual(getOrder(case4, "mainproject"), expectedOrder);

console.log(":^)");
console.log("original order", packages.map(p => p.name));
console.log("load order", getOrder(packages.slice(), "mainproject"));
console.log("expected order", expectedOrder);