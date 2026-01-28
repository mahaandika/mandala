<?php

namespace App\Http\Controllers;

use App\Http\Requests\Admin\PersonalOptionRequest;
use App\Models\PersonalizationOption;
use App\Models\PersonalizationType;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PersonalOptionController extends Controller
{
    public function indexPersonalOption(Request $request)
{
    $personalOptions = PersonalizationOption::with('personalizationType')
        ->when($request->search, function ($query, $search) {
            $query->where('name', 'like', "%{$search}%");
        })
        ->when($request->status && $request->status !== 'all', function ($query) use ($request) {
            $query->where('is_active', $request->status === 'active');
        })
        ->latest()
        ->paginate(5)
        ->withQueryString();

    // Transformasi data manual sebelum dikirim ke Inertia
    $personalOptions->getCollection()->transform(function ($item) {
        return [
            'id' => $item->id,
            'name' => $item->name,
            'is_active' => $item->is_active,
            // Kita paksa formatnya menjadi camelCase agar terbaca di React
            'personalizationType' => $item->personalizationType ? [
                'id' => $item->personalizationType->id,
                'name' => $item->personalizationType->name,
            ] : null,
        ];
    });

    return Inertia::render('admin/personalOption/index', [
        'personalOptions' => $personalOptions,
        'filters' => $request->only(['search', 'status']),
    ]);
}

    public function create()
{
    $types = PersonalizationType::where('is_active', true)->get();

    return Inertia::render('admin/personalOption/create', [
        'types' => $types,
    ]);
}


    public function store(PersonalOptionRequest $request)
{
    $valid = $request->validated();
    PersonalizationOption::create($valid);

    return redirect()
        ->route('admin.personaloption.index', [
            'search' => request('search'),
            'status' => request('status', 'all'),
        ])
        ->with('success', [
            'type' => 'create', // Berikan identitas 'create'
            'message' => 'Personalisation Option created successfully'
        ]);
}

    public function edit(PersonalizationOption $personalizationOption)
{
    // Mengambil semua tipe untuk dropdown
    $types = PersonalizationType::where('is_active', true)->get();

    return Inertia::render('admin/personalOption/edit', [
        'personalOption' => [
            'id' => $personalizationOption->id,
            'name' => $personalizationOption->name,
            'personalization_type_id' => $personalizationOption->personalization_type_id,
            'is_active' => (bool) $personalizationOption->is_active,
        ],
        'types' => $types,
    ]);
}

    public function update(PersonalOptionRequest $request, PersonalizationOption $personalizationOption)
{
    $valid = $request->validated();
    $personalizationOption->update($valid);

    // Redirect ke route index agar modal success di Index.tsx terpicu
    return redirect()->route('admin.personaloption.index')->with('success', [
        'type' => 'update',
        'message' => 'Personalization Option updated successfully'
    ]);
}

    public function destroy(PersonalizationOption $personalizationOption)
{
    $personalizationOption->delete();
    $backUrl = url()->previous();
    return redirect()->to($backUrl)->with('success', [
        'type' => 'delete',
        'message' => 'Personalization Option deleted successfully'
    ]);
}
}
