import { Handle, Position, type NodeProps } from "reactflow";
import { cn } from "@/lib/utils";

export interface PokeNodeData {
  name: string;
  imageUrl?: string;
  state: "idle" | "visiting" | "visited" | "active" | "found";
  degree: number;
  depth: number;
}

export function PokeNode({ data }: NodeProps<PokeNodeData>) {
  const { name, imageUrl, state, degree, depth } = data;

  const stateClass =
    state === "active"
      ? "ring-2 ring-active shadow-active scale-105"
      : state === "visiting"
        ? "ring-2 ring-visit shadow-visit node-visiting"
        : state === "visited"
          ? "ring-1 ring-visit/50 opacity-90"
          : state === "found"
            ? "ring-2 ring-success shadow-visit"
            : "ring-1 ring-border";

  return (
    <div
      className={cn(
        "bg-gradient-node rounded-xl px-3 py-2 w-[160px] transition-bounce shadow-card",
        stateClass,
      )}
    >
      <Handle type="target" position={Position.Top} className="!bg-accent !border-none !w-2 !h-2" />
      <div className="flex flex-col items-center gap-1">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="w-16 h-16 object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.4)]"
            loading="lazy"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-muted" />
        )}
        <div className="text-sm font-semibold capitalize text-foreground text-center leading-tight">
          {name}
        </div>
        <div className="flex gap-1 text-[10px] text-muted-foreground">
          <span>grau {degree}</span>
          <span>·</span>
          <span>nível {depth}</span>
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-accent !border-none !w-2 !h-2"
      />
    </div>
  );
}
