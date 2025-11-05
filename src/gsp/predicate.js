// Basic predicate utilities for Blocks World
// A predicate is { type: string, args: string[] }

export function pred(type, ...args) {
  return { type, args };
}

export function isVariable(sym) {
  // Variables are symbols like X, Y, Z (single or multiple uppercase letters not in known block set)
  // We'll treat names starting with '?' or lowercase 'var_' as variables as well
  return typeof sym === 'string' && (/^[A-Z]+$/.test(sym) && !['A','B','C','D','TABLE'].includes(sym) || sym.startsWith('?') || sym.startsWith('var_'));
}

export function equals(a, b) {
  return a.type === b.type && a.args.length === b.args.length && a.args.every((v, i) => v === b.args[i]);
}

export function stringify(p) {
  return `${p.type}(${p.args.join(', ')})`;
}

export function containsPredicate(world, p) {
  return world.some(w => equals(w, p));
}

export function substitute(p, bindings) {
  return {
    type: p.type,
    args: p.args.map(arg => (bindings[arg] ? bindings[arg] : arg)),
  };
}

export function unify(pattern, fact, bindings = {}) {
  if (pattern.type !== fact.type || pattern.args.length !== fact.args.length) return null;
  const out = { ...bindings };
  for (let i = 0; i < pattern.args.length; i++) {
    const pat = pattern.args[i];
    const val = fact.args[i];
    if (isVariable(pat)) {
      if (out[pat] && out[pat] !== val) return null; // conflict
      out[pat] = val;
    } else {
      if (pat !== val) return null;
    }
  }
  return out;
}

export function applyEffects(world, addList, delList) {
  // Remove del effects
  const next = world.filter(w => !delList.some(d => equals(d, w)));
  // Add add effects if not present
  addList.forEach(a => {
    if (!next.some(w => equals(w, a))) next.push(a);
  });
  return next;
}
