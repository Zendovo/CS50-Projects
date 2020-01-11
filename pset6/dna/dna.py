import csv
from sys import argv
import re

db_rows = []
cur = 0

patterns = []


def main():
    
    if len(argv) != 3:
        print("Usage: python dna.py data.csv sequence.txt")
        exit(0)

    # Open the database
    with open(argv[1], 'r') as db_csvfile:

        reader = csv.reader(db_csvfile)

        for row in reader:
            
            db_rows.append(row)
    
    store_patterns()

    # Find the longest chains of the patterns
    for pattern in patterns:
        read_sequence(argv[2], pattern)

    identify_person()


# Get the types of patterns from the database
def store_patterns():

    # Strip off the name header
    pattern_names = db_rows[0][1:len(db_rows[0])]

    # Store each pattern
    for pattern in pattern_names:

        tmp_dict = {
            'pattern': pattern,
            'count': 0
        }
        patterns.append(tmp_dict)


# Reads the sequence to find the occurences of the pattern
def read_sequence(sq_file, pattern):

    global cur
    cur = 0
    
    # Open the sequence file
    sequence = open(sq_file, 'r')

    # Store the length of the pattern
    plen = len(pattern.get('pattern'))

    # Read the file
    while True:
        
        # Read the first pattern
        buff = sequence.read(plen)

        # If end of file exit
        if not buff:
            break

        # If the pattern matches
        if buff == pattern.get('pattern'):

            consecutive_check(sequence, pattern, buff, plen)

        else:
            cur += 1
            sequence.seek(cur, 0)


# Checks for a chain of the pattern
def consecutive_check(sequence, pattern, buffer, pattern_len):
    
    tmp_count = 0
    global cur

    # Till the pattern is read
    while (buffer == pattern.get('pattern')):

        # Count it
        tmp_count += 1

        # Read the next sequence
        buffer = sequence.read(pattern_len)

    # If the new chain is longer store it
    if tmp_count > pattern.get('count'):

        tmp_dict = {'count': tmp_count}
        pattern.update(tmp_dict)

    # Go back to the old cursor position
    cur += 1
    sequence.seek(cur, 0)


# Identify the person with the matching dna sequence
def identify_person():
    
    # Iterate over the rows
    for row in db_rows[1:len(db_rows)]:

        row_len = len(patterns)

        # Match each count of DNA sequence
        for i in range(row_len):

            # If does not match, break
            if not int(row[i + 1]) == patterns[i].get('count'):
                break

            # If all counts match print his name
            if i + 1 == row_len:
                print(row[0])
                exit(0)

    print("No match")


main()