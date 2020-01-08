#include <getopt.h>
#include <stdio.h>
#include <stdlib.h>

#include "helpers.h"

int main(void)
{
    RGBTRIPLE triple = {0xff, 0xaa, 0xff};
    BYTE originalRed = triple.rgbtRed;
    BYTE originalGreen = triple.rgbtGreen;
    BYTE originalBlue = triple.rgbtBlue;

    int rgb[3];

    rgb[0] = .272 * originalRed + .534 * originalGreen + .131 * originalBlue;
    rgb[1] = .349 * originalRed + .686 * originalGreen + .168 * originalBlue;
    rgb[2] = .393 * originalRed + .769 * originalGreen + .189 * originalBlue;

    for (int i = 0; i < 3; i++)
    {
        if (rgb[i] > 255)
        {
            rgb[i] = 255;
        }
    }

    triple.rgbtBlue = rgb[0];
    triple.rgbtGreen = rgb[1];
    triple.rgbtRed = rgb[2];

    printf("%x %x %x\n", triple.rgbtBlue, triple.rgbtGreen, triple.rgbtRed);
}
