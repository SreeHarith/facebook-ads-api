import AdManager from "./components/ad-manager/AdManager";

// app/page.tsx


export default function HomePage() {
  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-slate-100 p-4">
      <AdManager />
    </main>
  );
}