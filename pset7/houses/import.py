import csv
from sys import argv
import cs50


# Create database
db = cs50.SQL("sqlite:///students.db")


def main():

    if len(argv) != 2:
        print("Usage: python import.py characters.csv")
        exit(0)


    with open(argv[1], 'r') as csvfile:

        reader = csv.DictReader(csvfile)

        for row in reader:
            
            name = row['name'].split()

            house = row['house']
            birth = row['birth']
            
            if len(name) == 3:

                first_name = name[0]
                middle_name = name[1]
                last_name = name[2]
    
                db.execute("INSERT INTO students (first, middle, last, house, birth) VALUES (?, ?, ?, ?, ?)",
                            first_name, middle_name, last_name, house, birth)

            if len(name) == 2:

                first_name = name[0]
                last_name = name[1]

                db.execute("INSERT INTO students (first, last, house, birth) VALUES (?, ?, ?, ?)",
                            first_name, last_name, house, birth)


main()