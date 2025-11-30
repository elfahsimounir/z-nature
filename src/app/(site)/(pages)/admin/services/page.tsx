"use client";
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import ServiceModal from "@/components/Service/ServiceModal";
import Breadcrumb from "@/components/Common/Breadcrumb";
import ValidateReservationModal from "@/components/ui/ValidateReservationModal";

export default function AdminServicesPage() {
  const [services, setServices] = React.useState<any[]>([]);
  const [reservations, setReservations] = React.useState<any[]>([]);
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<any | null>(null);
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(1);
  const pageSize = 9;
  const [reservationSelection, setReservationSelection] = React.useState<Record<string, boolean>>({});
  const [validateOpen, setValidateOpen] = React.useState(false);
  const [validateTarget, setValidateTarget] = React.useState<any | null>(null);
  const [startDate, setStartDate] = React.useState("");
  const [endDate, setEndDate] = React.useState("");
  const filteredReservations = React.useMemo(() => {
    return reservations.filter((r:any) => {
      const matchesText = !search || r.service?.title?.toLowerCase().includes(search.toLowerCase()) || r.fullName?.toLowerCase().includes(search.toLowerCase()) || r.phone?.toLowerCase().includes(search.toLowerCase());
      if (!matchesText) return false;
      const created = new Date(r.createdAt);
      const afterStart = !startDate || created >= new Date(`${startDate}T00:00:00`);
      const beforeEnd = !endDate || created <= new Date(`${endDate}T23:59:59.999`);
      return afterStart && beforeEnd;
    });
  }, [reservations, search, startDate, endDate]);
  const selectedReservations = React.useMemo(() => filteredReservations.filter((r:any)=> reservationSelection[r.id]), [filteredReservations, reservationSelection]);
  const isAllReservationsSelected = selectedReservations.length === filteredReservations.length && filteredReservations.length > 0;
  const isSomeReservationsSelected = selectedReservations.length > 0 && selectedReservations.length < filteredReservations.length;
  const toggleSelectAllReservations = (value:boolean) => {
    if (value) {
      const map: Record<string, boolean> = {};
      filteredReservations.forEach((r:any)=>{ map[r.id] = true })
      setReservationSelection(map);
    } else {
      setReservationSelection({});
    }
  };
  const toggleSelectReservation = (id:string, value:boolean) => {
    setReservationSelection((prev)=> ({...prev, [id]: value}));
  };

  const load = async () => {
    const [s, r] = await Promise.all([
      fetch("/api/service").then((res) => res.json()),
      fetch("/api/reservation").then((res) => res.json()),
    ]);
    setServices(s);
    setReservations(r);
  };

  React.useEffect(() => {
    load();
  }, []);
  const breadcrumb={
    title: "Gérer les services & réservations",
    pages: [ "Admin", "/ Services"],
  }
  return (
    <div className="container mx-auto p-6 bg-gray-100 min-h-screen">
       <Breadcrumb
  title={breadcrumb.title}
  pages={breadcrumb.pages}
/>
        <Tabs defaultValue="services">
        <TabsList className="gap-2 mb-4">
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="reservations">Réservations</TabsTrigger>
        </TabsList>
        <TabsContent value="services">
          <div className="flex items-center py-4 gap-2">
            <Input
              placeholder="Filtrer ..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="max-w-sm"
            />
            <div className="flex items-center">
              <Button variant="ghost" onClick={() => { setEditing(null); setOpen(true); }}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </Button>
            </div>
          </div>
          {(() => {
            const filtered = services.filter((s) => !search || s.title?.toLowerCase().includes(search.toLowerCase()) || s.details?.toLowerCase().includes(search.toLowerCase()))
            const total = filtered.length;
            const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize);
            return (
          <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {pageItems
              .map((svc) => (
                <div key={svc.id} className="border rounded p-3 bg-white">
                  <div className="relative w-full pb-[56%] mb-3 overflow-hidden rounded">
                    {svc.images?.[0]?.url && (
                      <img src={svc.images[0].url} alt={svc.title} className="absolute inset-0 w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="font-semibold text-sm">{svc.title}</div>
                  <div className="text-xs text-gray-500 line-clamp-2">{svc.details}</div>
                  <div className="text-sm font-bold mt-1">{svc.price?.toFixed(2)} DH</div>
                  <div className="mt-2 flex gap-1">
                    <Button size="icon" variant="ghost" onClick={() => { setEditing(svc); setOpen(true); }} aria-label="Edit">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                      </svg>
                    </Button>
                    <Button size="icon" variant="ghost" onClick={async () => { await fetch(`/api/service?id=${svc.id}`, { method: 'DELETE' }); load(); }} aria-label="Delete">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                      </svg>
                    </Button>
                  </div>
                </div>
              ))}
          </div>
          {/* Pagination aligned like DataTable */}
          <div className="flex items-center justify-end space-x-2 py-1 mt-6 border px-2 rounded-lg">
            <div className="flex-1 text-sm text-muted-foreground">{pageItems.length} of {total} card(s) visible.</div>
            <div className="space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft size={16} />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const maxPage = Math.max(1, Math.ceil(total / pageSize));
                  setPage((p) => Math.min(maxPage, p + 1));
                }}
                disabled={page * pageSize >= total}
              >
                <ChevronRight size={16} />
              </Button>
            </div>
          </div>
          </>
            )
          })()}
          <ServiceModal open={open} onClose={() => setOpen(false)} defaultValues={editing || undefined} onSuccess={load} />
        </TabsContent>
        <TabsContent value="reservations">
          {/* DataTable-like with selection and validate/delete actions */}
          <div className="w-full  px-2 overflow-hidden">
          <div className="flex items-center py-4 gap-2">
            <Input
              placeholder="Filtrer ..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="max-w-sm"
              />
              <Input type="date" value={startDate} onChange={(e)=>setStartDate(e.target.value)} className="w-auto" />
            <span className="text-xs text-gray-500">au</span>
              <Input type="date" value={endDate} onChange={(e)=>setEndDate(e.target.value)} className="w-auto" />
              <div className="flex items-center">
                <Button variant="ghost" onClick={() => {
                  if (selectedReservations.length === 1) {
                    setValidateTarget(selectedReservations[0]);
                    setValidateOpen(true);
                  }
                }} aria-label="Valider">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                </Button>
                <Button variant="ghost" onClick={async () => {
                  const ids = selectedReservations.map((r:any)=>r.id).join("&id=");
                  if (!ids) return;
                  await fetch(`/api/reservation?id=${ids}`, { method: 'DELETE' });
                  load();
                }} aria-label="Supprimer">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                  </svg>
                </Button>
              </div>
            </div>
            <div className="border-t">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-white z-10">
                  <tr className="text-left border-b">
                    <th className="py-2 pr-2">
                      <Checkbox checked={isAllReservationsSelected ? true : isSomeReservationsSelected ? "indeterminate" : false}
                        onCheckedChange={(value)=>toggleSelectAllReservations(!!value)} aria-label="Select all" />
                    </th>
                    <th className="py-2 pr-2">Service</th>
                    <th className="py-2 pr-2">Client</th>
                    <th className="py-2 pr-2">Téléphone</th>
                    <th className="py-2 pr-2">Validé</th>
                    <th className="py-2 pr-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReservations.map((r:any) => (
                    <tr key={r.id} className="border-b last:border-0">
                      <td className="py-2 pr-2">
                        <Checkbox checked={!!reservationSelection[r.id]} onCheckedChange={(value)=>toggleSelectReservation(r.id, !!value)} aria-label="Select row" />
                      </td>
                      <td className="py-2 pr-2">{r.service?.title}</td>
                      <td className="py-2 pr-2">{r.fullName}</td>
                      <td className="py-2 pr-2">{r.phone}</td>
                      <td className="py-2 pr-2">
                        <span className={`px-2 py-0.5 rounded text-xs ${r.validated ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{r.validated ? 'Oui' : 'Non'}</span>
                      </td>
                      <td className="py-2 pr-2">{new Date(r.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-end space-x-2 py-1 mt-4 border px-2 rounded-lg">
              <div className="flex-1 text-sm text-muted-foreground">{selectedReservations.length} of {filteredReservations.length} row(s) selected.</div>
              <div className="space-x-2">
                <Button variant="outline" size="sm" disabled>
                  <ChevronLeft size={16} />
                </Button>
                <Button variant="outline" size="sm" disabled>
                  <ChevronRight size={16} />
                </Button>
              </div>
            </div>
          </div>
          <ValidateReservationModal open={validateOpen} onOpenChange={setValidateOpen} reservation={validateTarget} onSuccess={load} />
        </TabsContent>
      </Tabs>
    </div>
  );
}


