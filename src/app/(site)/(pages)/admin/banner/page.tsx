"use client";
import { DataTable } from "@/components/Table/DataTable";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { useNotification } from "@/hooks/notificationContext";
import Breadcrumb from "@/components/Common/Breadcrumb";
import BannerModal from "@/components/Banner/BannerModal";
import { Checkbox } from "@/components/ui/checkbox";
import { z } from "zod";

type Product = {
  id: string;
  name: string;
  image: string;
  slug: string;
};

type FormData = {
  id?: string;
  title: string;
  description: string;
  desktopImage?: string;
  mobileImage?: string;
  image?: string | null;
  productId: string;
};

const schema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters long").nonempty("Title is required"),
  description: z.string().optional(),
  images: z.any().optional(),
});

export default function BannerPage() {
  const [banners, setBanners] = useState<FormData[]>([]);
  const [defaultValues, setDefaultValues] = useState<Partial<FormData>>({});
  const [openModal, setOpenModal] = useState(false);
  const [selectingProduct, setSelectingProduct] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const { showNotification, showConfirmation } = useNotification();

  useEffect(() => {
    fetch("/api/banner")
      .then((res) => res.json())
      .then(setBanners)
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (searchQuery.trim() !== "") {
      fetch(`/api/search?query=${searchQuery}`)
        .then((res) => res.json())
        .then((data) => setProducts(data.products))
        .catch(console.error);
    }
  }, [searchQuery]);

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setSelectingProduct(false);
    setOpenModal(true); // Ensure modal opens after selecting a product
  };

  const handleAdd = () => {
    setDefaultValues({});
    setSelectedProduct(null);
    setSelectingProduct(true); // Open product selection
  };

  const handleEdit = (banner: any) => {
    const product = products.find((p) => p.id === banner.productId) || null;
    setDefaultValues({
      ...banner,
      id: banner.id,
      productId: banner.productId,
      image: typeof banner.image === "string" ? banner.image : null,
      desktopImage: banner.desktopImage || banner.image || null,
      mobileImage: banner.mobileImage || banner.image || null,
    });
    setSelectedProduct(product);
    setSelectingProduct(false);
    setOpenModal(true);
  };

  const handleSubmit = async (data: any) => {
    const method = defaultValues.id ? "PATCH" : "POST";

    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("description", data.description || "");
    formData.append("productId", selectedProduct?.id || "");
    formData.append("slug", selectedProduct?.slug || ""); // Include slug in the form data
    // New: append desktop and mobile images when provided
    if (data.desktopImageFile instanceof File) {
      formData.append("desktopImage", data.desktopImageFile);
    }
    if (data.mobileImageFile instanceof File) {
      formData.append("mobileImage", data.mobileImageFile);
    }

    if (defaultValues.id) {
      formData.append("id", defaultValues.id);
    }

    try {
      const res = await fetch("/api/banner", {
        method,
        body: formData,
      });

      if (res.ok) {
        const updatedBanner = res.status !== 204 ? await res.json() : null;
        setBanners((prev) =>
          defaultValues.id
            ? prev.map((b) => (b.id === updatedBanner?.id ? updatedBanner : b))
            : [...prev, updatedBanner]
        );
        setDefaultValues({});
        showNotification(
          defaultValues.id
            ? `Banner "${updatedBanner?.title}" updated successfully`
            : `Banner "${updatedBanner?.title}" added successfully`,
          "success"
        );
      } else {
        const error = await res.json();
        showNotification(`Failed to save banner: ${error.error}`, "error");
      }
    } catch (err) {
      showNotification("An error occurred while saving the banner", "error");
    }
    setOpenModal(false);
  };

  const handleDelete = async (selectedItems: FormData[]) => {
    const ids = selectedItems.map((item) => item.id).join("&id=");
    try {
      const res = await fetch(`/api/banner?id=${ids}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setBanners((prev) => prev.filter((banner) => !selectedItems.some((item) => item.id === banner.id)));
        showNotification("Selected banners deleted successfully", "success");
      } else {
        const error = await res.json();
        showNotification(`Failed to delete banners: ${error.error}`, "error");
      }
    } catch (err) {
      showNotification("An error occurred while deleting banners", "error");
    }
  };

  const breadcrumb = {
    title: "Manage banners",
    pages: ["Admin", "/ banners"],
  };

  return (
    <div className="container mx-auto p-6 bg-gray-100 min-h-screen">
      <Breadcrumb title={breadcrumb.title} pages={breadcrumb.pages} />

        <div className="relative">
          <BannerModal
            open={openModal}
            onClose={() => setOpenModal(false)}
            defaultValues={defaultValues}
            onSubmit={(payload)=>handleSubmit(payload)}
          />
          <DataTable
            filterKey="title"
            columns={[
              {
                id: "select",
                header: ({ table }) => (
                  <Checkbox
                    checked={
                      table.getIsAllPageRowsSelected()
                        ? true
                        : table.getIsSomePageRowsSelected()
                        ? "indeterminate"
                        : false
                    }
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                  />
                ),
                cell: ({ row }) => (
                 <div className="flex">
                   <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                  />
                 </div>
                ),
                enableSorting: false,
                enableHiding: false,
              },
              {
                accessorKey: "title",
                header: ({ column }) => (
                  <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                  >
                    Title
                    <ArrowUpDown />
                  </Button>
                ),
                cell: ({ row }) => <div className="text-start">{row.getValue("title")}</div>,
              },
              {
                accessorKey: "description",
                header: "Description",
                cell: ({ row }) => <div className="text-start">{row.getValue("description")}</div>,
              },
              {
                accessorKey: "desktopImage",
                header: "Desktop",
                cell: ({ row }: { row: any }) =>
                  row.original.desktopImage || row.original.image ? (
                    <Image
                      src={(row.original.desktopImage || row.original.image) as string}
                      width={64}
                      height={64}
                      alt={row.original.name || "image"}
                      className="w-auto h-16 object-cover"
                    />
                  ) : (
                    <div className="text-gray-500">No Image</div>
                  ),
              },
              {
                accessorKey: "mobileImage",
                header: "Mobile",
                cell: ({ row }: { row: any }) =>
                  row.original.mobileImage || row.original.image ? (
                    <Image
                      src={(row.original.mobileImage || row.original.image) as string}
                      width={64}
                      height={64}
                      alt={row.original.name || "image"}
                      className="w-auto h-16 object-cover"
                    />
                  ) : (
                    <div className="text-gray-500">No Image</div>
                  ),
              },
            ]}
            data={banners || []}
            onDelete={handleDelete} // Pass the delete handler to DataTable
            onEdite={handleEdit}
            openModal={handleAdd}
          />

      {selectingProduct && (
        <div className="bg-white p-4 rounded shadow-sm border z-99 absolute w-[500px] top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2">
           <div className="flex justify-between items-center mb-1">
           <h2 className="text-xs">Select a Product</h2>
            <Button
              variant="ghost"
              onClick={() => setSelectingProduct(false)}
              className="text-dark"
            >
              Cancel
            </Button>
           </div>
          <input
            type="text"
            placeholder="Search products..."
            className="border p-2 outline-none text-sm w-full border-gray-2 rounded-md"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="flex flex-col border-t pt-2 sm:grid-cols-2 md:grid-cols-3 gap-4 h-[200px] overflow-y-scroll pb-2 mt-2">
            {products.map((product) => (
              <div
                key={product.id}
                className={`border p-4 rounded cursor-pointer flex gap-2 ${product.slug === selectedProduct?.slug ? "border-primary" : "border-gray-3"}`}
                onClick={() => handleProductSelect(product)}
              >
                <div className="w-15 flex justify-center">
                <Image
                  src={product.image || "/placeholder.png"}
                  alt={product.name}
                  width={100}
                  height={100}
                  className="object-cover mb-2 h-10 w-auto"
                />
                </div>

                <h3 className="text-sm font-medium">{product.name}</h3>
              </div>
            ))}
          </div>
        </div>
      )}
        </div>
    </div>
  );
}
