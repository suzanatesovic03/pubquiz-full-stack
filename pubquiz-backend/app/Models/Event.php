<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
class Event extends Model
{
    use HasFactory;
    protected $fillable = ['title', 'date', 'season_id'];

    public function season()
    {
        return $this->belongsTo(Season::class);
    }

    public function teams()
    {
        return $this->belongsToMany(Team::class, 'event_team')
            ->withPivot('score')
            ->withTimestamps();
    }
}
