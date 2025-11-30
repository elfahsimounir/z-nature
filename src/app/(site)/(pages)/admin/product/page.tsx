"use client";
import { DataTable } from "@/components/Table/DataTable";
import Image from "next/image";
import { useState, useEffect } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { set, z } from "zod";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { useNotification } from "@/hooks/notificationContext";
import FormModal from "@/components/Table/FormModal";
import { Checkbox } from "@/components/ui/checkbox";
import Loading from "@/components/ui/loading";
import Breadcrumb from "@/components/Common/Breadcrumb";
import SliceHandler from "@/components/Common/SliceHandler";


// Define the type for the form data
type FormData = {
  id?: string; // Add optional id property
  name: string;
  description: Array<{ id: string; name: string; value: string }>; // Ensure description is an array
  price: number;
  stock: number;
  categoryId: string;
  images: File[] | string[];
  hashtags: string[]; // Ensure hashtags is an array of strings
  brandId: string; // Add brandId to the form data type
  properties: Array<{ id: string; name: string; value: string }>; // Add properties as an array
  rating: number; // Add rating to the form data type
  discount?: number; // Add discount as an optional field
  isNew?: boolean; // Add isNew as an optional field
  isPublished?: boolean; // Add isPublished as an optional field
};

// Define the type for the form configuration
type FormFieldConfig = {
  name: keyof FormData | "properties"; // Allow "properties" as a valid name
  label: string;
  type: "text" | "email" | "select" | "number" | "file" | "custom" | "hashtags"| 'customImages'; // Add "custom" as a valid type
  placeholder?: string;
  options?: any;
  validation?: any; // You can define a more specific type for validation if needed
  style?: string; // You can define a more specific type for style if needed
};

const schema = z.object({
  name: z.string().nonempty("Name is required"),
  description: z.string().nonempty("Description is required"),
  price: z.number().positive("Price must be greater than 0"),
  stock: z.number().int().nonnegative("Stock must be a non-negative integer"),
  categoryId: z.string().nonempty("Category ID is required"),
  images: z.array(z.union([z.instanceof(File), z.string()])).optional(),
  hashtags: z.array(z.string()).optional(),
  // properties: z
  //   .array(z.object({ id: z.string(), name: z.string(), value: z.string() }))
  //   .optional(),
  isNew: z.any().optional(), // Ensure boolean type
  isPublished: z.any().optional(), // Ensure boolean type
  rating: z.any().optional(), // Ensure number type
  discount: z.number().optional(),
  brandId: z.string().nonempty("Brand is required"),
});
const breadcrumb={
  title: "Gérer les produits",
  pages: ["admin /", "produit"],
}

const priorities = [
  { id: "1", label: "Processeur" },
  { id: "2", label: "RAM" },
  { id: "3", label: "Stockage" },
  { id: "4", label: "Taille d'écran" },
  { id: "5", label: "Autonomie de la batterie" },
  { id: "6", label: "Qualité de l'appareil photo" },
  { id: "7", label: "Système d'exploitation" },
  { id: "8", label: "Carte graphique" },
  { id: "9", label: "Connectivité (5G/Wi‑Fi)" },
  { id: "10", label: "Marque" },
  { id: "11", label: "Taille" },
  { id: "12", label: "Couleur" },
  { id: "13", label: "Poids" },
  { id: "14", label: "Matériau" },
];
export default function ProductPage() {
  const [products, setProducts] = useState<FormData[]>([]);
  const [categoriesx, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<{ id: string; name: string }[]>([]);
  const [hashtags, setHashtags] = useState<{ id: string; name: string }[]>([]);
  const { showNotification, showConfirmation } = useNotification();
  const [defaultValues, setDefaultValues] = useState<Partial<any>>({});
  const [openModal, setOpenModal] = useState(false);

  const fetchAndFormatProducts = async () => {
    if (categoriesx.length === 0 || brands.length === 0) return;

    try {
      const productsRes = await fetch("/api/product");
      const productsData = await productsRes.json();

      const formattedProducts = productsData.map((product: any) => ({
        ...product,
        category: categoriesx.find(cat => cat.id === product.categoryId)?.name || "Unknown",
        brand: brands.find(brand => brand.id === product.brandId)?.name || "Unknown",
        hashtags: product.hashtags?.map(tag => `#${tag.name}`).join(" ") || "",
        image: product.images?.[0]?.url || "/default-image.jpg"
      }));

      setProducts(formattedProducts);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  useEffect(() => {
    fetchAndFormatProducts();
  }, [categoriesx, brands]); //

  useEffect(() => {
    fetch("/api/category")
      .then((res) => res.json())
      .then((data) => {
        const arr = Array.isArray(data) ? data : [];
        // only leaf categories for selection, with path labels
        const buildPath = (cat: any, all: any[]): string => {
          const parts: string[] = [];
          let current = cat;
          let safety = 0;
          while (current && safety < 5) {
            parts.unshift(current.name);
            if (!current.parentId) break;
            current = all.find((c: any) => c.id === current.parentId);
            safety++;
          }
          return parts.join(" / ");
        };
        const leafs = arr.filter((c: any) => !c.children || c.children.length === 0);
        const formatted = leafs.map((c: any) => ({ id: c.id, name: buildPath(c, arr) }));
        setCategories(formatted);
      })
      .catch(console.error);
  
    fetch("/api/brand") // Fetch brands
      .then((res) => res.json())
      .then(setBrands)
      .catch(console.error);

    fetch("/api/hashtag") // Fetch hashtags
      .then((res) => res.json())
      .then(setHashtags)
      .catch(console.error);
  }, []);

  const fields: FormFieldConfig[] = [
    { name: "name", label: "Nom", type: "text", placeholder: "Saisir le nom du produit", style: "col-span-6" },
    { name: "description", label: "Description", type: "text", placeholder: "Saisir la description", style: "col-span-6" },
    { name: "price", label: "Prix", type: "number", placeholder: "Saisir le prix", style: "col-span-4" },
    { name: "discount", label: "Remise", type: "number", placeholder: "Saisir le pourcentage de remise", style: "col-span-4" },
    { name: "stock", label: "Stock", type: "number", placeholder: "Saisir la quantité en stock", style: "col-span-4" },
    {
      name: "isNew",
      label: "Nouveau",
      placeholder: "Sélectionner",
      type: "select",
      options: [
        { id: "true", name: "Oui" },
        { id: "false", name: "Non" },
      ],
      style: "col-span-3",
    },
    {
      name: "isPublished",
      label: "Publié",
      placeholder: "Sélectionner",
      type: "select",
      options: [
        { id: "true", name: "Oui" },
        { id: "false", name: "Non" },
      ],
      style: "col-span-3",
    },
    {
      name: "rating",
      label: "Évaluation",
      placeholder: "Sélectionner l'évaluation",
      type: "select",
      options: [
        { id: "1", name: "Très faible" },
        { id: "2", name: "Faible" },
        { id: "3", name: "Moyenne" },
        { id: "4", name: "Élevée" },
        { id: "5", name: "Très élevée" },
      ],
      style: "col-span-3",
    },
    { name: "categoryId", label: "Catégorie",  placeholder: "Sélectionner une catégorie", type: "select", options: categoriesx, style: "col-span-3" },
    { name: "brandId", label: "Marque",  placeholder: "Sélectionner une marque", type: "select", options: brands, style: "col-span-3" },
    { name: "images", label: "Images", type: "file", placeholder: "Télécharger des images",    style: "col-span-9", },
    { name: "hashtags", label: "Hashtags", type: "hashtags", placeholder: "Sélectionner des hashtags" }, // Add hashtags field
    { name: "properties", label: "Propriétés", type: "custom", placeholder: "Ajouter des propriétés (ex. taille, couleur)" },
  ];

  const handleSubmit = async (data: any) => {
    const isEdit = !!defaultValues.id;
    const method = isEdit ? "PUT" : "POST";
   console.log('data',data);
    try {
      const validationSchema = z.object({
        id: z.string().optional(),
        name: z.string().nonempty("Name is required"),
        description: z.string().nonempty("Description is required"), // Ensure description is a string
        properties: z.array(z.object({ id: z.string(), name: z.string(), value: z.string() })).optional(),
        price: z.number().positive("Price must be greater than 0"),
        stock: z.number().int().nonnegative("Stock must be a non-negative integer"),
        categoryId: z.string().nonempty("Category ID is required"),
        isNew: z.any().optional(),
        isPublished: z.any().optional(),
        rating: z.number().refine((val) => [1, 2, ,3 ,4 ,5].includes(val), "Invalid rating value"),
        discount: z.number().optional(),
        brandId: z.string().optional(),
        hashtags: z.array(z.string()).optional(),
        images: z
          .any()
          .refine(
            (files) =>
              Array.isArray(files) &&
              files.every((file) => file instanceof File || typeof file === "string"),
            "Images must be an array of files or strings"
          )
          .optional(),
      });
  
      // Parse and validate the data
      const validatedData = validationSchema.parse({
        ...data,
      });
  
      const formData = new FormData();
      Object.entries(validatedData).forEach(([key, value]) => {
        if (value) {
          if (key === "images" && Array.isArray(value)) {
            value.forEach((file) => {
              if (file instanceof File) {
                formData.append(key, file);
              }
            });
          } else if (key === "hashtags" && Array.isArray(value)) {
            formData.append(key, JSON.stringify(value));
          } else if (key === "properties") {
            formData.append(key, JSON.stringify(value));
          } else if (key === "isNew" || key === "isPublished") {
            formData.append(key, value === true ? "true" : value === false ? "false" : value as string);
          } else {
            formData.append(key, value as string);
          }
        }
      });
  
      if (isEdit) {
        formData.append("id", defaultValues.id as string);
        formData.append("deletedImages", JSON.stringify(data.deletedImages || []));
        formData.append("mainImage", data.mainImage || "");
      }
  
      console.log("Final form data to submit:", validatedData,'entred data',data);
  
      const res = await fetch("/api/product", {
        method,
        body: formData,
      });
  
      if (!res.ok) {
        const error = await res.json();
        console.error("API error response:", error);
        showNotification(`Failed to save product: ${error.error}`, "error");
        return;
      }
  
      const updatedProduct = await res.json();
  
      // Refresh data after successful submission
      // await fetchData();
  
      showNotification("Produit enregistré avec succès", "success");
  
      setOpenModal(false);
      setDefaultValues({});
      await fetchAndFormatProducts(); // Fetch and format products after submission
    } catch (error) {
      console.error("handleSubmit error:", error);
      if (error instanceof z.ZodError) {
        showNotification(error.errors.map((err) => err.message).join(", "), "error");
      } else {
        showNotification("An unexpected error occurred", "error");
      }
    }
  };
  
  const handleDelete = async (items: any[]) => {
    showConfirmation(
      "Êtes-vous sûr de vouloir supprimer ce produit ?",
      async () => {
        try {
          const ids = items.map((item) => item.id).join('&id='); // Format IDs correctly
          console.log('Formatted IDs for deletion:', ids); // Log formatted IDs
      
          const res = await fetch(`/api/product?id=${ids}`, {
            method: "DELETE",
          });
          if (res.ok) {
            setProducts((prev) => prev.filter((p) => !items.some((item) => item.id === p.id)));
            showNotification("Produits supprimés avec succès", "success");
          } else {
            const error = await res.json();
            console.error('Error response from server:', error); // Log server error
            showNotification(`Échec de la suppression des produits : ${error.error}`, "error");
          }
        } catch (error) {
          console.error("Error deleting products:", error); // Log unexpected error
          showNotification("Une erreur inattendue s'est produite lors de la suppression des produits", "error");
        }
      },
      () => console.log("Cancelled")
    )
  };
  
  const handleEdit = (product: any) => {
    if (!product) return; // Ensure product exists before proceeding
  
    // Format hashtags as an array of strings
    const formattedHashtags = Array.isArray(product.hashtags)
      ? product.hashtags.map((tag: any) => tag.name) // Extract hashtag names
      : []; // Default to an empty array if hashtags is not an array
  
    // Format images as an array of URLs
    const formattedImages = Array.isArray(product.images)
      ? product.images.map((image: any) => image.url) // Extract image URLs
      : []; // Default to an empty array if images is not an array
  
    // Set the main image, defaulting to the first image if available
    const mainImage = product.image || (formattedImages.length > 0 ? formattedImages[0] : null);
  
    // Prepare default values
    const preparedDefaultValues = {
      ...product,
      hashtags: formattedHashtags, // Set hashtags as an array of strings
      images: formattedImages, // Pass formatted image URLs
      deletedImages: [], // Initialize deletedImages as an empty array
      mainImage, // Set mainImage
    };
  
  
    // Set default values and open the modal
    setDefaultValues(preparedDefaultValues); // Ensure default values are set first
    // setOpenModal(true); // Open the modal after default values are set
  };
  
  const handleAdd = () => {
    setDefaultValues({
      id: "",
      name: "",
      description: "",
      price: 0,
      stock: 0,
      categoryId: "",
      brandId: "",
      rating: "0",
      discount: 0,
      isNew: false, // Default to false
      isPublished: true, // Default to true
      images: [],
      hashtags: [],
      properties: [],
      reviews: [],
    });
    setOpenModal(true);
  };
  useEffect(() => {
    if (Object.keys(defaultValues).length > 0) {
      setOpenModal(true); // Open the modal after defaultValues are set
    }
  }, [defaultValues]);
  const columns: ColumnDef<FormData>[] = [
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
          aria-label="Tout sélectionner"
        />
      ),
      cell: ({ row }) => (
       <div className="flex justify-start">
         <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Sélectionner la ligne"
        />
       </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
       <div className="flex justify-start text-start">
         <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Nom
          <ArrowUpDown  size={15}/>
        </Button>
       </div>
      ),
      cell: ({ row }) => <div className="lowercase text-start"><SliceHandler maxChar={40} string={row.getValue("name")}/></div>,
    },
    {
      accessorKey: "description",
      header: ({ column }) => (
      <div className="flex justify-start text-start">
          <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Description
          <ArrowUpDown  size={15}/>
        </Button>
      </div>
      ),
      cell: ({ row }) => <div className="lowercase text-start"><SliceHandler maxChar={40} string={row.getValue("description")}/></div>,
    },
    {
      accessorKey: "price",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Prix
          <ArrowUpDown  size={15}/>
        </Button>
      ),
      cell: ({ row }) => <div className="lowercase">{row.getValue("price")}</div>,
    },
    {
      accessorKey: "discount",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Remise
          <ArrowUpDown  size={15}/>
        </Button>
      ),
      cell: ({ row }) => <div>{row.getValue("discount")}</div>,
    },
    {
      accessorKey: "stock",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Stock
          <ArrowUpDown  size={15}/>
        </Button>
      ),
      cell: ({ row }) => <div className="lowercase">{row.getValue("stock")}</div>,
    },
    {
      accessorKey: "category",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Catégorie
          <ArrowUpDown  size={15}/>
        </Button>
      ),
      cell: ({ row }) => <div className="lowercase">{row.getValue("category")}</div>,
    },
    {
      accessorKey: "rating",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Évaluation
          <ArrowUpDown  size={15}/>
        </Button>
      ),
      cell: ({ row }) => <div>{(row.getValue("rating") as number).toFixed(1)}</div>,
    },
    {
      accessorKey: "hashtags",
      header: "Hashtags",
      cell: ({ row }) => <div>{row.getValue("hashtags")}</div>,
    },
    {
      accessorKey: "isNew",
      header: "Nouveau",
      cell: ({ row }) => (
        <div className={`px-2 py-1 rounded-md ${row.getValue("isNew") ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
          {row.getValue("isNew") ?
          <span className="border px-2 tex-xs border-green rounded-full bg-green/5 text-green"> Oui</span>
           :
           <span className="border px-2  text-xs border-red rounded-full bg-red/5 text-red"> Non</span>
           }
        </div>
      ),
    },
    {
      accessorKey: "isPublished",
      header: "Publié",
      cell: ({ row }) => (
        <div className={`px-2 py-1 rounded-md ${row.getValue("isPublished") ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
          {row.getValue("isPublished") ?
          <span className="border px-2 text-xs border-green rounded-full bg-green/5 text-green"> Oui</span>
           :
           <span className="border px-2  text-xs border-red rounded-full bg-red/5 text-red"> Non</span>
           }
        </div>
      ),
    },
    {
      accessorKey: "image",
      header: "Image",
      cell: ({ row }: { row: any }) =>
        row.original.image ? (
          <div className="flex bg-gray-2 rounded-md justify-center items-center">
             <Image
            src={row.original.image as string}
            width={60}
            height={60}
            alt={row.original.name}
            className="max-h-10 object-cover rounded-md w-full max-w-full"
          />
          </div>
         
        ) : (
          <Loading />
        ),
    },
  ];
  return (
    <div className="container mx-auto p-6 bg-gray-100 min-h-screen">
      <Breadcrumb
        title={breadcrumb.title}
        pages={breadcrumb.pages}
      />
      {/* <button onClick={fetchData}>
        formati lqlawi
      </button> */}
      <FormModal
        schema={schema}
        fields={fields.filter((field): field is Omit<FormFieldConfig, "type"> & { type: "text" | "email" | "select" | "number" | "file" } =>field.type !== "custom")}
        defaultValues={defaultValues}
        showModal={() => setOpenModal(false)}
        onSubmit={handleSubmit}
        display={openModal}
        width="max-w-[800px]"
        priorities={priorities} // Pass priorities as a prop
        hashtags={hashtags} // Pass hashtags to the form modal
      />
      <DataTable
        filterKey="name"
        columns={columns}
        data={products || []} // Ensure `products` is always an array
        onDelete={handleDelete}
        onEdite={handleEdit}
        openModal={handleAdd}
      />
    </div>
  );
}
