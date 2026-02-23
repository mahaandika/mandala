<?php

namespace App\Http\Controllers;

use App\Http\Requests\Admin\PersonalTypeRequest;
use App\Models\PersonalizationType;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class PersonalTypeController extends Controller
{
    public function indexPersonalType(Request $request)
    {
        $personalTypes = PersonalizationType::query()
            ->when($request->search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%");
            })
            ->when($request->status && $request->status !== 'all', function ($query) use ($request) {
                $query->where(
                    'is_active',
                    $request->status === 'active'
                );
            })
            ->latest()
            ->paginate(5)
            ->withQueryString();

        return Inertia::render('admin/personalType/index', [
            'personalTypes' => $personalTypes,
            'filters' => $request->only('search', 'status'),
        ]);
    }

    public function create()
    {
        // INI belom bener reactnya
        return Inertia::render('admin/personalType/create', []);
    }

    public function store(PersonalTypeRequest $request)
    {
        $valid = $request->validated();
        $valid['slug'] = Str::slug($valid['name']);
        PersonalizationType::create($valid);

        return redirect()->route('admin.personaltype.index')->with('success', ['type' => 'create', 'message' => 'Personalisation type created successfully.']);
        // return response()->json(['message' => 'Berhasil']);
    }

    public function edit(PersonalizationType $personalizationType)
    {
        return Inertia::render('admin/personalType/edit', [
            'personalType' => $personalizationType,
        ]);
    }

    public function update(PersonalTypeRequest $request, PersonalizationType $personalizationType)
    {
        $request['slug'] = Str::slug($request['name']);
        $personalizationType->update($request->validated());

        return redirect()
            ->route('admin.personaltype.index') // Ganti dengan nama route index Anda
            ->with('success', [
                'type' => 'update',
                'message' => 'Personalisation type updated successfully.',
            ]);
    }

    public function destroy(PersonalizationType $personalizationType)
    {
        $personalizationType->delete();

        return redirect()->back()->with('success', ['type' => 'delete', 'message' => 'Personalisation type deleted successfully.']
        );
    }
}
