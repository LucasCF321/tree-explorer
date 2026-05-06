// PokéAPI integration: build evolution-chain trees.
import { Tree, TreeNode, type NodeData } from "./tree";

const API = "https://pokeapi.co/api/v2";

/**
 * Formato cru retornado pela PokéAPI para cada elo da cadeia de evolução.
 * `evolves_to` é uma lista — é o que torna a estrutura naturalmente n-ária
 * (Eevee evolui em 8 Pokémons diferentes, por exemplo).
 */
interface ChainLink {
  species: { name: string; url: string };
  evolves_to: ChainLink[];
}

interface EvolutionChainResponse {
  id: number;
  chain: ChainLink;
}

/**
 * idFromUrl — extrai o ID numérico no final de uma URL da PokéAPI.
 * Ex.: ".../pokemon-species/133/" → "133". O(1).
 */
const idFromUrl = (url: string) => {
  const parts = url.split("/").filter(Boolean);
  return parts[parts.length - 1];
};

/**
 * spriteFor — monta a URL da arte oficial do Pokémon a partir do ID
 * da espécie, usando o repositório público de sprites da PokéAPI. O(1).
 */
const spriteFor = (speciesId: string) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${speciesId}.png`;

/**
 * buildNode — converte recursivamente um `ChainLink` (formato da API)
 * em um `TreeNode` da nossa estrutura, descendo por `evolves_to`.
 * É aqui que a resposta aninhada da API vira de fato uma árvore n-ária.
 * Complexidade: O(n) sobre o número de espécies da cadeia.
 */
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

/**
 * fetchEvolutionChain — faz o fetch HTTP da cadeia de evolução de id `chainId`,
 * dispara `buildNode` na raiz e devolve uma `Tree` pronta para ser visualizada.
 * Complexidade: O(n) + custo de I/O da requisição.
 */
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
