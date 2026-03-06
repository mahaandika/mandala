<?php

namespace App\Http\Requests;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Carbon\Carbon;
use Illuminate\Validation\Rule;

class StoreReservationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $minTime = '11:00';
        $maxTime = '22:00';

        return [
            'name' => [
                'required',
                'string',
                'max:255',
            ],

            'phone' => [
                'required',
                'string',
                'max:16',
               Rule::unique(User::class)
                    ->ignore($this->user),
            ],

            'person' => [
                'required',
                'integer',
                'min:1',
            ],

            'date' => [
                'required',
                'date',
                'after_or_equal:today',
            ],

            'time' => [
                'required',
                'date_format:H:i',
                "after_or_equal:$minTime",
                "before_or_equal:$maxTime",
            ],

            'table_ids' => [
                'required',
                'array',
                'min:1',
            ],

            'table_ids.*' => [
                'required',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Nama wajib diisi.',
            'name.max' => 'Nama maksimal 255 karakter.',

            'phone.required' => 'Nomor telepon wajib diisi.',
            'phone.max' => 'Nomor telepon maksimal 16 karakter.',
            'phone.unique' => 'Nomor telepon sudah terdaftar, gunakan nomor lain.',

            'person.required' => 'Jumlah orang wajib diisi.',
            'person.integer' => 'Jumlah orang harus berupa angka.',
            'person.min' => 'Jumlah orang minimal 1.',

            'date.required' => 'Tanggal reservasi wajib diisi.',
            'date.date' => 'Format tanggal tidak valid.',
            'date.after_or_equal' => 'Tanggal reservasi tidak boleh sebelum hari ini.',

            'time.required' => 'Waktu reservasi wajib diisi.',
            'time.date_format' => 'Format waktu harus HH:MM.',
            'time.after_or_equal' => 'Reservasi hanya bisa dilakukan mulai pukul 11:00.',
            'time.before_or_equal' => 'Reservasi maksimal pukul 22:00.',

            'table_ids.required' => 'Minimal satu meja harus dipilih.',
            'table_ids.array' => 'Format meja tidak valid.',
            'table_ids.min' => 'Minimal satu meja harus dipilih.',
            'table_ids.*.exists' => 'Meja yang dipilih tidak valid.',
        ];
    }
}