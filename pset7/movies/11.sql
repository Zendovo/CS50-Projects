SELECT movies.title FROM stars
JOIN movies ON stars.movie_id = movies.id
JOIN ratings ON stars.movie_id = ratings.movie_id
WHERE stars.person_id = (SELECT id FROM people WHERE name='Chadwick Boseman')
ORDER BY ratings.rating DESC
LIMIT 5;