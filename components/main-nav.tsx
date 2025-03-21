"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

export function MainNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const pathname = usePathname();

  const routes = [
    // {
    //   href: `/dashboard`,
    //   label: "Panel",
    //   active: pathname === `/dashboard`,
    // },
    {
      href: `/dashboard/categories`,
      label: "Categorías",
      active: pathname === `/dashboard/categories`,
    },
    {
      href: `/dashboard/subcategories`,
      label: "Subcategorías",
      active: pathname === `/dashboard/subcategories`,
    },
    {
      href: `/dashboard/products`,
      label: "Productos",
      active: pathname === `/dashboard/products`,
    },
    {
      href: `/dashboard/providers`,
      label: "Proveedores",
      active: pathname === `/dashboard/providers`,
    },
    {
      href: `/dashboard/colors`,
      label: "Colores",
      active: pathname === `/dashboard/colors`,
    },
    {
      href: `/dashboard/posts`,
      label: "Posts",
      active: pathname === `/dashboard/posts`,
    },
    {
      href: `/dashboard/price-updates`,
      label: "Actualizar Precios",
      active: pathname === `/dashboard/price-updates`,
    },
    {
      href: `/dashboard/orders`,
      label: "Ordenes",
      active: pathname === `/dashboard/orders`,
    },
    {
      href: `/dashboard/settings`,
      label: "Configuración",
      active: pathname === `/dashboard/settings`,
    },
  ];

  return (
    <nav
      className={cn("flex items-center space-x-4 lg:space-x-6", className)}
      {...props}
    >
      <Link
        href={"/dashboard"}
        className={cn(
          "text-lg uppercase font-extrabold transition-colors hover:text-primary",
          pathname === "/dashboard"
            ? "text-black dark:text-white"
            : "text-muted-foreground"
        )}
      >
        Panel
      </Link>
      {routes.map((route) => (
        <Link
          key={route.href}
          href={route.href}
          className={cn(
            "text-sm font-medium transition-colors hover:text-primary",
            route.active
              ? "text-black dark:text-white"
              : "text-muted-foreground"
          )}
        >
          {route.label}
        </Link>
      ))}
    </nav>
  );
}
