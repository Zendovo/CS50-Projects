SELECT movies.title FROM stars
JOIN movies ON stars.movie_id = movies.id
JOIN people ON stars.person_id = people.id
WHERE people.name = 'Johnny Depp' OR people.name = 'Helena Bonham Carter'
GROUP BY movies.title
HAVING COUNT(stars.movie_id) = 2;