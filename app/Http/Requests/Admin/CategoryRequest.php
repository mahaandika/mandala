<?php

namespace App\Http\Requests\Admin;

use App\Models\Category;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CategoryRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => 
            [
                'required',
                'max:255', 
                Rule::unique(Category::class)
                    ->ignore($this->category) // Mengabaikan diri sendiri saat update
                    ->whereNull('deleted_at') // Mengabaikan data yang sudah di soft-delete
            ],
            'is_active' => ['required', 'boolean']
        ];
    }

    public function messages()
    {
        return [
            'name.required' => 'Nama perlu diisi',
            'name.max' => 'Nama tidak boleh lebih dari 255 karakter',
            'name.unique' => 'Nama kategori ini sudah ada, gunakan nama lain',
            'is_active.required' => 'Kategori keaktifan tidak boleh kosong',
        ];
    }
}
