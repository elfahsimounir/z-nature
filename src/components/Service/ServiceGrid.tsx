"use client";
import React from "react";
import ImageCarousel from "@/components/ui/ImageCarousel";
import { ChevronLeft, ChevronRight, ChevronDown, Search } from "lucide-react";
import ReservationModal from "@/components/ui/ReservationModal";
import RangeSlider from "react-range-slider-input";
import "react-range-slider-input/dist/style.css";
import ServiceViewModal from "@/components/ui/ServiceViewModal";
 

type ServiceImage = { id: string; url: string };
type Service = { id: string; title: string; details?: string | null; price: number; images: ServiceImage[] };

const ITEMS_PER_PAGE = 9;

export default function ServiceGrid({ services }: { services: Service[] }) {
  const [query, setQuery] = React.useState("");
  const [selectedPrice, setSelectedPrice] = React.useState<{ from: number; to: number } | null>(null);
  const [priceDropdownOpen, setPriceDropdownOpen] = React.useState(false);
  const [draftMin, setDraftMin] = React.useState<string>("");
  const [draftMax, setDraftMax] = React.useState<string>("");
  const [sliderVal, setSliderVal] = React.useState<[number, number]>([0, 1500]);
  const [page, setPage] = React.useState(1);

  const [modalOpen, setModalOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<{ id: string; title: string } | null>(null);
  const [viewOpen, setViewOpen] = React.useState(false);
  const [viewTarget, setViewTarget] = React.useState<Service | null>(null);

  const filtered = React.useMemo(() => {
    return services.filter((s) => {
      const matchesText = !query || s.title.toLowerCase().includes(query.toLowerCase());
      const matchesPrice = selectedPrice ? (s.price >= selectedPrice.from && s.price <= selectedPrice.to) : true;
      return matchesText && matchesPrice;
    });
  }, [services, query, selectedPrice]);

  React.useEffect(() => {
    setPage(1);
  }, [query, selectedPrice]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const first = (page - 1) * ITEMS_PER_PAGE;
  const currentItems = filtered.slice(first, first + ITEMS_PER_PAGE);

  return (
    <div className="mt-8">
      <div className="flex items-center gap-3 mb-4 flex-wrap relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Filtrer par nom..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="border pl-8 p-2 outline-none text-sm w-full max-w-xs border-gray-200 rounded-md"
          />
        </div>
        {/* Price dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setPriceDropdownOpen((v) => !v)}
            className="flex items-center gap-2 border rounded-md px-3 py-2 text-sm bg-white"
          >
            Prix
            <ChevronDown className={`w-4 h-4 transition-transform ${priceDropdownOpen ? "rotate-180" : ""}`} />
          </button>
          {priceDropdownOpen && (
            <div className="absolute z-50 mt-2 bg-white border rounded-md shadow-sm p-3 w-64">
              <div className="mb-3">
                <RangeSlider
                  id="range-slider-gradient"
                  className="margin-lg w-full"
                  step={"any"}
                  min={0}
                  max={3000}
                  defaultValue={sliderVal}
                  onInput={(e: any) => {
                    const from = Math.floor(e[0]);
                    const to = Math.ceil(e[1]);
                    setSliderVal([from, to]);
                    setDraftMin(String(from));
                    setDraftMax(String(to));
                  }}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Min (DH)</label>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={draftMin}
                    onChange={(e) => setDraftMin(e.target.value)}
                    className="border p-2 outline-none text-sm w-full border-gray-200 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Max (DH)</label>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={draftMax}
                    onChange={(e) => setDraftMax(e.target.value)}
                    className="border p-2 outline-none text-sm w-full border-gray-200 rounded-md"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-3">
                <button
                  className="text-sm px-3 py-1 rounded-md border"
                  onClick={() => {
                    setDraftMin("");
                    setDraftMax("");
                    setSelectedPrice(null);
                    setSliderVal([0, 1500]);
                    setPriceDropdownOpen(false);
                  }}
                >
                  Réinitialiser
                </button>
                <button
                  className="text-sm px-3 py-1 rounded-md bg-primary text-white"
                  onClick={() => {
                    const from = draftMin === "" ? 0 : parseFloat(draftMin);
                    const to = draftMax === "" ? 1500 : parseFloat(draftMax);
                    setSelectedPrice({ from, to });
                    setPriceDropdownOpen(false);
                  }}
                >
                  Appliquer
                </button>
              </div>
            </div>
          )}
        </div>
        {/* chips */}
        {selectedPrice && (
          <>
            <div className="text-custom-xs text-dark-4 flex rounded border border-gray-3/80 bg-white">
              <span className="block px-3 py-1.5">{selectedPrice.from}</span>
              <span className="block border-l border-gray-3/80 px-2.5 py-1.5">DH</span>
            </div>
            <div className="text-custom-xs text-dark-4 flex rounded border border-gray-3/80 bg-white">
              <span className="block px-3 py-1.5">{selectedPrice.to}</span>
              <span className="block border-l border-gray-3/80 px-2.5 py-1.5">DH</span>
            </div>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {currentItems.map((svc) => (
          <div key={svc.id} className="bg-white rounded-lg border overflow-hidden">
            <div className="relative w-full pb-[100%]">
              <ImageCarousel images={svc.images || []} alt={svc.title} className="absolute inset-0" />
            </div>
            <div className="p-3">
              <div className="flex items-start justify-between gap-2">
                <h4 className="text-sm font-semibold line-clamp-2">{svc.title}</h4>
                <span className="text-sm font-bold">{svc.price.toFixed(2)} DH</span>
              </div>
              {svc.details && <p className="text-xs text-gray-500 line-clamp-2 mt-1">{svc.details}</p>}
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => { setSelected({ id: svc.id, title: svc.title }); setModalOpen(true); }}
                  className="text-sm rounded-full bg-blue text-white px-4 py-2"
                >
                  Réserver
                </button>
                <button
                  onClick={() => { setViewTarget(svc); setViewOpen(true); }}
                  className="text-sm rounded-full border px-4 py-2"
                >
                  Voir plus
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination like shop page */}
      <div className="flex justify-center mt-15">
        <div className="bg-white shadow-1 rounded-md p-2">
          <ul className="flex items-center gap-1">
            <li>
              <button
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={page === 1}
                className="flex items-center justify-center w-[30px] h-[30px] rounded-[3px] disabled:text-gray-4"
              >
                <ChevronLeft />
              </button>
            </li>
            {Array.from({ length: totalPages }, (_, i) => (
              <li key={i}>
                <button
                  onClick={() => setPage(i + 1)}
                  className={`w-[30px] h-[30px] rounded-[3px] ${
                    page === i + 1 ? "bg-primary text-white" : "hover:bg-primary hover:text-white"
                  }`}
                >
                  {i + 1}
                </button>
              </li>
            ))}
            <li>
              <button
                onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={page === totalPages}
                className="flex items-center justify-center w-[30px] h-[30px] rounded-[3px] disabled:text-gray-4"
              >
                <ChevronRight />
              </button>
            </li>
          </ul>
        </div>
      </div>

      <ReservationModal open={modalOpen} onOpenChange={setModalOpen} service={selected} />
      <ServiceViewModal open={viewOpen} onOpenChange={setViewOpen} service={viewTarget} />
    </div>
  );
}


