 
from cs50 import get_string
import re


def main():

    # Get string to be evaluated
    text = get_string("Text: ")

    # Init variables to store the count
    letters = 0
    words = 1
    sentences = 0

    # Find sentences, words, letters in text
    for char in text:

        # If the char is [!, ., ?] a sentence ends
        if re.search(r"[!|.|?]", char):
            sentences += 1
        
        # If there is whitespace a word ends
        elif re.search(r"^\s", char):
            words += 1

        # If there is a alphabet it is a letter
        elif re.search(r"^\w", char):
            letters += 1

    # Determine the number of letter per 100 words
    L = (letters * 100) / words

    # Determine the number of sentences per 100 words
    S = (sentences * 100) / words

    # Apply Coleman-Liau formula and get the index
    index = 0.0588 * L - 0.296 * S - 15.8

    # Print the grade
    if index < 1:
        print("Before Grade 1")

    elif index > 16:
        print("Grade 16+")

    else:
        print(f"Grade {round(index)}")


main()