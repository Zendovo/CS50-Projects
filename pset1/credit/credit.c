#include <stdio.h>
#include <cs50.h>
#include <math.h>

int main(void)
{
    // ask for the cc number
    long cc_number = get_long("Number: ");
    int len = ceil(log10(cc_number));

    // check if the number is the right length
    if (len != 16 && len != 15 && len != 13)
    {
        printf("INVALID\n");
        return 0;
    }

    int digits[len];

    // store all the digits reversed
    for (int i = 0; i < len; i++)
    {
        digits[i] = cc_number % 10;
        cc_number /= 10;
    }

    int luhn_sum = 0;

    // determine luhn's algorithm sum
    for (int i = 0; i < len; i++)
    {
        // get every other digit
        if (i % 2 != 0)
        {
            // determine the product
            int val = 2 * digits[i];
            if (val != 0)
            {
                int val_len = ceil(log10(val));

                // add the digits of the product to the sum
                for (int j = 0; j < val_len + 1; j++)
                {
                    luhn_sum += val % 10;
                    val /= 10;
                }
            }
        }
        else // directly add the to the sum for the rest of the digits
        {
            luhn_sum += digits[i];
        }

    }

    // check if the sum is valid
    if (luhn_sum % 10 == 0)
    {

        // check for American Express
        if (digits[len - 1] == 3 && (digits[len - 2] == 4 || digits[len - 2] == 7))
        {
            printf("AMEX\n");
        }
        // check for MasterCard
        else if (digits[len - 1] == 5 && (digits[len - 2] > 0 && digits[len - 2] < 6))
        {
            printf("MASTERCARD\n");
        }
        // check for Visa
        else if (digits[len - 1] == 4)
        {
            printf("VISA\n");
        }
        // else invalid
        else
        {
            printf("INVALID\n");
        }

    }
    else
    {
        printf("INVALID\n");
    }

}