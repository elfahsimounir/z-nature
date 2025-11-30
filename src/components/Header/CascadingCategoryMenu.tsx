"use client";
import React, { useMemo, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

export type FlatCategory = {
  id: string;
  name: string;
  parentId?: string | null;
};

type TreeCategory = FlatCategory & { children: TreeCategory[] };

function buildTree(flat: FlatCategory[]): TreeCategory[] {
  const map = new Map<string, TreeCategory>();
  const roots: TreeCategory[] = [];
  flat.forEach((c) => map.set(c.id, { ...c, children: [] }));
  map.forEach((c) => {
    if (c.parentId) {
      const p = map.get(c.parentId);
      if (p) p.children.push(c);
    } else {
      roots.push(c);
    }
  });
  return roots;
}

export default function CascadingCategoryMenu({ flatCategories }: { flatCategories: FlatCategory[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const tree = useMemo(() => buildTree(flatCategories), [flatCategories]);

  const [activeL1, setActiveL1] = useState<string | null>(null);
  const [activeL2, setActiveL2] = useState<string | null>(null);

  const l1List = tree;
  const l2List = l1List.find((x) => x.id === activeL1)?.children || [];
  const l3List = l2List.find((x) => x.id === activeL2)?.children || [];

  const go = (name: string) => {
    router.push(`/shop?category=${encodeURIComponent(name)}`);
    setOpen(false);
  };

  const showL2 = !!activeL1;
  const showL3 = !!activeL2;
  const widthClass = showL3 ? "w-[900px]" : showL2 ? "w-[600px]" : "w-[300px]";

  return (
    <li
      className="group relative before:w-0 before:h-[3px] before:bg-primary before:absolute before:left-0 before:top-0 before:rounded-b-[3px] before:ease-out before:duration-200 hover:before:w-full"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => { setOpen(false); setActiveL1(null); setActiveL2(null); }}
    >
      <button
        className="hover:text-primary text-custom-sm font-medium text-dark flex items-center gap-1 xl:py-6"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        Catégories <ChevronDown size={16} />
      </button>

      {open && (
        <div
          className={`absolute left-0 top-full bg-white border border-gray-3 rounded-md shadow-1 z-[9999] ${widthClass}`}
        >
          <div className={`grid ${showL3 ? 'grid-cols-3' : showL2 ? 'grid-cols-2' : 'grid-cols-1'} max-h-[460px]`}>
            {/* L1 */}
            <div className="col-span-1 border-r overflow-auto p-1">
              <ul className="py-2 text-sm divide-y divide-gray-100">
                {l1List.map((c) => (
                  <li key={c.id}>
                    <button
                      className={`w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors rounded-sm ${
                        activeL1 === c.id ? "bg-gray-50 text-primary" : ""
                      }`}
                      onMouseEnter={() => {
                        setActiveL1(c.id);
                        setActiveL2(null);
                      }}
                      onClick={() => go(c.name)}
                    >
                      <span>{c.name}</span>
                      {c.children.length > 0 && <ChevronRight size={16} className="opacity-60" />}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* L2 */}
            {showL2 && (
              <div className="col-span-1 border-r overflow-auto p-1">
                <ul className="py-2 text-sm divide-y divide-gray-100">
                  {l2List.length === 0 && (
                    <li className="px-4 py-3 text-xs text-gray-500">Aucune sous-catégorie</li>
                  )}
                  {l2List.map((c) => (
                    <li key={c.id}>
                      <button
                        className={`w-full flex items-center justify-between px-4 py-3 hover:bg-primary/10 transition-colors rounded-sm ${
                          activeL2 === c.id ? "bg-gray-50 text-primary" : ""
                        }`}
                        onMouseEnter={() => setActiveL2(c.id)}
                        onClick={() => go(c.name)}
                      >
                        <span>{c.name}</span>
                        {c.children.length > 0 && <ChevronRight size={16} className="opacity-60" />}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* L3 */}
            {showL3 && (
              <div className="col-span-1 overflow-auto p-1">
                <ul className="py-2 text-sm divide-y divide-gray-100">
                  {l3List.length === 0 && (
                    <li className="px-4 py-3 text-xs text-gray-500">Aucune sous-catégorie</li>
                  )}
                  {l3List.map((c) => (
                    <li key={c.id}>
                      <button className="w-full px-4 py-3 hover:bg-primary/10 text-left transition-colors rounded-sm" onClick={() => go(c.name)}>
                        {c.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </li>
  );
}


