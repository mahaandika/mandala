import { logout } from '@/routes';
import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
// Tambahkan baris ini di bagian atas file

export default function NavbarClient() {
    const { auth, url } = usePage<SharedData>().props;
    console.log('Auth Props:', auth);
    const [scrolled, setScrolled] = useState(false);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const page = usePage<SharedData>();

    const isActive = (path: string) => {
        if (path === '/') return page.url === '/';
        return page.url.startsWith(path);
    };

    const menuClass = (path: string) =>
        `tracking-widest transition-colors ${
            isActive(path) ? 'text-[#c8a75e]' : 'text-white'
        }`;

    return (
        <header
            className={`fixed top-0 z-50 w-full transition-all duration-300 ${
                scrolled ? 'bg-black' : 'bg-transparent'
            }`}
        >
            <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                {/* Logo (lebih kecil agar balance) */}
                <Link href="/" className="flex items-center">
                    <img
                        src="/images/mandala_white.png"
                        alt="Logo"
                        className="h-7 w-auto"
                    />
                </Link>

                {/* Desktop Menu */}
                <ul className="hidden items-center gap-8 text-sm font-medium md:flex">
                    <li>
                        <Link href="/" className={menuClass('/')}>
                            HOMEPAGE
                        </Link>
                    </li>

                    <li>
                        <Link href="/about" className={menuClass('/about')}>
                            ABOUT US
                        </Link>
                    </li>

                    <li>
                        <Link href="/menus" className={menuClass('/menu')}>
                            MENU
                        </Link>
                    </li>

                    <li>
                        <Link
                            href="/reservations"
                            className={menuClass('/reservations')}
                        >
                            RESERVATION
                        </Link>
                    </li>
                    <li>
                        <Link
                            href="/carts"
                            className={`group relative flex items-center gap-2 ${menuClass('/carts')}`}
                        >
                            {/* <ShoppingBag className="h-4 w-4 transition-transform group-hover:-translate-y-1" /> */}
                            <span>CART</span>
                            {auth.user && auth.cartCount > 0 && (
                                <span className="absolute -top-2 -right-3 flex h-4 w-4">
                                    {/* Efek denyut halus (ping) agar menarik perhatian */}
                                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#c8a75e] opacity-75"></span>
                                    {/* Badge Angka */}
                                    <span className="relative flex h-4 w-4 items-center justify-center rounded-full bg-[#c8a75e] text-[10px] font-bold text-black">
                                        {auth.cartCount}
                                    </span>
                                </span>
                            )}
                        </Link>
                    </li>

                    <Link href="/historys" className={menuClass('/historys')}>
                        HISTORY
                    </Link>

                    {auth.user ? (
                        <li>
                            <Link
                                href={logout()}
                                className={menuClass('/logout')}
                            >
                                LOGOUT
                            </Link>
                        </li>
                    ) : (
                        <li>
                            <Link
                                href="/register"
                                className={menuClass('/login')}
                            >
                                REGISTER
                            </Link>
                        </li>
                    )}
                </ul>

                {/* Hamburger */}
                <button
                    onClick={() => setOpen(true)}
                    className="flex flex-col gap-1 md:hidden"
                >
                    <span className="h-0.5 w-6 bg-white"></span>
                    <span className="h-0.5 w-6 bg-white"></span>
                    <span className="h-0.5 w-6 bg-white"></span>
                </button>
            </nav>

            {/* MOBILE FULLSCREEN DRAWER */}
            <div
                className={`fixed inset-0 z-50 h-screen w-screen bg-[#081826] transition-transform duration-500 ease-in-out md:hidden ${open ? 'translate-x-0' : 'translate-x-full'}`}
            >
                {/* Header Drawer */}
                <div className="flex items-center justify-between px-6 py-4">
                    <img
                        src="/images/mandala_white.png"
                        alt="Logo"
                        className="h-6 w-auto"
                    />
                    <button
                        onClick={() => setOpen(false)}
                        className="flex h-10 w-10 items-center justify-center border border-white/20 text-white"
                    >
                        ✕
                    </button>
                </div>

                {/* Menu Drawer */}
                <ul className="mt-10 flex flex-col gap-6 px-6 text-sm font-medium tracking-widest">
                    <li>
                        <Link
                            onClick={() => setOpen(false)}
                            href="/"
                            className={menuClass('/')}
                        >
                            HOMEPAGE
                        </Link>
                    </li>
                    <li>
                        <Link
                            onClick={() => setOpen(false)}
                            href="/about"
                            className={menuClass('/about')}
                        >
                            ABOUT US
                        </Link>
                    </li>
                    <li>
                        <Link
                            onClick={() => setOpen(false)}
                            href="/menus"
                            className={menuClass('/menu')}
                        >
                            MENU
                        </Link>
                    </li>
                    <li>
                        <Link
                            onClick={() => setOpen(false)}
                            href="/reservations"
                            className={menuClass('/reservation')}
                        >
                            RESERVATION
                        </Link>
                    </li>
                    <li>
                        <Link
                            onClick={() => setOpen(false)}
                            href="/carts"
                            className={menuClass('/cart')}
                        >
                            CART
                        </Link>
                    </li>

                    {auth.user ? (
                        <li>
                            <Link
                                onClick={() => setOpen(false)}
                                href="/historys"
                                className={menuClass('/history')}
                            >
                                HISTORY
                            </Link>
                        </li>
                    ) : (
                        <li>
                            <Link
                                onClick={() => setOpen(false)}
                                href="/login"
                                className={menuClass('/login')}
                            >
                                LOGIN
                            </Link>
                        </li>
                    )}
                </ul>
            </div>
        </header>
    );
}
