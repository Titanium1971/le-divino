export type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
};

type MenuItemCardProps = {
  item: MenuItem;
};

export function MenuItemCard({ item }: MenuItemCardProps) {
  return (
    <div className="flex items-start justify-between border-b py-4">
      <div>
        <p className="font-medium">{item.name}</p>
        <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
      </div>
      <p className="ml-4 shrink-0 font-medium">{item.price.toFixed(2)} &euro;</p>
    </div>
  );
}
