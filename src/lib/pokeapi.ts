// PokéAPI integration: build evolution-chain trees.
import { Tree, TreeNode, type NodeData } from "./tree";

const API = "https://pokeapi.co/api/v2";

interface ChainLink {
  species: { name: string; url: string };
  evolves_to: ChainLink[];
}

interface EvolutionChainResponse {
  id: number;
  chain: ChainLink;
}

const idFromUrl = (url: string) => {
  const parts = url.split("/").filter(Boolean);
  return parts[parts.length - 1];
};

const spriteFor = (speciesId: string) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${speciesId}.png`;

async function buildNode(link: ChainLink, parent: TreeNode | null): Promise<TreeNode> {
  const speciesId = idFromUrl(link.species.url);
  const data: NodeData = {
    name: link.species.name,
    imageUrl: spriteFor(speciesId),
    meta: { speciesId: Number(speciesId) },
  };
  const node = new TreeNode(`${link.species.name}-${speciesId}`, data, parent);
  for (const child of link.evolves_to) {
    const childNode = await buildNode(child, node);
    node.children.push(childNode);
  }
  return node;
}

export async function fetchEvolutionChain(chainId: number): Promise<Tree> {
  const res = await fetch(`${API}/evolution-chain/${chainId}`);
  if (!res.ok) throw new Error(`Failed to fetch chain ${chainId}: ${res.status}`);
  const json = (await res.json()) as EvolutionChainResponse;
  const root = await buildNode(json.chain, null);
  return new Tree(root);
}

// A few hand-picked rich chains (Eevee = best n-ary example with 8 evolutions)
export const FEATURED_CHAINS: { id: number; label: string }[] = [
  { id: 67, label: "Eevee (8 evoluções)" },
  { id: 1, label: "Bulbasaur" },
  { id: 2, label: "Charmander" },
  { id: 3, label: "Squirtle" },
  { id: 10, label: "Caterpie" },
  { id: 18, label: "Pidgey" },
  { id: 47, label: "Oddish" },
  { id: 79, label: "Tyrogue" },
];
