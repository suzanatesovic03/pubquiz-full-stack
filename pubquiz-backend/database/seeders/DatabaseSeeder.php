<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use App\Models\Season;
use App\Models\Team;
use App\Models\Event;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        Season::factory()->count(7)->create();

        $teams = Team::factory()->count(30)->create();

        foreach ($teams as $team) {
            $captain = User::create([
                'name' => fake()->name(),
                'email' => fake()->unique()->safeEmail(),
                'password' => Hash::make('password'),
                'is_admin' => false,
                'team_id' => $team->id,
            ]);

            $team->update(['captain_id' => $captain->id]);
        }

        Season::all()->each(function ($season) use ($teams) {
            $numEvents = rand(5, 8);

            for ($i = 1; $i <= $numEvents; $i++) {
                $event = Event::create([
                    'title' => "Kolo {$i}",
                    'date' => fake()->dateTimeBetween($season->start_date, $season->end_date),
                    'season_id' => $season->id,
                ]);

                $eventTeams = $teams->random(rand(4, 6));
                $attachments = [];

                foreach ($eventTeams as $team) {
                    $score = rand(5, 50);
                    $attachments[$team->id] = ['score' => $score];
                }

                $event->teams()->attach($attachments);
            }
        });

        User::create([
            'name' => 'Suzana Admin',
            'email' => 'admin@quiz.com',
            'password' => Hash::make('admin123'),
            'is_admin' => true,
            'team_id' => null,
        ]);
    }
}
