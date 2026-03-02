export default function DisplayLayout({ children }: { children: React.ReactNode }) {
  return <div className="h-screen w-screen overflow-hidden bg-black text-white">{children}</div>;
}
