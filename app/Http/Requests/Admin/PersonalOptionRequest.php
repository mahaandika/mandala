<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class PersonalOptionRequest extends FormRequest
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
            'personalization_type_id' => ['required', 'exists:personalization_types,id'],
            'name' => ['required', 'max:50'],
            'is_active' => ['required', 'boolean'],
        ];
    }
    public function messages(): array
    {
        return [
            'personalization_type_id.required' => 'Tipe personalisasi wajib diisi.',
            'personalization_type_id.exists' => 'Tipe personalisasi tidak valid.',
            'name.required' => 'Nama opsi wajib diisi.',
            'name.max' => 'Nama opsi maksimal 50 karakter.',
            'is_active.required' => 'Status aktif wajib diisi.',
            'is_active.boolean' => 'Status aktif harus berupa true atau false.',
        ];
    }
}