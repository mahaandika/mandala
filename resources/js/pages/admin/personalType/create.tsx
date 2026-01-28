import { indexPersonalType } from '@/actions/App/Http/Controllers/PersonalTypeController';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Create Personalisation Type',
        href: indexPersonalType().url,
    },
];

export default function Index() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        label: '',
        selection_mode: 'include',
        selection_type: 'single',
        is_active: true,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/personalType');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Personalisation Type" />

            <div className="px-4">
                {/* <h1 className="pt-2 pb-3 text-3xl font-semibold">
                    Create Personalisation Type
                </h1> */}

                <div className="flex space-x-2 text-sm">
                    <Link href={'/admin/personalType'}>
                        <p className="hover:text-blue-700">
                            Personalisation Type
                        </p>
                    </Link>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        className="lucide lucide-chevron-right-icon lucide-chevron-right"
                    >
                        <path d="m9 18 6-6-6-6" />
                    </svg>
                    <p className="text-slate-700">
                        Create Personalisation Type
                    </p>
                </div>

                <div className="mt-4 rounded bg-gray-50 px-4 py-5 sm:px-6">
                    <h2 className="mb-5 text-2xl font-semibold md:text-2xl">
                        Create Personalisation Type Form
                    </h2>

                    <form onSubmit={submit} className="space-y-4">
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            {/* name */}
                            <div>
                                <label
                                    htmlFor="name"
                                    className="mb-2 block text-base font-medium text-gray-900"
                                >
                                    Personalisation Type Name
                                </label>
                                <input
                                    id="name"
                                    type="text"
                                    autoComplete="off"
                                    value={data.name}
                                    onChange={(e) =>
                                        setData('name', e.target.value)
                                    }
                                    placeholder="Input your Personalisation Type name..."
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
                                    value={
                                        data.is_active ? 'active' : 'inactive'
                                    }
                                    onChange={(e) =>
                                        setData(
                                            'is_active',
                                            e.target.value === 'active',
                                        )
                                    }
                                    className="w-full rounded-lg border border-gray-300 bg-gray-50 py-2.5 pl-3 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                                    defaultValue="active"
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                                {errors.is_active && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.is_active}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            {/* mode */}
                            <div>
                                <label
                                    htmlFor="mode"
                                    className="mb-2 block text-base font-medium text-gray-900"
                                >
                                    Selection Mode
                                </label>

                                <select
                                    id="mode"
                                    value={data.selection_mode}
                                    onChange={(e) =>
                                        setData(
                                            'selection_mode',
                                            e.target.value,
                                        )
                                    }
                                    className="w-full rounded-lg border border-gray-300 bg-gray-50 py-2.5 pl-3 text-sm"
                                >
                                    <option value="include">Include</option>
                                    <option value="exclude">Exclude</option>
                                </select>

                                {errors.selection_mode && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.selection_mode}
                                    </p>
                                )}
                            </div>

                            {/* types */}
                            <div>
                                <label
                                    htmlFor="type"
                                    className="mb-2 block text-base font-medium text-gray-900"
                                >
                                    Selection Type
                                </label>

                                <select
                                    id="type"
                                    value={data.selection_type}
                                    onChange={(e) =>
                                        setData(
                                            'selection_type',
                                            e.target.value,
                                        )
                                    }
                                    className="w-full rounded-lg border border-gray-300 bg-gray-50 py-2.5 pl-3 text-sm"
                                >
                                    <option value="single">Single</option>
                                    <option value="multiple">Multiple</option>
                                </select>

                                {errors.selection_type && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.selection_type}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            {/* DESCRIPTION */}
                            <div className="md:col-span-2">
                                <label
                                    htmlFor="description"
                                    className="mb-2 block text-base font-medium text-gray-900"
                                >
                                    Description
                                </label>

                                <textarea
                                    id="description"
                                    rows={4}
                                    value={data.label}
                                    onChange={(e) =>
                                        setData('label', e.target.value)
                                    }
                                    placeholder="Type your description..."
                                    className="w-full resize-none rounded-lg border border-gray-300 bg-gray-50 p-3 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                                />
                                {errors.label && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.label}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="mt-6 flex justify-center gap-4 md:justify-start">
                            <Link href={'/admin/personalType'}>
                                <Button className="cursor-pointer border-1 border-solid border-black bg-white text-black hover:bg-slate-50">
                                    Cancel
                                </Button>
                            </Link>
                            <Button
                                type="submit"
                                disabled={processing}
                                className="cursor-pointer"
                            >
                                Add Personalisation Type
                            </Button>
                        </div>
                    </form>
                </div>
            </div>

            {/* <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                    </div>
                    <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                    </div>
                    <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                    </div>
                </div>
                <div className="relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
                    <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                </div>
            </div> */}
        </AppLayout>
    );
}
