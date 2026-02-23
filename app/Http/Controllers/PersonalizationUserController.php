<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PersonalizationUserController extends Controller
{
    public function savePersonalization(Request $request)
    {
        $request->validate([
            'option_ids' => 'required|array',
            'option_ids.*' => 'exists:personalization_options,id',
        ]);

        // Menggunakan sync() untuk Composite Pivot Table
        Auth::user()->personalizations()->sync($request->option_ids);

        return response()->json(['message' => 'Preferences saved successfully']);
    }
}
