import { router, Head, Link } from '@inertiajs/react';
import { useState } from 'react';

import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';

import { indexPersonalMenu } from '@/actions/App/Http/Controllers/PersonalMenuController';
import { type BreadcrumbItem } from '@/types';

/* =======================
   TYPES
======================= */

type PersonalizationOption = {
    id: number;
    name: string;
    personalization_type_id: number;
};

type PersonalizationType = {
    id: number;
    name: string;
    label: string;
    selection_mode: 'include' | 'exclude';
    selection_type: 'single' | 'multiple';
    personalization_options: PersonalizationOption[];
};

type Menu = {
    id: number;
    name: string;
    personalization_options: PersonalizationOption[];
};

type Props = {
    menu: Menu;
    types: PersonalizationType[];
};

/* =======================
   BREADCRUMB
======================= */

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Personalisation Menu',
        href: indexPersonalMenu().url,
    },
    {
        title: 'Edit',
        href: '#',
    },
];

/* =======================
   COMPONENT
======================= */

export default function Edit({ menu, types }: Props) {
    // ==========================
    // PRE-FILL SELECTED
    // ==========================
    const initialSelected: Record<number, number[]> = {};

    menu.personalization_options.forEach((opt) => {
        initialSelected[opt.personalization_type_id] ??= [];
        initialSelected[opt.personalization_type_id].push(opt.id);
    });

    const [selected, setSelected] = useState<Record<number, number[]>>(
        initialSelected
    );

    const [error, setError] = useState('');

    /* =======================
       HANDLER OPTION
    ======================= */

    const toggleOption = (
        type: PersonalizationType,
        optionId: number,
    ) => {
        setError('');

        setSelected((prev) => {
            const current = prev[type.id] ?? [];

            if (type.selection_type === 'single') {
                return {
                    ...prev,
                    [type.id]: [optionId],
                };
            }

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

        const optionIds = Object.values(selected).flat();

        if (optionIds.length === 0) {
            setError('Choose at least one personalisation');
            return;
        }

        router.put(
            `/admin/personalMenu/${menu.id}`,
            {
                personalization_options: optionIds,
                _method: 'put',
            }
        );
    };

    /* =======================
       RENDER
    ======================= */

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Personalisation Menu" />

            <div className="px-4">
                <h1 className="mb-4 text-2xl font-semibold">
                    Edit Personalisation Menu
                </h1>

                {/* MENU NAME (READ ONLY) */}
                <div className="mb-4">
                    <label className="mb-1 block text-sm font-medium">
                        Menu
                    </label>
                    <input
                        value={menu.name}
                        disabled
                        className="w-full rounded border bg-gray-100 p-2"
                    />
                </div>

                {error && (
                    <p className="mb-4 text-sm text-red-600">
                        {error}
                    </p>
                )}

                <form
                    onSubmit={handleSubmit}
                    className="space-y-6"
                >
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
                                        ? 'Excluded'
                                        : 'Included'}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                                {type.personalization_options.map(
                                    (opt) => (
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
                                                    toggleOption(
                                                        type,
                                                        opt.id,
                                                    )
                                                }
                                            />
                                            {opt.name}
                                        </label>
                                    ),
                                )}
                            </div>
                        </div>
                    ))}

                    <div className="flex gap-4">
                        <Link href={indexPersonalMenu().url}>
                            <Button
                                type="button"
                                variant="outline"
                            >
                                Cancel
                            </Button>
                        </Link>

                        <Button type="submit">
                            Update Personalisation
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
