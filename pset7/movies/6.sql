SELECT AVG(rating) FROM ratings
WHERE movie_ID IN (SELECT id FROM movies WHERE year=2012)