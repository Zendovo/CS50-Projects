import csv
from sys import argv
import cs50


# Create database
db = cs50.SQL("sqlite:///students.db")


def main():

    if len(argv) != 2:
        print("Usage: python roster.py house")
        exit(0)

    rows = db.execute("SELECT * FROM students WHERE house=? ORDER BY last, first", argv[1])

    for row in rows:

        name = [row['first'], row['last']]
        
        if row['middle']:
            name = [row['first'], row['middle'], row['last']]

        print(f"{' '.join(name)}, born {row['birth']}")


main()