import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ImageIcon, X } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Create Menu',
        href: '/admin/menu',
    },
];

type Category = {
    id: number;
    name: string;
};

type PageProps = {
    categories: Category[];
};

export default function CreateMenu() {
    const { categories } = usePage<PageProps>().props;

    const { data, setData, post, processing, errors } = useForm<{
        name: string;
        category_id: string;
        price: string;
        description: string;
        is_active: boolean;
        image: File | null;
    }>({
        name: '',
        category_id: '',
        price: '',
        description: '',
        is_active: true,
        image: null,
    });

    const [fileName, setFileName] = useState('Tidak ada file yang dipilih');
    const [preview, setPreview] = useState<string | null>(null);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/menu');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Menu" />

            <div className="px-4">
                <div className="mt-4 rounded bg-gray-50 px-4 py-5 sm:px-6">
                    <h2 className="mb-5 text-2xl font-semibold">
                        Create Menu Form
                    </h2>

                    <form onSubmit={submit} className="space-y-4">
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            {/* NAME */}
                            <div>
                                <label className="mb-2 block text-base font-medium">
                                    Menu Name
                                </label>
                                <input
                                    value={data.name}
                                    onChange={(e) =>
                                        setData('name', e.target.value)
                                    }
                                    className="w-full rounded-lg border bg-gray-50 p-2.5 text-sm"
                                    placeholder="Type a menu name..."
                                />
                                {errors.name && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.name}
                                    </p>
                                )}
                            </div>

                            {/* CATEGORY */}
                            <div>
                                <label className="mb-2 block text-base font-medium">
                                    Category
                                </label>
                                <select
                                    value={data.category_id}
                                    onChange={(e) =>
                                        setData('category_id', e.target.value)
                                    }
                                    className="w-full rounded-lg border bg-gray-50 py-2.5 pl-3 text-sm"
                                >
                                    <option value="">Select category</option>
                                    {categories.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.category_id && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.category_id}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            {/* PRICE */}
                            <div className="relative">
                                {/* Label Harga */}
                                <label className="mb-2 block text-base font-medium">
                                    Price
                                </label>

                                <div className="relative mt-1">
                                    {/* Simbol Rp Posisi Absolute */}
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <span className="text-gray-500 sm:text-sm">
                                            Rp
                                        </span>
                                    </div>

                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        value={
                                            data.price
                                                ? Number(
                                                      data.price,
                                                  ).toLocaleString('id-ID')
                                                : ''
                                        }
                                        onChange={(e) => {
                                            const raw = e.target.value.replace(
                                                /\D/g,
                                                '',
                                            );
                                            setData('price', raw); // Menggunakan setData bawaan useForm Inertia
                                        }}
                                        // pl-9 sekarang berguna karena memberikan ruang untuk "Rp" di atas
                                        className="w-full rounded-md border border-gray-300 py-2 pr-3 pl-9 shadow-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                                        placeholder="0"
                                    />
                                </div>

                                {errors.price && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.price}
                                    </p>
                                )}
                            </div>

                            {/* STATUS */}
                            <div>
                                <label className="mb-2 block text-base font-medium">
                                    Status
                                </label>
                                <select
                                    value={data.is_active ? '1' : '0'}
                                    onChange={(e) =>
                                        setData(
                                            'is_active',
                                            e.target.value === '1',
                                        )
                                    }
                                    className="w-full rounded-lg border bg-gray-50 py-2.5 pl-3 text-sm"
                                >
                                    <option value="1">Active</option>
                                    <option value="0">Inactive</option>
                                </select>
                                {errors.is_active && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.is_active}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* DESCRIPTION */}
                        <div>
                            <label className="mb-2 block text-base font-medium">
                                Description
                            </label>
                            <textarea
                                rows={4}
                                value={data.description}
                                onChange={(e) =>
                                    setData('description', e.target.value)
                                }
                                className="w-full resize-none rounded-lg border bg-gray-50 p-3 text-sm"
                            />
                            {errors.description && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.description}
                                </p>
                            )}
                        </div>

                        {/* IMAGE */}
                        <div>
                            <label className="mb-2 block text-base font-medium">
                                Upload Image
                            </label>

                            <div className="mb-3 flex items-center rounded-lg border bg-gray-50 p-2">
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    id="image"
                                    onChange={(e) => {
                                        const file =
                                            e.target.files?.[0] || null;
                                        setData('image', file);
                                        if (file) {
                                            setFileName(file.name);
                                            setPreview(
                                                URL.createObjectURL(file),
                                            );
                                        }
                                    }}
                                />

                                <label
                                    htmlFor="image"
                                    className="cursor-pointer rounded bg-gray-900 px-4 py-2 text-sm text-white"
                                >
                                    Pilih File
                                </label>

                                <span className="ml-3 truncate text-sm text-gray-500">
                                    {fileName}
                                </span>
                            </div>

                            {errors.image && (
                                <p className="mt-2 text-sm text-red-600">
                                    {errors.image}
                                </p>
                            )}

                            <div className="space-y-2">
                                <label className="mt-5 text-base font-medium text-gray-700">
                                    Menu Image Preview
                                </label>

                                <div className="group relative mt-3 w-full overflow-hidden rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 transition-all duration-300 hover:border-primary/50 hover:bg-gray-100/50">
                                    {preview ? (
                                        <div className="relative aspect-video w-full sm:aspect-[21/9]">
                                            <img
                                                src={preview}
                                                alt="Preview"
                                                className="h-full w-full object-contain p-2" // 'object-contain' agar gambar tidak terpotong, atau 'object-cover' untuk memenuhi kotak
                                            />

                                            {/* Overlay transparan saat di-hover */}
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setPreview(null);
                                                        setData('image', null);
                                                    }}
                                                    className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-red-600 shadow-xl hover:bg-red-50"
                                                >
                                                    <X className="h-4 w-4" />
                                                    Remove Image
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-12">
                                            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                                                <ImageIcon className="h-8 w-8" />
                                            </div>
                                            <div className="text-center">
                                                <p className="text-lg font-medium text-gray-700">
                                                    Upload menu photo
                                                </p>
                                                <p className="text-sm text-gray-400">
                                                    Click or drag and drop
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* ACTION */}
                        <div className="mt-6 flex gap-4">
                            <Link href="/admin/menu">
                                <Button variant="outline">Cancel</Button>
                            </Link>
                            <Button type="submit" disabled={processing}>
                                Add Menu
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
