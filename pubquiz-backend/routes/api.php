<?php

use App\Http\Controllers\EventController;
use App\Http\Controllers\SeasonController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\TeamController;
use App\Http\Controllers\AuthController;

Route::middleware('api')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);

    Route::get('/seasons/active', [SeasonController::class, 'active']);
    Route::get('/seasons/{season}/leaderboard', [SeasonController::class, 'leaderboard']);
    Route::get('/events/{event}/leaderboard', [EventController::class, 'leaderboard']);
    Route::get('/trivia/questions', [EventController::class, 'trivia']);
    Route::get('/seasons/{season}/events', [SeasonController::class, 'events']);
    Route::get('/events/{event}/teams', [EventController::class, 'teams']);

    Route::apiResource('teams', TeamController::class)->only(['index', 'show']);
    Route::apiResource('seasons', SeasonController::class)->only(['index', 'show']);
    Route::apiResource('events', EventController::class)->only(['index', 'show']);
    Route::get('/seasons/{season}/leaderboard/export', [SeasonController::class, 'exportLeaderboardCsv']);


});

Route::middleware(['auth:sanctum'])->get('/my-results', [App\Http\Controllers\TeamController::class, 'myResults']);

Route::middleware(['api', 'auth:sanctum'])->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::apiResource('teams', TeamController::class)->only(['store', 'update', 'destroy']);
    Route::apiResource('seasons', SeasonController::class)->only(['store', 'update', 'destroy']);
    Route::apiResource('events', EventController::class)->only(['store', 'update', 'destroy']);
});