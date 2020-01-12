import csv
import re


def main():

    if len(argv) != 2:
        print("Usage: python import.py characters.csv")
        exit(0)

    with open(argv[1], 'r') as 