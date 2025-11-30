"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import Dropdown from "./Dropdown";
import { useAppSelector } from "@/redux/store";
import { useSelector } from "react-redux";
import { selectTotalPrice } from "@/redux/features/cart-slice";
import { useCartModalContext } from "@/app/context/CartSidebarModalContext";
import Image from "next/image";
import { Headset, House, Menu as MenuIcon, Search, ShoppingBag, ShoppingCart, UserRound } from "lucide-react";
import CascadingCategoryMenu from "./CascadingCategoryMenu";
import { signOut, useSession } from "next-auth/react";
import { Menu } from "@/types/Menu";
import {
  Select,
  SelectContent,
  SelectTrigger,
} from "../ui/select";
import { Button } from "../ui/button";
import { useRouter, usePathname } from "next/navigation";

const CustomSelect = dynamic(() => import("./CustomSelect"), { ssr: false }); // Disable SSR for CustomSelect

// Define types for categories and search results
interface Category {
  label: string;
  value: string;
}

interface SearchResult {
  id: string;
  title: string;
}
const menu = [
  {
    "id": 1,
    "title": "Populaire",
    "newTab": false,
    "path": "/"
  },
  {
    "id": 2,
    "title": "Boutique",
    "newTab": false,
    "path": "/shop"
  },
  // {
  //   "id": 4,
  //   "title": "Service",
  //   "newTab": false,
  //   "path": "/service"
  // },
  {
    "id": 5,
    "title": "Contact",
    "newTab": false,
    "path": "/contact"
  }
];
const Header = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [navigationOpen, setNavigationOpen] = useState(false);
  const [stickyMenu, setStickyMenu] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [mobileCategoriesOpen, setMobileCategoriesOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]); // Explicitly type search results
  const { openCartModal, openSearchModal } = useCartModalContext();
  const wishlistItems = useAppSelector((state) => state.wishlistReducer.items);
  const product = useAppSelector((state) => state.cartReducer.items);
  const totalPrice = useSelector(selectTotalPrice);
  const { data: session, status } = useSession();
  const [menuData, setMenuData] = useState<Menu[]>([]);
  const router = useRouter();
  const pathname = usePathname();

  // Keep track of which category ids are expanded in the mobile drawer
  const [expandedIds, setExpandedIds] = useState<any[]>([]);

  const toggleExpand = (id: any) => {
    setExpandedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  // Recursive renderer for children
  const renderChildren = (parentId: any, level = 1) => {
    const children = categories.filter((c: any) => c.parentId === parentId);
    if (!children || children.length === 0) return null;

    return (
      <ul>
        {children.map((child: any) => {
          const hasChildren = categories.some((c: any) => c.parentId === child.id);
          const isExpanded = expandedIds.includes(child.id);
          return (
            <li key={child.id} className="py-0.5">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => {
                    // navigate to shop with category and close drawer
                    router.push(`/shop?category=${encodeURIComponent(child.name)}`);
                    setMobileCategoriesOpen(false);
                  }}
                  className="text-left w-full"
                >
                  <span className={`block truncate`} style={{ paddingLeft: `${level * 8}px` }}>{child.name}</span>
                </button>

                {hasChildren && (
                  <button
                    aria-expanded={isExpanded}
                    aria-controls={`cat-${child.id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleExpand(child.id);
                    }}
                    className="ml-2 w-8 h-8 flex items-center justify-center text-lg"
                    title={isExpanded ? 'Réduire' : 'Développer'}
                  >
                    {isExpanded ? '−' : '+'}
                  </button>
                )}
              </div>

              {hasChildren && isExpanded && (
                <div id={`cat-${child.id}`} className="mt-1">
                  {renderChildren(child.id, level + 1)}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    );
  };



  const confirmLogout = () => {
    signOut({ callbackUrl: "/signin" }); // Perform logout
  };

  const handleOpenCartModal = () => {
    openCartModal();
  };

  // Sticky menu
  const handleStickyMenu = () => {
    if (window.scrollY >= 80) {
      setStickyMenu(true);
    } else {
      setStickyMenu(false);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleStickyMenu);
    return () => window.removeEventListener("scroll", handleStickyMenu);
  }, []);

  useEffect(() => {
    // Fetch categories
    const fetchCategories = async () => {
      const response = await fetch("/api/category");
      const data: any[] = await response.json();
      setCategories(Array.isArray(data) ? data : []);
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    // Fetch search results
    const fetchSearchResults = async () => {
      if (searchQuery.trim() === "") {
        setSearchResults([]);
        return;
      }
      const response = await fetch(`/api/search?query=${searchQuery}`);
      const data: SearchResult[] = await response.json(); // Ensure the response is typed
      setSearchResults(data);
    };
    fetchSearchResults();
  }, [searchQuery]);

  useEffect(() => {
    setMenuData([
      ...menu,
      ...(session?.user.role === "admin"
        ? [
          {
            id: 6,
            title: "Administration",
            newTab: false,
            path: "/admin",
            submenu: [
              {
                id: 61,
                title: "Produit",
                newTab: false,
                path: "/admin/product",
              },
              {
                id: 62,
                title: "Catégorie",
                newTab: false,
                path: "/admin/category",
              },
              {
                id: 63,
                title: "Bannière",
                newTab: false,
                path: "/admin/banner",
              },
              {
                id: 64,
                title: "Utilisateur",
                newTab: false,
                path: "/admin/user",
              },
              {
                id: 65,
                title: "Commande",
                newTab: false,
                path: "/admin/order",
              },
              {
                id: 67,
                title: "Marque",
                newTab: false,
                path: "/admin/brand",
              },
              {
                id: 68,
                title: "Hashtag",
                newTab: false,
                path: "/admin/hashtag",
              }, {
                id: 69,
                title: "Offre",
                newTab: false,
                path: "/admin/offer",
              }, {
                id: 70,
                title: "Promotion",
                newTab: false,
                path: "/admin/promotion",
              }, {
                id: 71,
                title: "Publication",
                newTab: false,
                path: "/admin/publication",
              }, {
                id: 72,
                title: "Service",
                newTab: false,
                path: "/admin/services",
              },
            ],
          },
        ]
        : []),
      // ...(session?.user?[  {
      //   id: 6,
      //   title: "Pages",
      //   newTab: false,
      //   path: "/",
      //   submenu: [
      //     {
      //       id: 61,
      //       title: "Shop With Sidebar",
      //       newTab: false,
      //       path: "/shop-with-sidebar",
      //     },
      //     {
      //       id: 62,
      //       title: "Shop Without Sidebar",
      //       newTab: false,
      //       path: "/shop-without-sidebar",
      //     },
      //     {
      //       id: 64,
      //       title: "Checkout",
      //       newTab: false,
      //       path: "/checkout",
      //     },
      //     {
      //       id: 65,
      //       title: "Cart",
      //       newTab: false,
      //       path: "/cart",
      //     },
      //     {
      //       id: 66,
      //       title: "Wishlist",
      //       newTab: false,
      //       path: "/wishlist",
      //     },
      //     {
      //       id: 67,
      //       title: "Sign in",
      //       newTab: false,
      //       path: "/signin",
      //     },
      //     {
      //       id: 68,
      //       title: "Sign up",
      //       newTab: false,
      //       path: "/signup",
      //     },
      //     {
      //       id: 69,
      //       title: "My Account",
      //       newTab: false,
      //       path: "/my-account",
      //     },
      //     {
      //       id: 70,
      //       title: "Contact",
      //       newTab: false,
      //       path: "/contact",
      //     },
      //     {
      //       id: 62,
      //       title: "Error",
      //       newTab: false,
      //       path: "/error",
      //     },
      //     {
      //       id: 63,
      //       title: "Mail Success",
      //       newTab: false,
      //       path: "/mail-success",
      //     },
      //   ],
      // },
      // {
      //   id: 7,
      //   title: "blogs",
      //   newTab: false,
      //   path: "/",
      //   submenu: [
      //     {
      //       id: 71,
      //       title: "Blog Grid with sidebar",
      //       newTab: false,
      //       path: "/blogs/blog-grid-with-sidebar",
      //     },
      //     {
      //       id: 72,
      //       title: "Blog Grid",
      //       newTab: false,
      //       path: "/blogs/blog-grid",
      //     },
      //     {
      //       id: 73,
      //       title: "Blog details with sidebar",
      //       newTab: false,
      //       path: "/blogs/blog-details-with-sidebar",
      //     },
      //     {
      //       id: 74,
      //       title: "Blog details",
      //       newTab: false,
      //       path: "/blogs/blog-details",
      //     },
      //   ],
      // },]:[])
    ]);
  }, [session]);

  return (
    <header>
      <div className={`fixed left-0 top-0 w-full z-9999 bg-white border-b  transition-all ease-in-out duration-300 
      ${stickyMenu && "border-gray-2"}`}>
        {!stickyMenu&&
         <div className="bg-green-dark text-center px-6 py-3 text-white text-sm ">
          <p className="animate-pulse">
            LIVRAISON GRATUITE LE JOUR MÊME — Commandes avant midi à Tétouan, Martil, fnideq, mediq, Tanger, larache.
          </p>
        </div>
        }
       
        <div className="max-w-[1170px] mx-auto px-4 sm:px-7.5 xl:px-0">
          {/* <!-- header top start --> */}
          <div
            className={`flex flex-col lg:flex-row gap-5 items-end lg:items-center xl:justify-between ease-out duration-200 ${stickyMenu ? "py-4" : "py-4"
              }`}
          >
            {/* <!-- header top left --> */}
            <div className="flex w-full justify-between">
              <Link
                className="flex gap-2 tracking-wider md:text-xl items-center cursor-pointer text-dark"
                href="/"
              >
                <Image
                  src="/images/logo/logo.png"
                  alt="Logo"
                  width={219}
                  height={36}
                  className="h-8 lg:h-12 w-auto"
                />
              </Link>
  <button
                    onClick={handleOpenCartModal}
                    className="flex items-center cursor-pointer md:hidden"
                  >
                    <span className="inline-block relative">
                      <ShoppingCart
                        size={23}
                        strokeWidth={1.5}
                        className="text-primary"
                      />

                      <span className="flex items-center justify-center font-medium text-2xs absolute -right-2 -top-2.5 bg-primary w-4.5 h-4.5 rounded-full text-white">
                        {product.length}
                      </span>
                    </span>

                    <div>
                      <span className="block text-2xs text-dark-4 uppercase">
                        Panier
                      </span>
                      <p className="font-medium text-xs whitespace-nowrap text-dark">
                        {totalPrice} DH
                      </p>
                    </div>
                  </button>
              <div className="hidden md:flex lg:items-center gap-3">
               
                <Button className="hidden lg:block" variant={'ghost'} onClick={() => {
                  openSearchModal()

                }}>
                  <Search size={23} strokeWidth={1.5} className="text-primary" />
                </Button>
              </div>
            </div>

            {/* <!-- header top right --> */}
            <div className="flex w-full lg:w-auto items-center gap-7.5">
              <div className="hidden xl:flex items-center gap-3.5">
                <Headset size={23} strokeWidth={1.5} className="text-primary" />
                <div>
                  <span className="block text-2xs text-dark-4 uppercase">
                    ASSISTANCE 24/7
                  </span>
                  <p className="font-medium text-custom-sm text-dark whitespace-nowrap">
                    (+2126) 7492-3477
                  </p>
                </div>
              </div>

              {/* <!-- divider --> */}
              <span className="hidden xl:block w-px h-7.5 bg-gray-4"></span>

              <div className="flex w-full lg:w-auto justify-between items-center gap-5">
                <div className="flex w-full justify-between">

                  <div className="xl:flex flex-col hidden">
                    <span className="block text-2xs text-dark-4 uppercase">
                      {!session ? 'Inscription' : 'Compte'}
                    </span>
                    <div className="hidden lg:block">
                      <Select>
                        <SelectTrigger className=" clear-left !p-0">
                        <div>
                          {session ? (
                            <div className="flex  gap-3 items-center justify-center">
                              {session?.user.image ? (
                                <Image
                                  src={session.user.image as string}
                                  alt="User"
                                  width={30}
                                  height={30}
                                  className="rounded-full w-7 h-7"
                                />
                              ) : (
                                <UserRound
                                  size={23}
                                  strokeWidth={1.5}
                                  className="text-primary"
                                />
                              )}
                              <div className="flex flex-col items-start">
                                <p className="font-medium text-custom-sm text-dark">
                                  {session.user.name}
                                </p>
                                <span className="text-xs text-primary">
                                  {session.user.role}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div className="flex gap-2">
                              <UserRound
                                size={23}
                                strokeWidth={1.5}
                                className="text-primary"
                              />
                              <span> Rejoignez-nous</span>
                            </div>
                          )}
                        </div>
                      </SelectTrigger>
                        <SelectContent className="z-[99999]">
                        <div className=" flex flex-col">
                          {!session?.user ?
                            <>
                              <Button
                                className="cursor-pointer"
                                onClick={() => router.push('/signin')}
                                variant={'link'}
                              >
                                <span> Se connecter</span>
                              </Button>
                              <Button
                                className="cursor-pointer"
                                onClick={() => router.push('/signup')}
                                variant={'link'}
                              >
                                <span> S'inscrire</span>
                              </Button>
                            </> :
                            <Button
                              className="cursor-pointer"
                              onClick={confirmLogout}
                              variant={'ghost'}
                            >
                              Se déconnecter
                            </Button>
                          }

                        </div>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <button
                    onClick={handleOpenCartModal}
                    className="hidden md:flex items-center cursor-pointer gap-2.5"
                  >
                    <span className="inline-block relative">
                      <ShoppingCart
                        size={23}
                        strokeWidth={1.5}
                        className="text-primary"
                      />

                      <span className="flex items-center justify-center font-medium text-2xs absolute -right-2 -top-2.5 bg-primary w-4.5 h-4.5 rounded-full text-white">
                        {product.length}
                      </span>
                    </span>
 
                    <div>
                      <span className="block text-2xs text-dark-4 uppercase">
                        Panier
                      </span>
                      <p className="font-medium text-xs whitespace-nowrap text-dark">
                        {totalPrice} DH
                      </p>
                    </div>
                  </button>
                </div>

                {/* <!-- Hamburger Toggle BTN --> */}
                {/* <button
                  id="Toggle"
                  aria-label="Toggler"
                  className="xl:hidden block"
                  onClick={() => setNavigationOpen(!navigationOpen)}
                >
                    <span className="block relative cursor-pointer w-5.5 h-5.5">
                      <span className="du-block absolute right-0 w-full h-full">
                        <span
                          className={`block relative top-0 left-0 bg-dark rounded-sm w-0 h-0.5 my-1 ease-in-out duration-200 delay-[0] ${!navigationOpen && "!w-full delay-300"
                            }`}
                        ></span>
                        <span
                          className={`block relative top-0 left-0 bg-dark rounded-sm w-0 h-0.5 my-1 ease-in-out duration-200 delay-150 ${!navigationOpen && "!w-full delay-400"
                            }`}
                        ></span>
                        <span
                          className={`block relative top-0 left-0 bg-dark rounded-sm w-0 h-0.5 my-1 ease-in-out duration-200 delay-200 ${!navigationOpen && "!w-full delay-500"
                            }`}
                        ></span>
                      </span>

                      <span className="block absolute right-0 w-full h-full rotate-45">
                        <span
                          className={`block bg-dark rounded-sm ease-in-out duration-200 delay-300 absolute left-2.5 top-0 w-0.5 h-full ${!navigationOpen && "!h-0 delay-[0] "
                            }`}
                        ></span>
                        <span
                          className={`block bg-dark rounded-sm ease-in-out duration-200 delay-400 absolute left-0 top-2.5 w-full h-0.5 ${!navigationOpen && "!h-0 dealy-200"
                            }`}
                        ></span>
                      </span>
                    </span>
                  </button> */}

                {/* //   <!-- Hamburger Toggle BTN --> */}
              </div>
            </div>
          </div>
          {/* <!-- header top end --> */}
        </div>

        <div className="border-t border-gray-3">
          <div className="max-w-[1170px] mx-auto px-4 sm:px-7.5 xl:px-0">
            <div className="flex items-center justify-between">
              {/* <!--=== Main Nav Start ===--> */}
              <div
                className={`w-[288px] absolute right-4 top-full xl:static xl:w-auto h-0 xl:h-auto invisible xl:visible xl:flex items-center justify-between ${navigationOpen &&
                  `!visible bg-white shadow-lg border border-gray-3 !h-auto max-h-[400px] overflow-y-scroll rounded-md p-5`
                  }`}
              >
                {/* <!-- Main Nav Start --> */}
                <nav>
                  <ul className="flex xl:items-center flex-col xl:flex-row gap-5 xl:gap-6">
                    {/* Insert Cascading Category menu */}
                    <CascadingCategoryMenu flatCategories={categories} />
                    {menuData.map((menuItem, i) =>
                      menuItem.submenu ? (
                        <Dropdown
                          key={i}
                          menuItem={menuItem}
                          stickyMenu={stickyMenu}
                        />
                      ) : (
                        <li
                          key={i}
                          className="group relative before:w-0 before:h-[3px] before:bg-primary before:absolute before:left-0 before:top-0 before:rounded-b-[3px] before:ease-out before:duration-200 hover:before:w-full "
                        >
                          <Link
                            href={menuItem.path as any}
                            className={`hover:text-primary text-custom-sm font-medium text-dark flex ${stickyMenu ? "xl:py-4" : "xl:py-6"
                              }`}
                          >
                            {menuItem.title}
                          </Link>
                        </li>
                      )
                    )}
                  </ul>
                </nav>
                {/* //   <!-- Main Nav End --> */}
              </div>
              {/* // <!--=== Main Nav End ===--> */}

              {/* // <!--=== Nav Right Start ===--> */}
              <div className="hidden xl:block">
                <ul className="flex items-center gap-5.5">
                  <li className="py-4">
                    <Link
                      href="/wishlist"
                      className="flex items-center gap-1.5 font-medium text-custom-sm text-dark hover:text-primary"
                    >
                      <svg
                        className="fill-current"
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M5.97441 12.6073L6.43872 12.0183L5.97441 12.6073ZM7.99992 3.66709L7.45955 4.18719C7.60094 4.33408 7.79604 4.41709 7.99992 4.41709C8.2038 4.41709 8.3989 4.33408 8.54028 4.18719L7.99992 3.66709ZM10.0254 12.6073L10.4897 13.1962L10.0254 12.6073ZM6.43872 12.0183C5.41345 11.21 4.33627 10.4524 3.47904 9.48717C2.64752 8.55085 2.08325 7.47831 2.08325 6.0914H0.583252C0.583252 7.94644 1.3588 9.35867 2.35747 10.4832C3.33043 11.5788 4.57383 12.4582 5.51009 13.1962L6.43872 12.0183ZM2.08325 6.0914C2.08325 4.75102 2.84027 3.63995 3.85342 3.17683C4.81929 2.73533 6.15155 2.82823 7.45955 4.18719L8.54028 3.14699C6.84839 1.38917 4.84732 1.07324 3.22983 1.8126C1.65962 2.53035 0.583252 4.18982 0.583252 6.0914H2.08325ZM5.51009 13.1962C5.84928 13.4636 6.22932 13.7618 6.61834 13.9891C7.00711 14.2163 7.47619 14.4167 7.99992 14.4167V12.9167C7.85698 12.9167 7.65939 12.8601 7.37512 12.694C7.0911 12.5281 6.79171 12.2965 6.43872 12.0183L5.51009 13.1962ZM10.4897 13.1962C11.426 12.4582 12.6694 11.5788 13.6424 10.4832C14.641 9.35867 15.4166 7.94644 15.4166 6.0914H13.9166C13.9166 7.47831 13.3523 8.55085 12.5208 9.48717C11.6636 10.4524 10.5864 11.21 9.56112 12.0183L10.4897 13.1962ZM15.4166 6.0914C15.4166 4.18982 14.3402 2.53035 12.77 1.8126C11.1525 1.07324 9.15145 1.38917 7.45955 3.14699L8.54028 4.18719C9.84828 2.82823 11.1805 2.73533 12.1464 3.17683C13.1596 3.63995 13.9166 4.75102 13.9166 6.0914H15.4166ZM9.56112 12.0183C9.20813 12.2965 8.90874 12.5281 8.62471 12.694C8.34044 12.8601 8.14285 12.9167 7.99992 12.9167V14.4167C8.52365 14.4167 8.99273 14.2163 9.3815 13.9891C9.77052 13.7618 10.1506 13.4636 10.4897 13.1962L9.56112 12.0183Z"
                          fill=""
                        />
                      </svg>
                      <span>{wishlistItems.length}</span>
                      liste de souhaits
                    </Link>
                  </li>
                </ul>
              </div>
              {/* <!--=== Nav Right End ===--> */}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile category drawer */}
      <div
        className={`fixed top-0 left-0 h-full w-full bg-black/30 z-[9998] ${mobileCategoriesOpen ? 'block' : 'hidden'}`}
        onClick={() => setMobileCategoriesOpen(false)}
        aria-hidden={!mobileCategoriesOpen}
      />

      <div
        onBlur={() => setMobileCategoriesOpen(false)}
        className={`fixed top-0 left-0 h-full max-w-[300px] w-[85%] bg-white z-[9999] shadow-xl transform transition-transform ${mobileCategoriesOpen ? 'translate-x-0' : '-translate-x-full'}`}
        role="dialog"
        aria-modal="true"
        aria-label="Catégories"
      >
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-3">
            <span className="font-medium">Menu</span>
            <button onClick={() => setMobileCategoriesOpen(false)} className="text-sm">Fermer</button>
          </div>

          {/* Mobile auth / account area inside the sidebar */}
          <div className="mb-3">
            {session ? (
              <div className="flex items-center gap-3">
                {session.user?.image ? (
                  <Image src={session.user.image as string} alt="User" width={40} height={40} className="rounded-full w-10 h-10" />
                ) : (
                  <UserRound size={30} strokeWidth={1.5} className="text-primary" />
                )}
                <div className="flex-1">
                  <p className="font-medium text-sm truncate">{session.user?.name}</p>
                  <span className="text-xs text-dark-4">{session.user?.role}</span>
                </div>
                <Button variant={'ghost'} onClick={confirmLogout}>Se déconnecter</Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Button className="flex-1" variant={'outline'} onClick={() => { router.push('/signin'); setMobileCategoriesOpen(false); }}>
                  Se connecter
                </Button>
                <Button className="flex-1" variant={'default'} onClick={() => { router.push('/signup'); setMobileCategoriesOpen(false); }}>
                  S'inscrire
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="p-3 overflow-y-auto h-full">
          <nav>
            <ul className="text-sm">
              {categories.filter((c: any) => !c.parentId).map((root: any) => {
                const hasChildren = categories.some((c: any) => c.parentId === root.id);
                const isExpanded = expandedIds.includes(root.id);
                return (
                  <li key={root.id} className="mb-2">
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => {
                          router.push(`/shop?category=${encodeURIComponent(root.name)}`);
                          setMobileCategoriesOpen(false);
                        }}
                        className="text-left w-full font-medium"
                      >
                        {root.name}
                      </button>

                      {hasChildren && (
                        <button
                          aria-expanded={isExpanded}
                          aria-controls={`cat-${root.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleExpand(root.id);
                          }}
                          className="ml-2 w-8 h-8 flex items-center justify-center text-lg"
                          title={isExpanded ? 'Réduire' : 'Développer'}
                        >
                          {isExpanded ? '−' : '+'}
                        </button>
                      )}
                    </div>

                    {hasChildren && isExpanded && (
                      <div id={`cat-${root.id}`} className="mt-1">
                        {renderChildren(root.id, 1)}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </div>

      {!session?.user &&
        <div className="fixed lg:hidden bottom-0 border-t z-[9999] left-0 bg-white flex flex-col w-full">

          {/* Menu Items */}
          <div className="flex justify-around px-3 py-4 ">
            {menu.map((item) => (
              <Link
                key={item.id}
                href={item.path}
                className={`flex relative items-center gap-2 text-lg px-2 font-medium ${pathname === item.path ? "text-primary" : "text-dark"
                  }`}
              >
                {item.title === "Populaire" ? (
                  <House size={25} strokeWidth={1.5} className="text-gray-7" />
                ) : item.title === "Boutique" ? (
                  <ShoppingBag size={25} strokeWidth={1.5} className="text-gray-7" />
                ) : (
                  <Headset size={25} strokeWidth={1.5} className="text-gray-7" />
                )}
                {pathname === item.path && <span className="absolute -bottom-3 left-0 flex w-full h-[3px] rounded-full bg-primary">   </span>}

              </Link>
            ))}
            <button className="lg:hidden block" onClick={() => {
              openSearchModal()
            }}>
              <Search size={25} strokeWidth={1.5} className="text-gray-7" />
            </button>
            <button className="lg:hidden block" onClick={() => setMobileCategoriesOpen(!mobileCategoriesOpen)}>
              <MenuIcon size={25} strokeWidth={1.5} className="text-gray-7" />
            </button>
          </div>

        </div>
      }

    </header>
  );
};

export default Header;
