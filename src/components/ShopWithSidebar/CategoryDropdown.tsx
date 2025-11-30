"use client";

import { useEffect, useMemo, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";

type FlatCategory = { id: string; name: string; parentId?: string | null; products?: any[] };
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

const CategoryItem = ({ category, onChange,selectedCate }) => {
  const [selected, setSelected] = useState(false);
  useEffect(() => {
    setSelected(selectedCate === category.name);
    
    }, [selectedCate,category]);
  return (
    <button
      className={`${
        selected && "text-primary"
      } group flex items-center justify-between ease-out duration-200 hover:text-primary `}
      onClick={() => {
        setSelected(!selected);
        onChange(category.name); // Trigger onChange with the selected category
      }}
    >
      <div className="flex items-center gap-2">
        <div
          className={`cursor-pointer flex items-center justify-center rounded min-w-[1rem] min-h-[1rem] w-4 h-4 whitespace-nowrap border ${
            selected ? "border-primary bg-primary" : "bg-white border-gray-3"
          }`}
        >
          <svg
            className={selected ? "block" : "hidden"}
            width="10"
            height="10"
            viewBox="0 0 10 10"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M8.33317 2.5L3.74984 7.08333L1.6665 5"
              stroke="white"
              strokeWidth="1.94437"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <span className="text-start">{category.name}</span>
      </div>

      <span
        className={`${
          selected ? "text-white bg-primary" : "bg-gray-2"
        } inline-flex rounded-[30px] text-custom-xs px-2 ease-out duration-200 group-hover:text-white group-hover:bg-primary`}
      >
        {category.totalProducts ?? category.products?.length ?? 0}
      </span>
    </button>
  );
};

const CategoryDropdown = ({ categories, selectedCategory, onChange,title }) => {
  const [toggleDropdown, setToggleDropdown] = useState(true);
  const tree = useMemo(() => buildTree(categories || []), [categories]);
  const byId = useMemo(() => {
    const map = new Map<string, FlatCategory>();
    (categories || []).forEach((c: FlatCategory) => map.set(c.id, c));
    return map;
  }, [categories]);
  const selectedAncestorNames = useMemo(() => {
    if (!selectedCategory) return new Set<string>();
    const flat: FlatCategory[] = categories || [];
    const node = flat.find((c) => c.name === selectedCategory);
    const set = new Set<string>();
    let current: FlatCategory | undefined = node;
    let safety = 0;
    while (current && current.parentId && safety < 10) {
      const parent = byId.get(current.parentId);
      if (!parent) break;
      set.add(parent.name);
      current = parent;
      safety++;
    }
    return set;
  }, [selectedCategory, categories, byId]);
  return (
    <div className="bg-white shadow-1 rounded-lg">
      <div
        onClick={(e) => {
          e.preventDefault();
          setToggleDropdown(!toggleDropdown);
        }}
        className={`cursor-pointer flex items-center justify-between py-3 pl-6 pr-5.5 ${
          toggleDropdown && "shadow-filter"
        }`}
      >
        <p className="text-dark">{title}</p>
        <button
          aria-label="button for category dropdown"
          className={`text-dark ease-out duration-200 ${
            toggleDropdown && "rotate-180"
          }`}
        >
          <svg
            className="fill-current"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M4.43057 8.51192C4.70014 8.19743 5.17361 8.161 5.48811 8.43057L12 14.0122L18.5119 8.43057C18.8264 8.16101 19.2999 8.19743 19.5695 8.51192C19.839 8.82642 19.8026 9.29989 19.4881 9.56946L12.4881 15.5695C12.2072 15.8102 11.7928 15.8102 11.5119 15.5695L4.51192 9.56946C4.19743 9.29989 4.161 8.82641 4.43057 8.51192Z"
              fill=""
            />
          </svg>
        </button>
      </div>

      {/* dropdown && 'shadow-filter */}
      {/* <!-- dropdown menu --> */}
      <div className={`flex-col gap-2 py-3 pl-3 pr-3 ${toggleDropdown ? "flex" : "hidden"}`}>
        {tree.map((l1) => (
          <div key={l1.id} className="mb-2">
            <button className={`w-full text-left font-medium hover:text-primary ${(selectedCategory===l1.name || selectedAncestorNames.has(l1.name))? 'text-primary':''}`} onClick={() => onChange(l1.name)}>
              {l1.name}
            </button>
            {l1.children.length > 0 && (
              <div className="pl-3 mt-1 border-l">
                {l1.children.map((l2) => (
                  <div key={l2.id} className="mb-1">
                    <button className={`w-full text-left hover:text-primary ${(selectedCategory===l2.name || selectedAncestorNames.has(l2.name))? 'text-primary':''}`} onClick={() => onChange(l2.name)}>
                      {l2.name}
                    </button>
                    {l2.children.length > 0 && (
                      <div className="pl-3 mt-1 border-l">
                        {l2.children.map((l3) => (
                          <div key={l3.id} className={`flex items-center gap-2 text-xs py-0.5 ${selectedCategory===l3.name? 'text-primary':''}`}>
                            <Checkbox checked={selectedCategory===l3.name} onCheckedChange={()=> onChange(l3.name)} />
                            <button className="text-left hover:text-primary" onClick={() => onChange(l3.name)}>
                              {l3.name}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryDropdown;
