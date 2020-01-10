from cs50 import get_int


def main():

    # Get height from user and prompt again if not 1 to 8 inclusive
    while True:
        n = get_int("Height: ")
        if n in range(1, 9):
            break
    
    # Print each row
    for i in range(n):

        # Print the whitespace before the block
        print(" " * (n - i - 1), end="")

        # Print the blocks
        print("#" * (i + 1), end="")

        # Print the two whitespace between the stairs
        print("  ", end="")
        
        # print the other side of the stairs
        print("#" * (i + 1))


main()