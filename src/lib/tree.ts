// Generic n-ary tree data structure with traversal & search algorithms.
// All algorithms return ordered arrays of node IDs so the UI can animate them.

export interface NodeData {
  name: string;
  imageUrl?: string;
  meta?: Record<string, string | number>;
}

export class TreeNode {
  id: string;
  data: NodeData;
  parent: TreeNode | null;
  children: TreeNode[];

  constructor(id: string, data: NodeData, parent: TreeNode | null = null) {
    this.id = id;
    this.data = data;
    this.parent = parent;
    this.children = [];
  }

  addChild(child: TreeNode) {
    child.parent = this;
    this.children.push(child);
  }
}

export class Tree {
  root: TreeNode | null;

  constructor(root: TreeNode | null = null) {
    this.root = root;
  }

  // ---------- Lookup ----------
  findById(id: string): TreeNode | null {
    if (!this.root) return null;
    const stack: TreeNode[] = [this.root];
    while (stack.length) {
      const n = stack.pop()!;
      if (n.id === id) return n;
      for (const c of n.children) stack.push(c);
    }
    return null;
  }

  // Search by data.name (case-insensitive substring) — returns first match path
  searchByName(query: string): string[] {
    if (!this.root || !query.trim()) return [];
    const q = query.trim().toLowerCase();
    const found = this.bfs().find((id) => {
      const node = this.findById(id);
      return node?.data.name.toLowerCase().includes(q);
    });
    if (!found) return [];
    return this.pathTo(found);
  }

  pathTo(id: string): string[] {
    const node = this.findById(id);
    if (!node) return [];
    const path: string[] = [];
    let cur: TreeNode | null = node;
    while (cur) {
      path.unshift(cur.id);
      cur = cur.parent;
    }
    return path;
  }

  // ---------- Mutations ----------
  insert(parentId: string, child: TreeNode): boolean {
    const parent = this.findById(parentId);
    if (!parent) return false;
    parent.addChild(child);
    return true;
  }

  remove(id: string): boolean {
    if (!this.root) return false;
    if (this.root.id === id) {
      this.root = null;
      return true;
    }
    const node = this.findById(id);
    if (!node || !node.parent) return false;
    node.parent.children = node.parent.children.filter((c) => c.id !== id);
    return true;
  }

  // ---------- Metrics ----------
  static height(node: TreeNode | null): number {
    if (!node) return 0;
    if (node.children.length === 0) return 1;
    return 1 + Math.max(...node.children.map((c) => Tree.height(c)));
  }

  static depth(node: TreeNode): number {
    let d = 0;
    let cur = node.parent;
    while (cur) {
      d++;
      cur = cur.parent;
    }
    return d;
  }

  static degree(node: TreeNode): number {
    return node.children.length;
  }

  size(): number {
    return this.bfs().length;
  }

  // ---------- Traversals (return id order) ----------
  preOrder(node: TreeNode | null = this.root, acc: string[] = []): string[] {
    if (!node) return acc;
    acc.push(node.id);
    for (const c of node.children) this.preOrder(c, acc);
    return acc;
  }

  postOrder(node: TreeNode | null = this.root, acc: string[] = []): string[] {
    if (!node) return acc;
    for (const c of node.children) this.postOrder(c, acc);
    acc.push(node.id);
    return acc;
  }

  // For n-ary: visit first child, then root, then remaining children
  inOrder(node: TreeNode | null = this.root, acc: string[] = []): string[] {
    if (!node) return acc;
    if (node.children.length === 0) {
      acc.push(node.id);
      return acc;
    }
    this.inOrder(node.children[0], acc);
    acc.push(node.id);
    for (let i = 1; i < node.children.length; i++) this.inOrder(node.children[i], acc);
    return acc;
  }

  // ---------- Search ----------
  // DFS using explicit stack — O(n)
  dfs(targetId?: string): string[] {
    if (!this.root) return [];
    const order: string[] = [];
    const stack: TreeNode[] = [this.root];
    while (stack.length) {
      const n = stack.pop()!;
      order.push(n.id);
      if (targetId && n.id === targetId) return order;
      // push reversed so left-most child is visited first
      for (let i = n.children.length - 1; i >= 0; i--) stack.push(n.children[i]);
    }
    return order;
  }

  // BFS using queue — O(n)
  bfs(targetId?: string): string[] {
    if (!this.root) return [];
    const order: string[] = [];
    const queue: TreeNode[] = [this.root];
    while (queue.length) {
      const n = queue.shift()!;
      order.push(n.id);
      if (targetId && n.id === targetId) return order;
      for (const c of n.children) queue.push(c);
    }
    return order;
  }

  // ---------- Serialization ----------
  toJSON(node: TreeNode | null = this.root): unknown {
    if (!node) return null;
    return {
      id: node.id,
      data: node.data,
      children: node.children.map((c) => this.toJSON(c)),
    };
  }

  static fromJSON(json: any, parent: TreeNode | null = null): TreeNode | null {
    if (!json) return null;
    const node = new TreeNode(json.id, json.data, parent);
    node.children = (json.children || [])
      .map((c: any) => Tree.fromJSON(c, node))
      .filter(Boolean) as TreeNode[];
    return node;
  }
}
