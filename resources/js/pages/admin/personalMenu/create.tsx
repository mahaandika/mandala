import { indexPersonalMenu } from '@/actions/App/Http/Controllers/PersonalMenuController';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Create Personalisation Menu',
        href: indexPersonalMenu().url,
    },
];

type PersonalizationOption = {
    id: number;
    name: string;
};

type PersonalizationType = {
    id: number;
    name: string;
    label: string;
    selection_mode: 'include' | 'exclude';
    selection_type: 'single' | 'multiple';
    icon?: string;
    personalization_options: PersonalizationOption[];
};

type Menu = {
    id: number;
    name: string;
};
type Props = {
    menus: Menu[];
    types: PersonalizationType[];
};

const menuData = {
    'Spiciness Level': ['Not Spicy', 'Mild', 'Medium', 'Very Spicy'],
    'Dietary Preferences': [
        'Vegetarian',
        'Vegan',
        'Gluten-Free',
        'Dairy Free',
        'Pescatarian',
    ],
    'Allergence to Avoid': [
        'Gluten',
        'Dairy',
        'Eggs',
        'Fish',
        'shelfish',
        'Nuts',
        'Soy',
    ],
    'Flavor Preferences': [
        'Savory',
        'Spicy',
        'Sweet',
        'Fresh',
        'Smoky',
        'Creamy',
    ],
};

export default function Index({ menus, types }: Props) {
    const [menuId, setMenuId] = useState<number | ''>('');
    const [selected, setSelected] = useState<Record<number, number[]>>({});
    const [error, setError] = useState('');

    const toggleOption = (type: PersonalizationType, optionId: number) => {
        setError('');

        setSelected((prev) => {
            const current = prev[type.id] ?? [];

            // SINGLE → overwrite
            if (type.selection_type === 'single') {
                return {
                    ...prev,
                    [type.id]: [optionId],
                };
            }

            // MULTIPLE → toggle
            return {
                ...prev,
                [type.id]: current.includes(optionId)
                    ? current.filter((id) => id !== optionId)
                    : [...current, optionId],
            };
        });
    };
    /* =======================
       SUBMIT
    ======================= */

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!menuId) {
            setError('Menu must be selected');
            return;
        }

        const optionIds = Object.values(selected).flat();

        if (optionIds.length === 0) {
            setError('Choose at least one personalisation');
            return;
        }

        router.post('/admin/personalMenu', {
            menu_id: menuId,
            personalization_options: optionIds,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Personalisation Menu" />

            <div className="px-4">
                <h1 className="mb-4 text-2xl font-semibold">
                    Create Personalisation Menu
                </h1>

                <form
                    onSubmit={handleSubmit}
                    className="space-y-6 rounded bg-gray-50 p-6"
                >
                    {/* =======================
                       MENU DROPDOWN
                    ======================= */}
                    <div>
                        <label className="mb-2 block font-medium">Menu</label>
                        <select
                            value={menuId}
                            onChange={(e) => setMenuId(Number(e.target.value))}
                            className="w-full rounded border p-2"
                        >
                            <option value="">Select Menu</option>
                            {menus.map((menu) => (
                                <option key={menu.id} value={menu.id}>
                                    {menu.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* =======================
                       ERROR
                    ======================= */}
                    {error && (
                        <p className="text-sm font-medium text-red-600">
                            {error}
                        </p>
                    )}

                    {/* =======================
                       PERSONALISATION TYPES
                    ======================= */}
                    <div className="space-y-6">
                        {types.map((type) => (
                            <div
                                key={type.id}
                                className="rounded border bg-white p-4"
                            >
                                <div className="mb-2">
                                    <h3 className="font-semibold">
                                        {type.name}
                                    </h3>
                                    <p className="text-xs text-gray-500">
                                        {type.selection_type === 'single'
                                            ? 'Choose one'
                                            : 'Choose one or more'}
                                        {' • '}
                                        {type.selection_mode === 'exclude'
                                            ? 'Sembunyikan menu yang mengandung (exclude)'
                                            : 'Tampilkan menu yang mengandung (include)'}
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                                    {type.personalization_options.map((opt) => (
                                        <label
                                            key={opt.id}
                                            className="flex items-center gap-2 text-sm"
                                        >
                                            <input
                                                type={
                                                    type.selection_type ===
                                                    'single'
                                                        ? 'radio'
                                                        : 'checkbox'
                                                }
                                                name={`type-${type.id}`}
                                                checked={
                                                    selected[type.id]?.includes(
                                                        opt.id,
                                                    ) || false
                                                }
                                                onChange={() =>
                                                    toggleOption(type, opt.id)
                                                }
                                            />
                                            {opt.name}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* =======================
                       ACTIONS
                    ======================= */}
                    <div className="flex gap-4">
                        <Link href={indexPersonalMenu().url}>
                            <Button type="button" variant="outline">
                                Cancel
                            </Button>
                        </Link>

                        <Button type="submit">Save Personalisation Menu</Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
