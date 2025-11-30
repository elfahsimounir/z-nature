"use client";
import React, { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
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

export default function MegaCategoryMenu({ flatCategories }: { flatCategories: FlatCategory[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const tree = useMemo(() => buildTree(flatCategories), [flatCategories]);

  const go = (name: string) => {
    router.push(`/shop?category=${encodeURIComponent(name)}`);
    setOpen(false);
  };

  return (
    <li
      className="group relative before:w-0 before:h-[3px] before:bg-primary before:absolute before:left-0 before:top-0 before:rounded-b-[3px] before:ease-out before:duration-200 hover:before:w-full"
    >
      <button
        onClick={() => setOpen((o) => !o)}
        onMouseEnter={() => setOpen(true)}
        className="hover:text-primary text-custom-sm font-medium text-dark flex items-center gap-1 xl:py-6"
      >
        Catégories <ChevronDown size={16} />
      </button>

      {/* Mega panel */}
      {open && (
        <div
          onMouseLeave={() => setOpen(false)}
          className="absolute left-0 top-full w-[860px] bg-white border border-gray-3 shadow-1 rounded-md p-5 z-[9999]"
        >
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-h-[420px] overflow-auto">
            {tree.map((l1) => (
              <div key={l1.id} className="min-w-[220px]">
                <div className="text-dark font-semibold mb-2 cursor-pointer hover:text-primary" onClick={() => go(l1.name)}>
                  {l1.name}
                </div>
                {l1.children.length === 0 ? (
                  <div className="text-xs text-gray-500">Aucune sous-catégorie</div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {l1.children.map((l2) => (
                      <div key={l2.id}>
                        <div className="text-sm font-medium cursor-pointer hover:text-primary" onClick={() => go(l2.name)}>
                          {l2.name}
                        </div>
                        <ul className="text-xs mt-1 space-y-1">
                          {l2.children.slice(0, 8).map((l3) => (
                            <li key={l3.id}>
                              <button className="hover:text-primary" onClick={() => go(l3.name)}>
                                {l3.name}
                              </button>
                            </li>
                          ))}
                          {l2.children.length > 8 && (
                            <li>
                              <button className="text-primary" onClick={() => go(l2.name)}>
                                Voir plus...
                              </button>
                            </li>
                          )}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </li>
  );
}


