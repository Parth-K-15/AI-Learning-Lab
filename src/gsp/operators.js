import { pred, substitute } from './predicate';

// Operator schema with variable placeholders X, Y
// Each op: { name, params: ['X','Y'], preconds: [pred(...)] , add: [pred(...)], del: [pred(...)] }

export const OPERATORS = {
  STACK: {
    name: 'STACK',
    params: ['X', 'Y'],
    preconds: [pred('HOLDING', 'X'), pred('CLEAR', 'Y')],
    add: [pred('ON', 'X', 'Y'), pred('ARMEMPTY'), pred('CLEAR', 'X')],
    del: [pred('HOLDING', 'X'), pred('CLEAR', 'Y')],
  },
  UNSTACK: {
    name: 'UNSTACK',
    params: ['X', 'Y'],
    preconds: [pred('ON', 'X', 'Y'), pred('CLEAR', 'X'), pred('ARMEMPTY')],
    add: [pred('HOLDING', 'X'), pred('CLEAR', 'Y')],
    del: [pred('ON', 'X', 'Y'), pred('ARMEMPTY')],
  },
  PICKUP: {
    name: 'PICKUP',
    params: ['X'],
    preconds: [pred('ONTABLE', 'X'), pred('CLEAR', 'X'), pred('ARMEMPTY')],
    add: [pred('HOLDING', 'X')],
    del: [pred('ONTABLE', 'X'), pred('ARMEMPTY')],
  },
  PUTDOWN: {
    name: 'PUTDOWN',
    params: ['X'],
    preconds: [pred('HOLDING', 'X')],
    add: [pred('ONTABLE', 'X'), pred('CLEAR', 'X'), pred('ARMEMPTY')],
    del: [pred('HOLDING', 'X')],
  },
};

export function instantiateOp(op, bindings) {
  const subst = (plist) => plist.map(p => substitute(p, bindings));
  return {
    name: op.name,
    bindings,
    preconds: subst(op.preconds),
    add: subst(op.add),
    del: subst(op.del),
  };
}
