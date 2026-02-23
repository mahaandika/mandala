<?php

namespace App\Http\Controllers;

use App\Http\Requests\Admin\CategoryRequest;
use App\Models\Category;
use App\Models\Menu;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CategoriesController extends Controller
{
    public function indexCategory(Request $request)
    {
        $query = Category::query();

        // Fitur Search
        if ($request->search) {
            $query->where('name', 'like', '%'.$request->search.'%');
        }

        // Fitur Filter Status
        if ($request->status && $request->status !== 'all') {
            $isActive = $request->status === 'active';
            $query->where('is_active', $isActive);
        }

        // Pagination (10 data per halaman)
        $categories = $query->latest()->paginate(5)->withQueryString();

        return Inertia::render('admin/categories/index', [
            'categories' => $categories,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    public function create()
    {
        return Inertia::render('admin/categories/create', []);
    }

    public function store(CategoryRequest $request)
    {
        $valid = $request->validated();

        Category::create($valid);

        return redirect()->route('admin.categories.index')->with('success', [
            'type' => 'create',
            'message' => 'Category has been created successfully.',
        ]);
    }

    public function edit(Category $category)
    {

        // ini belum tak jelas untuk halamnnya atau file reactnya
        return Inertia::render('admin/categories/edit', ['category' => $category]);
    }

    public function update(CategoryRequest $request, Category $category)
    {
        $valid = $request->validated();

        $category->update($valid);

        return redirect()->route('admin.categories.index')->with('success', [
            'type' => 'update',
            'message' => 'Category has been updated successfully.',
        ]);
    }

    public function destroy(Category $category)
    {
        $menu = Menu::where('category_id', $category->id)->get();
        foreach ($menu as $item) {
            $item->delete();
        }
        $category->delete();

        // Menggunakan back() akan mengarahkan user kembali ke URL terakhir (termasuk query string page)
        return redirect()->back()->with('success', [
            'type' => 'delete',
            'message' => 'Category has been deleted successfully.',
        ]);
    }
}
