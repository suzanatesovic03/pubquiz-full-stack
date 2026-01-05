<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Event;
use App\Models\Season;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Event>
 */
class EventFactory extends Factory
{
    protected $model = Event::class;
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $season = Season::inRandomOrder()->first();
        $eventNumber = Event::where('season_id', $season->id)->count() + 1;

        return [
            'title' => 'Kolo ' . $eventNumber,
            'date' => $this->faker->dateTimeBetween($season->start_date, $season->end_date),
            'season_id' => $season->id,
        ];
    }
}
