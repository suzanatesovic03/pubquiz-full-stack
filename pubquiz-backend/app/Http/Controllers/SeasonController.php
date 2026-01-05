<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Season;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\StreamedResponse;
class SeasonController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Season::query();
        if ($request->filled('name')) {
            $query->where('name', 'like', '%' . $request->query('name') . '%');
        }
        if ($request->filled('start_date_from')) {
            $query->whereDate('start_date', '>=', $request->query('start_date_from'));
        }
        if ($request->filled('end_date_to')) {
            $query->whereDate('end_date', '<=', $request->query('end_date_to'));
        }

        $perPage = $request->query('per_page', 10);
        $seasons = $query->paginate($perPage);

        return response()->json($seasons, 200);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        if (!$request->user()->is_admin) {
            return response()->json([
                'error' => 'Permission denied.',
                'message' => 'Only administrative users can manipulate seasons.'
            ], 403);
        }
        $season = Season::create($request->all());

        return response()->json([
            'message' => 'Season created successfully',
            'season' => $season
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {

        $season = Season::find($id);

        if (!$season) {
            return response()->json(['error' => 'Season not found'], 404);
        }

        return response()->json($season, 200);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        if (!$request->user()->is_admin) {
            return response()->json([
                'error' => 'Permission denied.',
                'message' => 'Only administrative users can manipulate seasons.'
            ], 403);
        }
        $season = Season::find($id);

        if (!$season) {
            return response()->json(['error' => 'Season not found'], 404);
        }

        $season->update($request->all());

        return response()->json([
            'message' => "Season $id updated successfully",
            'season' => $season
        ], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        if (!request()->user()->is_admin) {
            return response()->json([
                'error' => 'Permission denied.',
                'message' => 'Only administrative users can manipulate seasons.'
            ], 403);
        }
        $season = Season::find($id);

        if (!$season) {
            return response()->json(['error' => 'Season not found'], 404);
        }

        $season->delete();

        return response()->json(['message' => "Season $id deleted successfully"], 200);
    }

    public function active()
    {
        $season = Season::whereDate('start_date', '<=', now())
            ->whereDate('end_date', '>=', now())
            ->first();

        if (!$season) {
            return response()->json(['message' => 'No active season found'], 404);
        }

        return response()->json($season, 200);
    }

    public function events(Season $season)
    {
        $query = $season->events()->with('season');

        if (request()->filled('title')) {
            $query->where('title', 'like', '%' . request('title') . '%');
        }
        if (request()->filled('date_from')) {
            $query->whereDate('date', '>=', request('date_from'));
        }
        if (request()->filled('date_to')) {
            $query->whereDate('date', '<=', request('date_to'));
        }

        $perPage = (int) request('per_page', 10);
        return response()->json($query->paginate($perPage), 200);
    }

    public function leaderboard(Season $season)
    {
        $board = \DB::table('teams')
            ->join('event_team', 'teams.id', '=', 'event_team.team_id')
            ->join('events', 'events.id', '=', 'event_team.event_id')
            ->where('events.season_id', $season->id)
            ->select('teams.id', 'teams.name')
            ->selectRaw('SUM(event_team.score) as total_score')
            ->groupBy('teams.id', 'teams.name')
            ->orderByDesc('total_score')
            ->get();

        if ($board->isEmpty()) {
            return response()->json(['message' => 'No leaderboard data for this season'], 404);
        }

        return response()->json($board);
    }

    public function exportLeaderboardCsv(Season $season)
    {
        $board = DB::table('teams')
            ->join('event_team', 'teams.id', '=', 'event_team.team_id')
            ->join('events', 'events.id', '=', 'event_team.event_id')
            ->where('events.season_id', $season->id)
            ->groupBy('teams.id', 'teams.name')
            ->select('teams.id', 'teams.name', DB::raw('SUM(event_team.score) as total_score'))
            ->orderByDesc('total_score')
            ->get();

        if ($board->isEmpty()) {
            return response()->json(['message' => 'No leaderboard data for this season'], 404);
        }

        $fileName = 'season_' . $season->id . '_leaderboard_' . now()->format('Y_m_d_His') . '.csv';

        $response = new StreamedResponse(function () use ($board) {
            $out = fopen('php://output', 'w');

            fputcsv($out, ['#', 'Team', 'Total score:']);

            $rank = 1;
            foreach ($board as $row) {
                fputcsv($out, [
                    $rank++,
                    $row->name,
                    (int) $row->total_score,
                ]);
            }

            fclose($out);
        });

        $response->headers->set('Content-Type', 'text/csv; charset=UTF-8');
        $response->headers->set('Content-Disposition', "attachment; filename=\"{$fileName}\"");

        return $response;
    }

}
