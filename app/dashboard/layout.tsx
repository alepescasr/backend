import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import Navbar from "@/components/navbar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-full">
      <div className="h-full flex flex-col">
        <Navbar />
        <div className="flex-1 p-8 pt-6">{children}</div>
      </div>
    </div>
  );
}
