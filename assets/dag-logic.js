/* H2A DAG role and connectivity engine. Pure functions for compositional DAGs. */
(function (root) {
  'use strict';
  function graph(nodes, edges) {
    const ids = new Set(nodes.map(n => n.id));
    const parents = new Map(nodes.map(n => [n.id, []]));
    const children = new Map(nodes.map(n => [n.id, []]));
    for (const e of edges) {
      if (!ids.has(e.from) || !ids.has(e.to)) continue;
      children.get(e.from).push(e.to);
      parents.get(e.to).push(e.from);
    }
    function reachable(start, goal, blocked = null) {
      if (!ids.has(start) || !ids.has(goal) || start === goal || start === blocked || goal === blocked) return false;
      const visited = new Set([start]);
      const queue = [start];
      while (queue.length) {
        const current = queue.shift();
        for (const next of children.get(current)) {
          if (next === blocked || visited.has(next)) continue;
          if (next === goal) return true;
          visited.add(next);
          queue.push(next);
        }
      }
      return false;
    }
    const ancestors = id => {
      const found = new Set(), pending = [id];
      while (pending.length) {
        for (const parent of parents.get(pending.shift()) || []) {
          if (!found.has(parent)) {found.add(parent);pending.push(parent);}
        }
      }
      return found;
    };
    function classify(id, exposure, outcome) {
      if (!ids.has(id)) return { structural:[], target:[] };
      const inCount = parents.get(id).length, outCount = children.get(id).length;
      const structural = [];
      if (outCount >= 2) structural.push('Fork');
      if (inCount >= 2) structural.push('Collider');
      if (inCount > 0 && outCount > 0) structural.push('Intermediate');
      const target = [];
      if (id !== exposure && id !== outcome && exposure !== outcome && ids.has(exposure) && ids.has(outcome)) {
        if (reachable(exposure,id) && reachable(id,outcome)) target.push('Mediator');
        // A backdoor common cause needs a path to Y that does NOT pass through X.
        if (reachable(id,exposure) && reachable(id,outcome,exposure)) target.push('Confounder');
      }
      return {structural,target};
    }
    function matrix() {
      return nodes.map(from => nodes.map(to =>
        from.id === to.id ? 'self'
          : children.get(from.id).includes(to.id) ? 'direct'
          : reachable(from.id,to.id) ? 'indirect'
          : 'none'
      ));
    }
    function totals() {
      const m=matrix(), counts={direct:0,indirect:0,reachable:0};
      for (const row of m) for (const cell of row) {
        if (cell==='direct') counts.direct++;
        if (cell==='indirect') counts.indirect++;
      }
      counts.reachable=counts.direct+counts.indirect;
      return counts;
    }
    return {parents,children,ancestors,reachable,classify,matrix,totals};
  }
  root.H2ADagLogic = {graph};
})(typeof window !== 'undefined' ? window : globalThis);
