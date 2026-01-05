# PubQuiz API

Aplikacija za praćenje i upravljanje kviz događajima omogućava registraciju timova, pregled sezona i događaja, kao i prikaz rang lista po osvojenim poenima. Sistem obezbeđuje autentifikaciju korisnika pomoću tokena i omogućava manipulaciju podacima u skladu sa korisničkim privilegijama.

Backend aplikacija je razvijena korišćenjem Laravel frameworka, a API rute su testirane pomoću Postman alata. 

# Kloniranje projekta i neophodne postavke

- Klonirati repozitorijum komandom `git clone https://github.com/elab-development/serverske-veb-tehnologije-2024-25-pubquiz_2022_0042.git`  

# Pokretanje Laravel aplikacije

- Pozicionirati se u Laravel direktorijum komandom `cd pubquiz-backend`.  
- Instalirati composer zavisnosti komandom `composer install`.  
- Kreirati `.env` fajl u root direktorijumu projekta komandom `cp .env.example .env`.  
- U `.env` fajlu podesiti parametre baze podataka, na primer:  
  `DB_DATABASE=pubquiz`  
  `DB_USERNAME=root`  
  `DB_PASSWORD=`  
- Pokrenuti migracije i seedere komandom `php artisan migrate --seed`.  
- Pokrenuti lokalni server komandom `php artisan serve`.  
