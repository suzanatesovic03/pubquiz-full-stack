<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Team;
class TeamController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Team::with('captain');

        if ($request->has('name')) {
            $query->where('name', 'like', '%' . $request->query('name') . '%');
        }

        if ($request->filled('min_points')) {
            $query->where('score', '>=', (int) $request->query('min_points'));
        }

        if ($request->filled('max_points')) {
            $query->where('score', '<=', (int) $request->query('max_points'));
        }

        $perPage = $request->query('per_page', 10);
        $teams = $query->paginate($perPage);
        return response()->json([
            'data' => $teams->items(),
            'meta' => [
                'current_page' => $teams->currentPage(),
                'last_page' => $teams->lastPage(),
                'per_page' => $teams->perPage(),
                'total' => $teams->total(),
            ],
        ], 200);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'score' => 'nullable|integer',
        ]);

        $team = Team::create($validated);

        return response()->json([
            'message' => 'Team successfully created',
            'team' => $team
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $team = Team::find($id);

        if (!$team) {
            return response()->json(['error' => 'Team not found'], 404);
        }

        return response()->json($team, 200);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $team = Team::find($id);

        if (!$team) {
            return response()->json(['error' => 'Team not found'], 404);
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'score' => 'sometimes|integer',
        ]);

        $team->update($validated);

        return response()->json([
            'message' => 'Team updated successfully',
            'team' => $team
        ], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $team = Team::find($id);

        if (!$team) {
            return response()->json(['error' => 'Team not found'], 404);
        }

        $team->delete();

        return response()->json(['message' => 'Team deleted successfully'], 200);
    }

    public function leaderboard()
    {
        $leaderboard = \DB::table('teams')
            ->join('event_team', 'teams.id', '=', 'event_team.team_id')
            ->select('teams.id', 'teams.name')
            ->selectRaw('SUM(event_team.score) as total_score')
            ->groupBy('teams.id', 'teams.name')
            ->orderByDesc('total_score')
            ->get();

        if ($leaderboard->isEmpty()) {
            return response()->json(['message' => 'No leaderboard data found'], 404);
        }

        return response()->json($leaderboard);
    }

    public function myResults(Request $request)
    {
        $user = $request->user();

        if (!$user->team_id) {
            return response()->json(['message' => 'Korisnik nije član nijednog tima.'], 404);
        }

        $team = \App\Models\Team::with([
            'events' => function ($q) {
                $q->orderBy('date', 'asc');
            }
        ])->find($user->team_id);

        if (!$team) {
            return response()->json(['message' => 'Tim nije pronađen.'], 404);
        }

        $results = $team->events->map(function ($event) {
            return [
                'event_title' => $event->title,
                'event_date' => $event->date,
                'score' => $event->pivot->score
            ];
        });

        return response()->json([
            'team_name' => $team->name,
            'results' => $results
        ], 200);
    }

}
