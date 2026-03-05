<?php

namespace App\Http\Responses;

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Laravel\Fortify\Contracts\RegisterResponse as ContractsRegisterResponse;

use function Pest\Laravel\session;

// class RegisterResponse implements ContractsRegisterResponse
// {
//     public function toResponse($request)
//     {
//         /** @var \App\Models\User $user */
//         $user = Auth::user();
//         Auth::logout();
//         $request->session()->invalidate();
//         $request->session()->regenerateToken();
//         Log::info('singleton jalan');
//         return redirect()->route('verification.notice.unauthenticated', [
//             'id' => $user->id,
//             'hash' => sha1($user->getEmailForVerification()),
//         ]);
//     }
// }
