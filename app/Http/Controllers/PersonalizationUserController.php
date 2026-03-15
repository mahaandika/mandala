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

        if (Auth::check()) {
            // Simpan ke DB untuk user yang login
            Auth::user()->personalizations()->sync($request->option_ids);
        } else {
            // Simpan ke Session untuk guest
            session(['guest_personalizations' => $request->option_ids]);
        }

        return response()->json(['message' => 'Preferences saved successfully']);
    }
}
