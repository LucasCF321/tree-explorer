// Compute (x, y) positions for an n-ary tree using Reingold–Tilford-like layout.
import type { TreeNode } from "./tree";

export interface PositionedNode {
  id: string;
  x: number;
  y: number;
  node: TreeNode;
}

const H_GAP = 60; // horizontal gap between leaf siblings
const V_GAP = 140; // vertical gap between levels
const NODE_W = 160;

interface Internal {
  node: TreeNode;
  x: number;
  y: number;
  width: number;
  children: Internal[];
}

function buildLayout(node: TreeNode, depth: number): Internal {
  if (node.children.length === 0) {
    return { node, x: 0, y: depth * V_GAP, width: NODE_W, children: [] };
  }
  const children = node.children.map((c) => buildLayout(c, depth + 1));
  // place children sequentially
  let cursor = 0;
  for (const c of children) {
    shift(c, cursor - leftEdge(c));
    cursor += c.width + H_GAP;
  }
  const totalWidth = cursor - H_GAP;
  const first = children[0];
  const last = children[children.length - 1];
  const centerX = (first.x + last.x) / 2;
  return { node, x: centerX, y: depth * V_GAP, width: Math.max(totalWidth, NODE_W), children };
}

function leftEdge(n: Internal): number {
  let min = n.x;
  const stack = [...n.children];
  while (stack.length) {
    const c = stack.pop()!;
    if (c.x < min) min = c.x;
    stack.push(...c.children);
  }
  return min;
}

function shift(n: Internal, dx: number) {
  n.x += dx;
  for (const c of n.children) shift(c, dx);
}

export function layoutTree(root: TreeNode | null): PositionedNode[] {
  if (!root) return [];
  const internal = buildLayout(root, 0);
  // normalize x so min is 0
  let minX = Infinity;
  const collect = (n: Internal) => {
    if (n.x < minX) minX = n.x;
    n.children.forEach(collect);
  };
  collect(internal);
  const out: PositionedNode[] = [];
  const walk = (n: Internal) => {
    out.push({ id: n.node.id, x: n.x - minX, y: n.y, node: n.node });
    n.children.forEach(walk);
  };
  walk(internal);
  return out;
}
