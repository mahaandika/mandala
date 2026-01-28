<?php

namespace App\Http\Requests\Admin;

use App\Enums\SelectionMode;
use App\Enums\SelectionType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PersonalTypeRequest extends FormRequest
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
            'name'           => ['required', 'max:255'],
            'label'          => ['required', 'max:255'],
            'selection_mode' => ['required', Rule::enum(SelectionMode::class)],
            'selection_type' => ['required', Rule::enum(SelectionType::class)],
            'is_active'      => ['required', 'boolean'],
        ];

    }


    public function messages()
    {
        return [
            'name.required' => 'Nama perlu diisi',
            'name.max' => 'Nama tidak boleh lebih dari 255 karakter',
            'label.required' => 'Label perlu diisi',
            'label.max' => 'Label tidak boleh lebih dari 255 karakter',
            'selection_mode.required' => 'Pilihan mode tidak boleh kosong',
            'selection_type.required' => 'Pilihan tipe tidak boleh kosong',
            'selection_type.enum' => 'Pilihan tipe tidak boleh kosong',
            'selection_mode.enum' => 'Pilihan mode tidak boleh kosong',
            'is_active.required' => 'Pilihan keaktifan tidak boleh kosong',
            'icon.required' => 'Icon perlu diisi',
        ];
    }
}
