<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class MenusRequest extends FormRequest
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
        $rules = [
            'category_id' => ['required', 'exists:categories,id'],
            'name' => ['required', 'max:50'],
            'description' => ['required'],
            'price' => ['required'],
            'is_active' => ['required', 'boolean'],
        ];

        if ($this->isMethod('post')) {
            // CREATE
            $rules['image'] = ['required', 'image', 'mimes:jpeg,png,jpg,gif,svg', 'max:5048'];
        }

        if ($this->isMethod('put') || $this->isMethod('patch')) {
            // UPDATE
            $rules['image'] = ['nullable', 'image', 'mimes:jpeg,png,jpg,gif,svg', 'max:5048'];
        }

        return $rules;
    }

    public function messages()
    {
        return [
            'category_id.required' => 'kategori tidak boleh kosong.',
            'category_id.exists' => 'kategori tidak boleh kosong.',
            'name.required' => 'nama tidak boleh kosong.',
            'name.max' => 'nama tidak boleh lebih dari 50 karakter.',
            'description.required' => 'deskripsi tidak boleh kosong.',
            'price.required' => 'harga tidak boleh kosong.',
            'is_active.required' => 'The status is required.',
            'image.required' => 'gambar tidak boleh kosong.',
            'image.image' => 'gambar harus berupa gambar.',
            'image.mimes' => 'gambar harus berupa jpeg, png, jpg, gif, svg.',
            'image.max' => 'gambar tidak boleh lebih dari 2MB.',
        ];
    }
}
