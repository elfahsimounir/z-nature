import Dashboard from "@/components/dashboard";
import Home from "@/components/Home";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Administration | Tableau de bord",
  description: "Gestion du site et des contenus",
};

export default function adminPage() {
  return (
    <>
      <main className="min-h-screen text-black bg-gray-100">
        <Dashboard />

        </main>
    </>
  );
}
