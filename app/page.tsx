import AdManager from "@/app/components/ad-manager/AdManager";

export default function HomePage() {
  return (
    <main className="flex flex-col min-h-screen w-full items-center justify-center bg-slate-100 p-4 sm:p-6 md:p-8">
      <AdManager />
    </main>
  );
}