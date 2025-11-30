"use client";
import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";

export type CategoryNode = {
  id: string;
  name: string;
  parentId?: string | null;
  children?: CategoryNode[];
};

function buildTree(nodes: CategoryNode[]): CategoryNode[] {
  const map = new Map<string, CategoryNode & { children: CategoryNode[] }>();
  const roots: CategoryNode[] = [];
  nodes.forEach((n) => map.set(n.id, { ...n, children: [] }));
  map.forEach((n) => {
    if (n.parentId) {
      const parent = map.get(n.parentId);
      if (parent) parent.children.push(n);
    } else {
      roots.push(n);
    }
  });
  return roots;
}

export default function CategoryTreeMenu({ flatCategories }: { flatCategories: CategoryNode[] }) {
  const tree = buildTree(flatCategories);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const navigateTo = (name: string) => {
    router.push(`/shop?category=${encodeURIComponent(name)}`);
    setOpen(false);
  };

  const Item = ({ node, depth = 0 }: { node: CategoryNode; depth?: number }) => {
    const isLeaf = !node.children || node.children.length === 0;
    return (
      <li className={`py-1 ${depth > 0 ? "pl-3" : ""}`}>
        <button
          className={`text-left w-full hover:text-primary ${isLeaf ? "font-normal" : "font-medium"}`}
          onClick={() => {
            if (isLeaf) navigateTo(node.name);
          }}
        >
          {node.name}
        </button>
        {node.children && node.children.length > 0 && (
          <ul className="mt-1 border-l border-gray-200 ml-2">
            {node.children.map((c) => (
              <Item key={c.id} node={c} depth={(depth || 0) + 1} />
            ))}
          </ul>
        )}
      </li>
    );
  };

  return (
    <div className="relative">
      <button
        className="flex items-center gap-1 text-custom-sm font-medium text-dark hover:text-primary"
        onClick={() => setOpen((o) => !o)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        Catégories <ChevronDown size={16} />
      </button>
      {open && (
        <div
          className="absolute left-0 top-full mt-2 bg-white border border-gray-3 rounded-md shadow-lg p-4 w-[320px] z-[9999]"
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
        >
          {tree.length === 0 ? (
            <div className="text-xs text-gray-500 py-2">Aucune catégorie</div>
          ) : (
            <ul className="text-sm max-h-[360px] overflow-auto pr-2">
              {tree.map((n) => (
                <Item key={n.id} node={n} />
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}


