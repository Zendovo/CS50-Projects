from cs50 import get_int
import re
import sys


def main():

    # Get the credit card number
    cc_number = get_int("Number: ")
    tmp_cc = cc_number
    length = len(str(cc_number))

    # Check if the number is of right length
    if not re.search("16|15|13", str(length)):
        print("INVALID")
        exit(0)

    digits = []

    # Store the digits in reverse order
    for i in range(length):
        digits.append(cc_number % 10)
        cc_number = int(cc_number / 10)

    luhn_sum = 0

    # Determine Luhn's algorithm sum
    for i in range(length):

        # Get every other digit
        if i % 2 != 0:

            # Store the value of 2 x the digit
            val = 2 * digits[i]

            if val != 0:

                # Get the length of the value
                val_len = len(str(val))

                # Add the digits of the product to the sum
                for j in range(val_len):
                    luhn_sum += val % 10
                    val = int(val / 10)

        # Directly add to the sum for the other digits
        else:
            luhn_sum += digits[i]

    # Check if the sum is valid
    if luhn_sum % 10 == 0:
        
        # Check for AMEX
        if re.search("^34|37", str(tmp_cc)):
            print("AMEX")

        # Check for MASTERCARD
        elif re.search("^5[1-5]", str(tmp_cc)):
            print("MASTERCARD")

        # Check for MASTERCARD
        elif re.search("^4", str(tmp_cc)):
            print("VISA")
        
        # INVALID
        else:
            print("INVALID")
    
    # INVALID
    else:
        print("INVALID")


main()