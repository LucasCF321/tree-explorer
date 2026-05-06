// Compute (x, y) positions for an n-ary tree using Reingold–Tilford-like layout.
import type { TreeNode } from "./tree";

export interface PositionedNode {
  id: string;
  x: number;
  y: number;
  node: TreeNode;
}

const H_GAP = 60; // espaço horizontal entre folhas irmãs
const V_GAP = 140; // espaço vertical entre níveis
const NODE_W = 160; // largura visual de um nó

interface Internal {
  node: TreeNode;
  x: number;
  y: number;
  width: number;
  children: Internal[];
}

/**
 * buildLayout — percorre a árvore em pós-ordem calculando, para cada
 * subárvore, sua largura total e a posição X de seu nó-raiz centralizada
 * sobre os filhos. Base do algoritmo Reingold–Tilford simplificado.
 */
function buildLayout(node: TreeNode, depth: number): Internal {
  if (node.children.length === 0) {
    return { node, x: 0, y: depth * V_GAP, width: NODE_W, children: [] };
  }
  const children = node.children.map((c) => buildLayout(c, depth + 1));
  // posiciona os filhos sequencialmente lado a lado
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

/**
 * leftEdge — encontra o menor X dentro de uma subárvore, usado para
 * empurrar a subárvore inteira sem que ela colida com a vizinha à esquerda.
 */
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

/**
 * shift — desloca recursivamente uma subárvore inteira em `dx` no eixo X,
 * preservando o layout interno relativo entre seus nós.
 */
function shift(n: Internal, dx: number) {
  n.x += dx;
  for (const c of n.children) shift(c, dx);
}

/**
 * layoutTree — função pública. Recebe a raiz da `Tree` e devolve uma lista
 * achatada `[{ id, x, y, node }]` consumida pelo React Flow para desenhar
 * o grafo top-down sem sobreposição de nós. Complexidade: O(n).
 */
export function layoutTree(root: TreeNode | null): PositionedNode[] {
  if (!root) return [];
  const internal = buildLayout(root, 0);
  // normaliza X para que o menor valor seja 0 (origem do canvas)
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
