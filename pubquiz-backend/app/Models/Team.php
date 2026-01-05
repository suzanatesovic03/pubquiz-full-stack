<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Team extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'score', 'captain_id'];

    public function users()
    {
        return $this->hasMany(User::class);
    }

    public function events()
    {
        return $this->belongsToMany(Event::class, 'event_team')
            ->withPivot('score')
            ->withTimestamps();
    }

    public function captain()
    {
        return $this->belongsTo(User::class, 'captain_id');
    }
}
