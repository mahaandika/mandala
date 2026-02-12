<?php

namespace App\Http\Controllers;

use App\Models\Menu;
use App\Models\PersonalizationOption;
use App\Models\PersonalizationType;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class PersonalMenuController extends Controller
{
    public function indexPersonalMenu(Request $request)
    {
        $menus = Menu::with('personalizationOptions.personalizationType')
            ->whereHas('personalizationOptions')
            ->select('id', 'name')
            ->when($request->search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%");
            })
            ->paginate(5)
            ->withQueryString(); // Menjaga query parameter saat pindah halaman

        return Inertia::render('admin/personalMenu/index', [
            'menus' => $menus,
            'filters' => $request->only(['search'])
        ]);
    }

    public function create(){
        $types = PersonalizationType::with([
            'personalizationOptions' => function ($q) {
                $q->where('is_active', 1);
            }
        ])
        ->where('is_active', 1)
        ->get(['id', 'name', 'label', 'selection_mode', 'selection_type',]);

        $menus = Menu::whereDoesntHave('personalizationOptions')
            ->select('id', 'name')
            ->get();

        return Inertia::render('admin/personalMenu/create', [
            'types' => $types,
            'menus' => $menus,
        ]);
    }


    public function store(Request $request)
    {
        // dd($request->all());
        $validated = $request->validate([
            'menu_id' => [
                'required',
                'exists:menus,id',
                // menu hanya boleh di-assign sekali
                function ($attr, $value, $fail) {
                    $already = DB::table('personalization_menus')
                        ->where('menu_id', $value)
                        ->exists();

                    if ($already) {
                        $fail('Menu already has personalisation.');
                    }
                },
            ],
            'personalization_options' => [
                'required',
                'array',
                'min:1',
            ],
            'personalization_options.*' => [
                'exists:personalization_options,id',
            ],
        ]);

        DB::transaction(function () use ($validated) {

            $menu = Menu::findOrFail($validated['menu_id']);

            $options = PersonalizationOption::with('personalizationType')
                ->whereIn('id', $validated['personalization_options'])
                ->get();

            // ==========================
            // VALIDASI PER TYPE
            // ==========================
            $grouped = $options->groupBy('personalization_type_id');

            foreach ($grouped as $typeId => $opts) {
                $type = $opts->first()->personalizationType;

                // SINGLE hanya boleh 1
                if ($type->selection_type === 'single' && $opts->count() > 1) {
                    throw \Illuminate\Validation\ValidationException::withMessages([
                        'personalization_options' => [
                            "Type '{$type->label}' only allows one option."
                        ],
                    ]);
                }
            }

            // ==========================
            // SYNC KE PIVOT
            // ==========================
            $menu->personalizationOptions()->sync(
                $validated['personalization_options']
            );
        });

        return redirect()
            ->route('admin.personalmenu.index')
            ->with('success', 'Personalisation menu created successfully');
    }

    public function edit(Menu $menu)
    {
        $menu->load([
            'personalizationOptions.personalizationType'
        ]);

        $types = PersonalizationType::with('personalizationOptions')
            ->where('is_active', 1)
            ->get();

        return Inertia::render('admin/personalMenu/edit', [
            'menu' => $menu,
            'types' => $types,
        ]);
    }


    public function update(Request $request, Menu $menu)
    {
        $validated = $request->validate([
            'personalization_options' => [
                'required',
                'array',
                'min:1',
            ],
            'personalization_options.*' => [
                'exists:personalization_options,id',
            ],
        ]);

        DB::transaction(function () use ($menu, $validated) {

            $options = PersonalizationOption::with('personalizationType')
                ->whereIn('id', $validated['personalization_options'])
                ->get();

            // ==========================
            // VALIDASI PER TYPE
            // ==========================
            $grouped = $options->groupBy('personalization_type_id');

            foreach ($grouped as $typeId => $opts) {
                $type = $opts->first()->personalizationType;

                if ($type->selection_type === 'single' && $opts->count() > 1) {
                    throw \Illuminate\Validation\ValidationException::withMessages([
                        'personalization_options' => [
                            "Type '{$type->label}' only allows one option."
                        ],
                    ]);
                }
            }
            $menu->personalizationOptions()->sync(
                $validated['personalization_options']
            );
        });

        return redirect()
            ->route('admin.personalmenu.index')
            ->with('success', 'Personalisation menu updated successfully');
    }





}
