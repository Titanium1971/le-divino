type DisplaySlideProps = {
  title: string;
  subtitle?: string;
};

export function DisplaySlide({ title, subtitle }: DisplaySlideProps) {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="text-center">
        <h2 className="text-5xl font-extralight tracking-widest">{title}</h2>
        {subtitle && <p className="mt-4 text-xl font-light text-white/70">{subtitle}</p>}
      </div>
    </div>
  );
}
