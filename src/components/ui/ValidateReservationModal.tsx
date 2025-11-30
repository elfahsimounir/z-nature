"use client";
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  reservation: { id: string; fullName: string; service?: { title?: string } } | null;
  onSuccess?: () => void;
};

export default function ValidateReservationModal({ open, onOpenChange, reservation, onSuccess }: Props) {
  const [validated, setValidated] = React.useState<boolean>(true);
  const [loading, setLoading] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (open) setValidated(true);
  }, [open, reservation?.id]);

  const submit = async () => {
    if (!reservation?.id) return;
    try {
      setLoading(true);
      const res = await fetch("/api/reservation", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: reservation.id, validated }),
      });
      if (!res.ok) throw new Error("Failed to update reservation");
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
          <DialogTitle>Validate Reservation</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 text-sm">
          <div>
            <div>Service: <span className="font-medium">{reservation?.service?.title || "-"}</span></div>
            <div>Client: <span className="font-medium">{reservation?.fullName || "-"}</span></div>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox checked={validated} onCheckedChange={(v)=>setValidated(!!v)} id="validated" />
            <label htmlFor="validated">Mark as validated</label>
          </div>
          <div className="pt-2 flex justify-end gap-2">
            <Button variant="secondary" onClick={()=>onOpenChange(false)} disabled={loading}>Cancel</Button>
            <Button onClick={submit} disabled={loading}>{loading?"Saving...":"Save"}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}


