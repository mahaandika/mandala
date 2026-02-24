import { indexCategory } from '@/actions/App/Http/Controllers/CategoriesController';
import { indexMenu } from '@/actions/App/Http/Controllers/MenuController';
import { indexPersonalMenu } from '@/actions/App/Http/Controllers/PersonalMenuController';
import { indexPersonalOption } from '@/actions/App/Http/Controllers/PersonalOptionController';
import { indexPersonalType } from '@/actions/App/Http/Controllers/PersonalTypeController';
import { indexReservationHistory } from '@/actions/App/Http/Controllers/ReservationHistoryController';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes/admin';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import {
    Filter,
    History,
    LayoutGrid,
    List,
    MonitorCog,
    SlidersHorizontal,
    Utensils,
} from 'lucide-react';
import AppLogo from './app-logo';

/* =====================
   ROLE CONSTANT
===================== */
const ROLE_ADMIN = 'admin';
const ROLE_RECEPTIONIST = 'receptionist';
const ROLE_CASHIER = 'cashier';

/* =====================
   NAV CONFIG
===================== */

// Dashboard (admin + receptionist)
const dashboardNav: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: MonitorCog,
    },
];

// Admin only
const adminNav: NavItem[] = [
    {
        title: 'Employees',
        href: '/admin/employee', // Gunakan direct string path
        icon: MonitorCog,
    },
    {
        title: 'Reservation History',
        href: indexReservationHistory(),
        icon: History,
    },
    {
        title: 'Category',
        href: indexCategory(),
        icon: LayoutGrid,
    },
    {
        title: 'Menu',
        href: indexMenu(),
        icon: Utensils,
    },
    {
        title: 'Personalisation',
        icon: SlidersHorizontal,
        children: [
            {
                title: 'Personalisation Types',
                href: indexPersonalType(),
                icon: List,
            },
            {
                title: 'Personalisation Options',
                href: indexPersonalOption(),
                icon: Filter,
            },
            {
                title: 'Personalisation Menus',
                href: indexPersonalMenu(),
                icon: Filter,
            },
        ],
    },
];

/* =====================
   HELPER
===================== */
const getNavItemsByRole = (role?: string): NavItem[] => {
    if (role === ROLE_ADMIN) {
        return [...dashboardNav, ...adminNav];
    }

    if (role === ROLE_RECEPTIONIST || role === ROLE_CASHIER) {
        return dashboardNav;
    }

    return [];
};

/* =====================
   COMPONENT
===================== */
export function AppSidebar() {
    const { auth } = usePage().props as any;
    const role = auth?.user?.role;

    const navItems = getNavItemsByRole(role);

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={navItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
