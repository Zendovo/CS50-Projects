SELECT people.name FROM directors
JOIN ratings ON directors.movie_id = ratings.movie_id
JOIN people ON directors.person_id = people.id
WHERE ratings.rating >= 9.0
GROUP BY people.id;