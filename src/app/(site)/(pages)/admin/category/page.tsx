"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { DataTable } from "@/components/Table/DataTable";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Plus, Pencil, Trash2 } from "lucide-react";
import Breadcrumbs from "@/components/Table/Breadcrumbs";
import FormModal from "@/components/Table/FormModal";
import CategoryFormModal from "@/components/Table/CategoryFormModal";
import { Checkbox } from "@/components/ui/checkbox";
import Breadcrumb from "@/components/Common/Breadcrumb";
import { useNotification } from "@/hooks/notificationContext";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";


const fields = [
  { name: "name", label: "Name", type: "text" as const, placeholder: "Enter category name" },
  { name: "description", label: "Description", type: "text" as const, placeholder: "Enter description" },
  { name: "parentId", label: "Parent Category", type: "select" as const, placeholder: "Select parent (optional)", options: [] as any },
  { name: "image", label: "Image", type: "file" as const, placeholder: "Upload image" },
];
const schema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters long").nonempty("Name is required"),
  description: z.string().optional(),
  parentId: z.string().optional(),
  image: z.any().optional(),
});

export default function CategoryAdminPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [defaultValues, setDefaultValues] = useState<any>({});
  const [openModal, setOpenModal] = useState(false);
  const [openCategoryModal, setOpenCategoryModal] = useState(false);
  const { showNotification, showConfirmation } = useNotification(); // Destructure showNotification and showConfirmation
  const [activeL1, setActiveL1] = useState<string | undefined>(undefined);
  const [activeL2ByL1, setActiveL2ByL1] = useState<Record<string, string | undefined>>({});

  useEffect(() => {
    fetch("/api/category")
      .then((res) => res.json())
      .then((data) => {
        const arr = Array.isArray(data) ? data : [];
        setCategories(arr);
        const roots = arr.filter((c: any) => (c.level || 1) === 1);
        if (!activeL1 && roots.length > 0) {
          setActiveL1(roots[0].id);
        }
        const init: Record<string, string | undefined> = {};
        roots.forEach((r: any) => {
          const kids = arr.filter((c: any) => c.parentId === r.id);
          init[r.id] = kids[0]?.id;
        });
        setActiveL2ByL1((prev) => ({ ...init, ...prev }));
      })
      .catch(console.error);
  }, []);

  const handleSubmit = async (data) => {
    const method = defaultValues?.id ? "PUT" : "POST";

    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("description", data.description || "");
    if (data.parentId && data.parentId !== "none") {
      formData.append("parentId", data.parentId);
    }
    if (defaultValues?.id) {
      formData.append("id", defaultValues.id);
    }
    if (data.images && data.images[0]) {
      formData.append("image", data.images[0]);
    }

    try {
      const res = await fetch("/api/category", {
        method,
        body: formData,
      });

      if (res.ok) {
        const updatedCategory = await res.json();
        setCategories((prev) => {
          const categoriesArray = Array.isArray(prev) ? prev : []; // Ensure `prev` is always an array
          return defaultValues?.id
            ? categoriesArray.map((cat) => (cat.id === updatedCategory.id ? updatedCategory : cat))
            : [...categoriesArray, updatedCategory];
        });
        setOpenModal(false);
        showNotification(
          defaultValues.id
            ? `Category "${updatedCategory.name}" updated successfully`
            : `Category "${updatedCategory.name}" added successfully`,
          "success"
        );
      } else {
        const error = await res.json();
        showNotification(error.message || "An error occurred", "error");
      }
    } catch (err) {
      showNotification("Failed to submit data", "error");
    }
  };

  const handleDeleteOne = async (cat: any) => {
    const buildPath = (c: any) => {
      const parts: string[] = [];
      let current = c;
      let safety = 0;
      while (current && safety < 5) {
        parts.unshift(current.name);
        if (!current.parentId) break;
        current = categories.find((x) => x.id === current.parentId);
        safety++;
      }
      return parts.join(" / ");
    };
    const descendants: any[] = [];
    const collect = (id: string) => {
      const kids = categories.filter((c) => c.parentId === id);
      kids.forEach((k) => {
        descendants.push(k);
        collect(k.id);
      });
    };
    collect(cat.id);
    const totalToDelete = 1 + descendants.length;
    const l2Count = descendants.filter((d) => (d.level || 1) === 2).length;
    const l3Count = descendants.filter((d) => (d.level || 1) === 3).length;
    const previewNames = descendants.slice(0, 5).map((d) => `- ${d.name}`).join("\n");
    const pathStr = buildPath(cat);

    const confirmed = await new Promise((resolve) => {
      showConfirmation(
        {
          title: "Supprimer la catégorie",
          message: `Vous êtes sur le point de supprimer : "${cat.name}" (niveau ${cat.level || 1})\nChemin : ${pathStr}\n\nCette action est irréversible.`,
          stats: [
            { label: "Total", value: totalToDelete },
            { label: "Niveau 2", value: l2Count },
            { label: "Niveau 3", value: l3Count },
          ],
          items: previewNames ? previewNames.split("\n") : [],
          confirmLabel: "Confirmer",
          cancelLabel: "Annuler",
        },
        () => resolve(true),
        () => resolve(false)
      );
    });
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/category?id=${encodeURIComponent(cat.id)}`, { method: "DELETE" });
      if (res.ok) {
        const deletedIds = new Set<string>();
        // remove cat and its descendants from UI state
        const removeDesc = (id: string) => {
          deletedIds.add(id);
          categories
            .filter((c) => c.parentId === id)
            .forEach((child) => removeDesc(child.id));
        };
        removeDesc(cat.id);
        setCategories((prev) => prev.filter((c) => !deletedIds.has(c.id)));
        showNotification("Catégorie supprimée", "success");
      } else {
        const error = await res.json();
        showNotification(error?.error || "Échec de la suppression", "error");
      }
    } catch (e) {
      showNotification("Erreur lors de la suppression", "error");
    }
  };

  const handleEdit = (category) => {
    setDefaultValues({
      id: category.id,
      name: category.name,
      description: category.description || "",
      parentId: category.parentId || "none",
    });
    setOpenModal(true);
  };

  const handleAdd = () => {
    setDefaultValues({});
    setOpenModal(true);
  };
  const handleAddWithParent = (parentId?: string) => {
    setDefaultValues({ parentId: parentId || "none" });
    setOpenCategoryModal(true);
  };
  const level1 = categories.filter((c) => (c.level || 1) === 1);
  const childrenOf = (id: string) => categories.filter((c) => c.parentId === id);
  const breadcrumb={
    title: "Gérer les catégories",
    pages: [ "Admin", "/ Catégories"],
  }

  return (
    <div className="container mx-auto p-6 bg-gray-100 min-h-screen">
   <Breadcrumb
  title={breadcrumb.title}
  pages={breadcrumb.pages}
/>
      <CategoryFormModal
        display={openCategoryModal}
        defaultValues={{}}
        parentPath={(function () {
          const p = defaultValues?.parentId && defaultValues.parentId !== "none"
            ? categories.find((c) => c.id === defaultValues.parentId)
            : null;
          if (!p) return null;
          const parts: string[] = [];
          let current: any = p;
          let safety = 0;
          while (current && safety < 5) {
            parts.unshift(current.name);
            if (!current.parentId) break;
            current = categories.find((c) => c.id === current.parentId);
            safety++;
          }
          return parts.join(" / ");
        })()}
        showModal={() => setOpenCategoryModal(false)}
        onSubmit={async (data: any) => {
          const formData = new FormData();
          formData.append("name", data.name);
          formData.append("description", data.description || "");
          if (defaultValues?.parentId && defaultValues.parentId !== "none") {
            formData.append("parentId", defaultValues.parentId);
          }
          if (Array.isArray(data.images) && data.images[0]) {
            formData.append("image", data.images[0]);
          }
          const res = await fetch("/api/category", { method: "POST", body: formData });
          if (res.ok) {
            const newCat = await res.json();
            setCategories((prev) => [...prev, newCat]);
            setOpenCategoryModal(false);
            showNotification(`Category "${newCat.name}" added successfully`, "success");
          } else {
            const error = await res.json();
            showNotification(error?.error || "Failed to add category", "error");
          }
        }}
      />
      {/* Gestion de l'arborescence des catégories */}
      <div className="rounded-md bg-white p-4 shadow-1 mb-6">
        <div className="flex items-center justify-between mb-4">
          <p className="font-medium">Catégories Niveau 1</p>
          <Button variant="ghost" onClick={() => handleAddWithParent(undefined)}>
            <Plus size={16} className="mr-1" /> Ajouter niveau 1
          </Button>
        </div>
        <Tabs defaultValue={activeL1 || level1[0]?.id || "_none"} className="w-full">
          <TabsList className="flex flex-wrap gap-2">
            {level1.map((c) => (
              <TabsTrigger key={c.id} value={c.id} onClick={() => setActiveL1(c.id)}>
                <span className="inline-flex items-center gap-2">
                  {c.name}
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                    {(categories.filter((x) => x.parentId === c.id)).length}
                  </span>
                </span>
              </TabsTrigger>
            ))}
          </TabsList>

          {level1.map((l1) => {
            const l2 = childrenOf(l1.id);
            const activeL2 = activeL2ByL1[l1.id] || l2[0]?.id || "_none";
            return (
              <TabsContent key={l1.id} value={l1.id}>
                <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Parent :</span>
                    <span className="font-medium">{l1.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" onClick={() => handleEdit(l1)}><Pencil size={16} /></Button>
                    <Button variant="ghost" onClick={() => handleDeleteOne(l1)}><Trash2 size={16} /></Button>
                    <Button variant="ghost" onClick={() => handleAddWithParent(l1.id)}>
                      <Plus size={16} className="mr-1" /> Ajouter niveau 2
                    </Button>
                  </div>
             </div>

                <div className="mt-4">
                  {l2.length === 0 ? (
                    <div className="text-sm text-gray-500">Aucune catégorie de niveau 2.</div>
                  ) : (
                    <Tabs defaultValue={activeL2} className="w-full">
                      <TabsList className="flex flex-wrap gap-2">
                        {l2.map((c) => (
                          <TabsTrigger
                            key={c.id}
                            value={c.id}
                            onClick={() => setActiveL2ByL1((prev) => ({ ...prev, [l1.id]: c.id }))}
                          >
                            <span className="inline-flex items-center gap-2">
                              {c.name}
                              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                                {(categories.filter((x) => x.parentId === c.id)).length}
                              </span>
                            </span>
                          </TabsTrigger>
                        ))}
                      </TabsList>

                      {l2.map((l2c) => {
                        const l3 = childrenOf(l2c.id);
                        return (
                          <TabsContent key={l2c.id} value={l2c.id}>
                            <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-600">Sous-catégorie :</span>
                                <span className="font-medium">{l2c.name}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button variant="ghost" onClick={() => handleEdit(l2c)}><Pencil size={16} /></Button>
                                <Button variant="ghost" onClick={() => handleDeleteOne(l2c)}><Trash2 size={16} /></Button>
                                <Button variant="ghost" onClick={() => handleAddWithParent(l2c.id)}>
                                  <Plus size={16} className="mr-1" /> Ajouter niveau 3
              </Button>
              </div>
              </div>
            
                            <div className="mt-4">
                              {l3.length === 0 ? (
                                <div className="text-sm text-gray-500">Aucune catégorie de niveau 3.</div>
                              ) : (
                                <div className="overflow-x-auto">
                                  <table className="min-w-full text-sm">
                                    <thead>
                                      <tr className="text-left text-gray-600">
                                        <th className="py-2 px-2">Nom</th>
                                        <th className="py-2 px-2">Description</th>
                                        <th className="py-2 px-2">Produits</th>
                                        <th className="py-2 px-2">Image</th>
                                        <th className="py-2 px-2 text-right">Actions</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {l3.map((c) => (
                                        <tr key={c.id} className="border-t">
                                          <td className="py-2 px-2">{c.name}</td>
                                          <td className="py-2 px-2">{c.description || "-"}</td>
                                          <td className="py-2 px-2">{Array.isArray(c.products) ? c.products.length : 0}</td>
                                          <td className="py-2 px-2">
                                            {c.image ? (
                                              <Image src={c.image as string} width={44} height={44} alt={c.name} className="h-10 w-auto object-cover" />
                                            ) : (
                                              <span className="text-gray-400">Aucune image</span>
                                            )}
                                          </td>
                                          <td className="py-2 px-2 text-right">
                                            <Button variant="ghost" onClick={() => handleEdit(c)}><Pencil size={16} /></Button>
                                            <Button variant="ghost" onClick={() => handleDeleteOne(c)}><Trash2 size={16} /></Button>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              )}
                            </div>
                          </TabsContent>
                        );
                      })}
                    </Tabs>
                  )}
                </div>
              </TabsContent>
            );
          })}
        </Tabs>
      </div>
    </div>
  );
}
