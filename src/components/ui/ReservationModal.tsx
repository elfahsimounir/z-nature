"use client";
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Phone, User } from "lucide-react";

type ServiceLite = { id: string; title: string };

export default function ReservationModal({ open, onOpenChange, service, onSuccess }: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  service: ServiceLite | null;
  onSuccess?: () => void;
}) {
  const [fullName, setFullName] = React.useState("");
  const [phone, setPhone] = React.useState("+212 ");
  const [loading, setLoading] = React.useState(false);
  const disabled = !fullName.trim() || !phone.trim();

  React.useEffect(() => {
    if (open) {
      setFullName("");
      setPhone("+212 ");
    }
  }, [open, service?.id]);

  const submit = async () => {
    if (!service?.id) return;
    try {
      setLoading(true);
      const res = await fetch("/api/reservation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serviceId: service.id, fullName, phone }),
      });
      if (!res.ok) throw new Error("Failed to reserve");
      onOpenChange(false);
      onSuccess?.();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reserve {service?.title ? `- ${service.title}` : "Service"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <label className="text-sm">Full name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input className="pl-8" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your name" />
            </div>
          </div>
          <div>
            <label className="text-sm">Phone</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input className="pl-8" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g. +212 6XXXXXXXX" />
            </div>
            <p className="text-[11px] text-gray-500 mt-1">Morocco default prefix applied (+212)</p>
          </div>
          <div className="pt-2 flex justify-end gap-2">
            <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</Button>
            <Button onClick={submit} disabled={disabled || loading}>{loading ? "Submitting..." : "Submit"}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}


