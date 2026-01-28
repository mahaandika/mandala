import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

export function NavMain({ items }: { items: NavItem[] }) {
    const { url } = usePage();
    const [open, setOpen] = useState<string | null>(null);

    return (
        <SidebarMenu>
            {items.map((item) => {
                const isOpen = open === item.title;

                if (item.children) {
                    return (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                                onClick={() =>
                                    setOpen(isOpen ? null : item.title)
                                }
                                className="justify-between"
                            >
                                <span className="flex items-center gap-2">
                                    {item.icon && (
                                        <item.icon className="h-4 w-4" />
                                    )}
                                    {item.title}
                                </span>
                                <ChevronDown
                                    className={`h-4 w-4 transition-transform ${
                                        isOpen ? 'rotate-180' : ''
                                    }`}
                                />
                            </SidebarMenuButton>

                            {isOpen && (
                                <SidebarMenuSub className="mt-1 space-y-1">
                                    {item.children.map((child) => (
                                        <SidebarMenuSubItem key={child.title}>
                                            <Link
                                                href={child.href!}
                                                className="flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-gray-100 hover:text-slate-900"
                                            >
                                                {child.title}
                                            </Link>
                                        </SidebarMenuSubItem>
                                    ))}
                                </SidebarMenuSub>
                            )}
                        </SidebarMenuItem>
                    );
                }

                return (
                    <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild isActive={url === item.href}>
                            <Link href={item.href!}>
                                {item.icon && <item.icon className="h-4 w-4" />}
                                {item.title}
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                );
            })}
        </SidebarMenu>
    );
}
