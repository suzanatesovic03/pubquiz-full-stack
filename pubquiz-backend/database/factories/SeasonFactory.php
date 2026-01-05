<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Season;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Season>
 */
class SeasonFactory extends Factory
{
    protected $model = Season::class;
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        static $startYear = 2019;
        $endYear = $startYear + 1;

        $startDate = "{$startYear}-09-01";
        $endDate = "{$endYear}-05-31";
        $seasonName = "Sezona {$startYear}/{$endYear}";

        $startYear++;

        return [
            'name' => $seasonName,
            'start_date' => $startDate,
            'end_date' => $endDate,
        ];
    }
}
