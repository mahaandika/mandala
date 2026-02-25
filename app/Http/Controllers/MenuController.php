<?php

namespace App\Http\Controllers;

use App\Http\Requests\Admin\MenusRequest;
use App\Models\Category;
use App\Models\Menu;
use App\Models\PersonalizationOption;
use App\Models\PersonalizationType;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class MenuController extends Controller
{
    public function indexMenu(Request $request)
    {
        $query = Menu::with('category');

        // SEARCH
        if ($request->filled('search')) {
            $query->where('name', 'like', '%'.$request->search.'%');
        }

        // STATUS FILTER
        $status = $request->get('status', 'all');

        if ($status === 'active') {
            $query->where('is_active', true);
        }

        if ($status === 'inactive') {
            $query->where('is_active', false);
        }

        $menus = $query
            ->orderBy('created_at', 'desc')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('admin/menu/index', [
            'menus' => $menus,
            'filters' => [
                'search' => $request->search,
                'status' => $status,
            ],
        ]);
    }

    public function create()
    {
        $categories = Category::where('is_active', true)->get();

        return Inertia::render('admin/menu/create', ['categories' => $categories]);
    }

    public function store(MenusRequest $request)
    {
        $valid = $request->validated();

        if ($request->hasFile('image')) {
            $image = $request->file('image');
            $filename = time().'_menu.'.$image->getClientOriginalExtension();

            $image->storeAs('menus', $filename, 'public');

            $valid['image'] = $filename;
        }

        Menu::create($valid);

        return redirect()->route('admin.menu.index')->with('success', [
            'type' => 'create',
            'message' => 'Menu created successfuly.',
        ]);
    }

    public function edit(Menu $menu)
    {
        $categories = Category::where('is_active', true)->get();

        return Inertia::render('admin/menu/edit', ['menu' => $menu, 'categories' => $categories]);
    }

    public function update(MenusRequest $request, Menu $menu)
    {
        $valid = $request->validated();

        if ($request->hasFile('image')) {
            if ($menu->image) {
                $path = 'menus/'.$menu->image;
                if (Storage::disk('public')->exists($path)) {
                    Storage::disk('public')->delete($path);
                }
            }

            $image = $request->file('image');
            $filename = time().'_menu.'.$image->getClientOriginalExtension();
            $image->storeAs('menus', $filename, 'public');

            $valid['image'] = $filename;
        } else {
            unset($valid['image']);
        }

        $menu->update($valid);

        return redirect()->route('admin.menu.index')->with('success', [
            'type' => 'update',
            'message' => 'Menu updated successfuly.',
        ]);
    }

    public function destroy(Menu $menu)
    {
        $menu->image ? Storage::disk('public')->delete('menus/'.$menu->image) : '';
        $menu->delete();

        return redirect()->route('admin.menu.index')->with('success', [
            'type' => 'delete',
            'message' => 'Menu deleted successfuly.',
        ]);
    }

    public function menuClient(Request $request)
    {
        // --- 1. QUERY UNTUK ALL MENUS (Pagination) ---
        $allQuery = Menu::query()->where('is_active', true);

        if ($request->filled('search')) {
            $allQuery->where('name', 'like', '%'.$request->search.'%');
        }

        if ($request->filled('category')) {
            $allQuery->where('category_id', $request->category);
        }

        // --- 2. QUERY UNTUK YOUR PREFERENCES (Berdasarkan DB User) ---
        $prefMenus = collect();
        $userPersonalizations = collect();
        if (Auth::check()) {
            $user = Auth::user();
            $prefQuery = Menu::query()->where('is_active', true);
            $userPersonalizations = $user->personalizations()->get();
            $selectedOptionIds = $userPersonalizations->pluck('id')->toArray();
            // Ambil preferensi user dari DB, kelompokkan berdasarkan tipe (untuk logika include/exclude)
            $userOptions = PersonalizationOption::with('personalizationType')
                ->whereHas('users', fn ($q) => $q->where('user_id', $user->id))
                ->get()
                ->groupBy('personalization_type_id');

            if ($userOptions->isNotEmpty()) {
                // Inisialisasi array untuk menampung ID include dan exclude
                $allIncludeIds = [];
                $allExcludeIds = [];

                foreach ($userOptions as $options) {
                    $type = $options->first()->personalizationType;
                    $optionIds = $options->pluck('id')->toArray();

                    if ($type->selection_mode === 'include') {
                        // Kumpulkan semua ID yang user inginkan (Flavor Savory, Creamy, dll)
                        $allIncludeIds = array_merge($allIncludeIds, $optionIds);
                    } else {
                        // Kumpulkan semua ID yang user hindari (Alergi, dll)
                        $allExcludeIds = array_merge($allExcludeIds, $optionIds);
                    }
                }

                // --- LOGIKA INCLUDE (Logika OR) ---
                if (! empty($allIncludeIds)) {
                    $prefQuery->whereHas('personalizationOptions', function ($q) use ($allIncludeIds) {
                        // Ini akan mengambil menu yang punya SETIDAKNYA satu dari ID yang dipilih
                        $q->whereIn('personalization_option_id', $allIncludeIds);
                    });
                }

                // --- LOGIKA EXCLUDE (Logika AND untuk keamanan) ---
                if (! empty($allExcludeIds)) {
                    // Menu yang mengandung salah satu dari yang dihindari tidak akan tampil
                    $prefQuery->whereDoesntHave('personalizationOptions', function ($q) use ($allExcludeIds) {
                        $q->whereIn('personalization_option_id', $allExcludeIds);
                    });
                }

                // Filter tambahan (Search & Category)
                if ($request->filled('search')) {
                    $prefQuery->where('name', 'like', '%'.$request->search.'%');
                }
                if ($request->filled('category')) {
                    $prefQuery->where('category_id', $request->category);
                }

                $prefMenus = $prefQuery->orderBy('name')->get();
            }
        }

        return Inertia::render('menus', [
            'menus' => $allQuery->orderBy('name')->paginate(6)->withQueryString(),
            'personalized_menus' => $prefMenus, // Data hasil filter DB
            'user_selected_ids' => $userPersonalizations->pluck('id'),
            'categories' => Category::where('is_active', true)->orderBy('name')->get(),
            'personalizations' => PersonalizationType::with(['personalizationOptions' => fn ($q) => $q->where('is_active', true)])
                ->where('is_active', true)->get(),
            'filters' => $request->only(['search', 'category']),
        ]);
    }

    public function getMenus(Request $request)
    {
        $query = Menu::with('category')->where('is_active', true);

        // Filter Category
        if ($request->has('category_id') && $request->category_id != 'all') {
            $query->where('category_id', $request->category_id);
        }

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where('name', 'like', "%{$search}%");
        }

        $menus = $query->get();

        // Ambil categories untuk filter tab
        $categories = Category::where('is_active', true)->get();

        return response()->json([
            'menus' => $menus,
            'categories' => $categories,
        ]);
    }
}
