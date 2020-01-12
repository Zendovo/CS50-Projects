SELECT people.name FROM stars
JOIN people on stars.person_id = people.id
JOIN (
    SELECT * FROM movies
    JOIN stars ON movies.id = stars.movie_id
    WHERE stars.person_id = (SELECT id FROM people WHERE name='Kevin Bacon')
) AS KevinBaconMovies ON stars.movie_id = KevinBaconMovies.id
WHERE NOT stars.person_id = (SELECT id FROM people WHERE name='Kevin Bacon')
GROUP BY people.name;
