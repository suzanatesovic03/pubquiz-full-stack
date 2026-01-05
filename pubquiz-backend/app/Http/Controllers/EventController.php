<?php

namespace App\Http\Controllers;
use Illuminate\Support\Facades\Http;
use Illuminate\Http\Request;
use App\Models\Event;
class EventController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Event::query();

        if ($request->filled('title')) {
            $query->where('title', 'like', '%' . $request->query('title') . '%');
        }

        if ($request->filled('date')) {
            $query->whereDate('date', '=', $request->query('date'));
        }

        if ($request->filled('season_id')) {
            $query->where('season_id', '=', (int) $request->query('season_id'));
        }

        $perPage = $request->query('per_page', 10);
        $events = $query->paginate($perPage);

        return response()->json($events, 200);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        if (!$request->user()->is_admin) {
            return response()->json([
                'error' => 'Permission denied.',
                'message' => 'Only administrative users can create events.'
            ], 403);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'date' => 'required|date',
            'season_id' => 'required|exists:seasons,id',
            'teams' => 'nullable|array',
            'teams.*.id' => 'exists:teams,id',
            'teams.*.score' => 'integer|min:0',
        ]);

        $event = Event::create([
            'title' => $validated['title'],
            'date' => $validated['date'],
            'season_id' => $validated['season_id'],
        ]);

        if (!empty($validated['teams'])) {
            $pivotData = [];
            foreach ($validated['teams'] as $team) {
                $pivotData[$team['id']] = ['score' => $team['score']];
            }
            $event->teams()->attach($pivotData);
        }

        return response()->json([
            'message' => 'Event created successfully',
            'event' => $event->load(['season', 'teams'])
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $event = Event::with(['season', 'teams'])->find($id);

        if (!$event) {
            return response()->json(['error' => 'Event not found'], 404);
        }

        return response()->json($event, 200);

    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        if (!$request->user()->is_admin) {
            return response()->json([
                'error' => 'Permission denied.',
                'message' => 'Only administrative users can update events.'
            ], 403);
        }

        $event = Event::find($id);

        if (!$event) {
            return response()->json(['error' => 'Event not found'], 404);
        }

        $event->update($request->all());

        return response()->json([
            'message' => "Event $id updated successfully",
            'event' => $event
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
                'message' => 'Only administrative users can delete events.'
            ], 403);
        }

        $event = Event::find($id);

        if (!$event) {
            return response()->json(['error' => 'Event not found'], 404);
        }

        $event->delete();

        return response()->json(['message' => "Event $id deleted successfully"], 200);
    }


    public function teams(Event $event)
    {
        $teams = $event->teams()
            ->select('teams.id', 'teams.name')
            ->withPivot('score')
            ->orderByDesc('event_team.score')
            ->get()
            ->map(function ($team) {
                return [
                    'id' => $team->id,
                    'name' => $team->name,
                    'score' => $team->pivot->score,
                ];
            });

        if ($teams->isEmpty()) {
            return response()->json(['message' => 'No teams found for this event'], 404);
        }

        return response()->json($teams, 200);
    }

    public function leaderboard(Event $event)
    {
        $board = \DB::table('teams')
            ->join('event_team', 'teams.id', '=', 'event_team.team_id')
            ->where('event_team.event_id', $event->id)
            ->select('teams.id', 'teams.name', 'event_team.score')
            ->orderByDesc('event_team.score')
            ->get();

        if ($board->isEmpty()) {
            return response()->json(['message' => 'No leaderboard for this event'], 404);
        }

        return response()->json($board);
    }

    public function trivia()
    {
        $response = Http::get('https://opentdb.com/api.php?amount=5&type=multiple');

        if ($response->successful()) {
            return response()->json($response->json(), 200);
        }

        return response()->json(['error' => 'Failed to fetch trivia data'], 500);
    }

}
