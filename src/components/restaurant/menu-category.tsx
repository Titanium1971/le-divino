import { MenuItemCard, type MenuItem } from "./menu-item";

type MenuCategoryProps = {
  title: string;
  items: MenuItem[];
};

export function MenuCategory({ title, items }: MenuCategoryProps) {
  return (
    <section className="mt-12">
      <h2 className="text-2xl font-light tracking-wide">{title}</h2>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {items.map((item) => (
          <MenuItemCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}
