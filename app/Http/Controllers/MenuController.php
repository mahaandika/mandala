<?php

namespace App\Http\Controllers;

use App\Http\Requests\Admin\MenusRequest;
use App\Models\Category;
use App\Models\Menu;
use App\Models\PersonalizationOption;
use App\Models\PersonalizationType;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class MenuController extends Controller
{
    public function indexMenu(Request $request)
    {
        $query = Menu::with('category');

        // SEARCH
        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
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
            ->paginate(5)
            ->withQueryString();

        return Inertia::render('admin/menu/index', [
            'menus' => $menus,
            'filters' => [
                'search' => $request->search,
                'status' => $status,
            ],
        ]);
    }


    public function create(){
        $categories = Category::where('is_active', true)->get();
        return Inertia::render('admin/menu/create', ['categories' => $categories]);
    }

    public function store(MenusRequest $request){
        $valid = $request->validated();

        if ($request->hasFile('image')) {
            $image = $request->file('image');
            $filename = time() . '_menu.' . $image->getClientOriginalExtension();

            $image->storeAs('menus', $filename, 'public');

            $valid['image'] = $filename;
        }

        Menu::create($valid);

        return redirect()->route('admin.menu.index')->with('success', [
            'type' => 'create',
            'message' => 'Menu created successfuly.'
        ]);
    }

    public function edit(Menu $menu){
        $categories = Category::where('is_active', true)->get();
        return Inertia::render('admin/menu/edit', ['menu' => $menu, 'categories' => $categories]);
    }

    public function update(MenusRequest $request, Menu $menu)
    {
        $valid = $request->validated();

        if ($request->hasFile('image')) {
            if ($menu->image) {
                $path = 'menus/' . $menu->image;
                if (Storage::disk('public')->exists($path)) {
                    Storage::disk('public')->delete($path);
                }
            }

            $image = $request->file('image');
            $filename = time() . '_menu.' . $image->getClientOriginalExtension();
            $image->storeAs('menus', $filename, 'public');

            $valid['image'] = $filename;
        } else {
            unset($valid['image']);
        }

        $menu->update($valid);

        return redirect()->route('admin.menu.index')->with('success', [
            'type' => 'update',
            'message' => 'Menu updated successfuly.'
        ]);
    }


    public function destroy(Menu $menu){
        $menu->image ? Storage::disk('public')->delete('menus/'.$menu->image) : '';
        $menu->delete();
        return redirect()->route('admin.menu.index')->with('success', [
            'type' => 'delete',
            'message' => 'Menu deleted successfuly.'
        ]);
    }

    public function menuClient(Request $request)
    {
            $query = Menu::query()
                ->where('is_active', true);

            // SEARCH
            if ($request->filled('search')) {
                $query->where('name', 'like', '%' . $request->search . '%');
            }

            // CATEGORY
            if ($request->filled('category')) {
                $query->where('category_id', $request->category);
            }

            // PERSONALIZATION
            if ($request->filled('personalizations')) {
                foreach ($request->personalizations as $slug => $optionIds) {
                    $type = PersonalizationType::where('slug', $slug)->first();
                    if (!$type || empty($optionIds)) continue;

                    if ($type->selection_mode === 'include') {
                        foreach ($optionIds as $optionId) {
                            $query->whereHas('personalizationOptions', fn ($q) =>
                                $q->where('personalization_option_id', $optionId)
                            );
                        }
                    }

                    if ($type->selection_mode === 'exclude') {
                        $query->whereDoesntHave('personalizationOptions', fn ($q) =>
                            $q->whereIn('personalization_option_id', $optionIds)
                        );
                    }
                }

            }   

            $menus = $query
                ->orderBy('name')
                ->paginate(6)
                ->withQueryString();

            return Inertia::render('menus', [
                'menus' => $menus,
                'categories' => Category::where('is_active', true)->orderBy('name')->get(),
                'personalizations' => PersonalizationType::with('personalizationOptions')
                    ->where('is_active', true)
                    ->get(),
                'filters' => [
                    'search' => $request->search,
                    'category' => $request->category,
                    'personalizations' => $request->personalizations,
                ],
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
            'categories' => $categories
        ]);
    }

}
