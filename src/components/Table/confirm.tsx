"use client"
import { Button } from "@/components/ui/button"
import React from "react"

const Confirm = ({
  handleCancel,
  handleConfirm,
  title = "Confirmation",
  message,
  stats,
  items,
  confirmLabel = "Confirmer",
  cancelLabel = "Annuler",
}:{
  handleCancel: any,
  handleConfirm: any,
  title?: string,
  message?: string,
  stats?: { label: string; value: string | number }[],
  items?: string[],
  confirmLabel?: string,
  cancelLabel?: string,
})=>{

    return(
        <div className="fixed top-0 bg-black/20 left-0 w-full h-full z-50 flex justify-center items-center">
        <div className="rounded-md border bg-white/80 backdrop-blur px-5 py-4 relative max-w-[520px] w-[90%]">
        <h3 className="text-base font-medium mb-2">{title}</h3>
        {message && <p className=" text-dark text-sm whitespace-pre-wrap mb-3">{message}</p>}
        {stats && stats.length>0 && (
          <div className="grid grid-cols-3 gap-2 text-xs mb-3">
            {stats.map((s, i) => (
              <div key={i} className="bg-gray-100 rounded px-2 py-1 flex items-center justify-between">
                <span className="text-gray-600">{s.label}</span>
                <span className="font-medium">{s.value}</span>
              </div>
            ))}
          </div>
        )}
        {items && items.length>0 && (
          <div className="bg-gray-50 rounded p-2 max-h-36 overflow-auto text-xs mb-3">
            <ul className="list-disc pl-5">
              {items.map((it, i)=> (
                <li key={i}>{it}</li>
              ))}
            </ul>
          </div>
        )}
        <div className="flex justify-end">
        <div className="flex gap-3 mt-5">
        <Button variant="ghost" onClick={handleCancel}>{cancelLabel}</Button>
        <Button variant="default" onClick={handleConfirm}>{confirmLabel}</Button>
        </div>
        </div>
        </div> 
      </div> 
    )
}
export default Confirm