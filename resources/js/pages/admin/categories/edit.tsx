import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { index } from '@/routes/admin/categories';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Edit Category',
        href: index().url,
    },
];

type Category = {
    id: number;
    name: string;
    is_active: boolean;
};

export default function Index({ category }: { category: Category }) {
    const { data, setData, put, processing, errors } = useForm({
        name: category.name,
        is_active: category.is_active,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/admin/categories/${category.id}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Category" />

            <div className="px-4">
                <div className="flex space-x-2 text-sm">
                    <Link href="/admin/categories">
                        <p className="hover:text-blue-700">Category</p>
                    </Link>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-chevron-right"
                    >
                        <path d="m9 18 6-6-6-6" />
                    </svg>
                    <p className="text-slate-700">Edit Category</p>
                </div>

                <div className="mt-4 rounded bg-gray-50 px-4 py-5 sm:px-6">
                    <h2 className="mb-5 text-2xl font-semibold md:text-2xl">
                        Edit Category Form
                    </h2>

                    <form onSubmit={submit}>
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            {/* name */}
                            <div>
                                <label
                                    htmlFor="name"
                                    className="mb-2 block text-base font-medium text-gray-900"
                                >
                                    Category Name
                                </label>
                                <input
                                    id="name"
                                    type="text"
                                    autoComplete="off"
                                    value={data.name}
                                    onChange={(e) =>
                                        setData('name', e.target.value)
                                    }
                                    placeholder="Input category name..."
                                    className="w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                                />
                                {errors.name && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.name}
                                    </p>
                                )}
                            </div>

                            {/* Status */}
                            <div>
                                <label
                                    htmlFor="status"
                                    className="mb-2 block text-base font-medium text-gray-900"
                                >
                                    Status
                                </label>

                                <select
                                    id="status"
                                    value={data.is_active ? '1' : '0'}
                                    onChange={(e) =>
                                        setData(
                                            'is_active',
                                            e.target.value === '1',
                                        )
                                    }
                                    className="w-full rounded-lg border border-gray-300 bg-gray-50 py-2.5 pl-3 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
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

                        <div className="mt-6 flex justify-center gap-4 md:justify-start">
                            <Link href="/admin/categories">
                                <Button className="cursor-pointer border-1 border-solid border-black bg-white text-black hover:bg-slate-50">
                                    Cancel
                                </Button>
                            </Link>

                            <Button
                                type="submit"
                                className="cursor-pointer"
                                disabled={processing}
                            >
                                Update Category
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
