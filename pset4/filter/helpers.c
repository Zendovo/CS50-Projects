#include "helpers.h"
#include <math.h>
#include <stdio.h>

// Convert image to grayscale
void grayscale(int height, int width, RGBTRIPLE image[height][width])
{
    // Iterate over each row
    for (int i = 0; i < height; i++)
    {
        // Iterate over each pixel
        for (int j = 0; j < width; j++)
        {
            // Calculate average of the hex
            BYTE avg = (image[i][j].rgbtRed + image[i][j].rgbtGreen + image[i][j].rgbtBlue)/3;

            // Write the new values
            image[i][j].rgbtBlue = avg;
            image[i][j].rgbtGreen = avg;
            image[i][j].rgbtRed = avg;
        }
    }
    return;
}

// Convert image to sepia
void sepia(int height, int width, RGBTRIPLE image[height][width])
{
    // Iterate over each row
    for (int i = 0; i < height; i++)
    {
        // Iterate over each pixel
        for (int j = 0; j < width; j++)
        {
            // Store the original values
            BYTE originalBlue = image[i][j].rgbtBlue;
            BYTE originalGreen = image[i][j].rgbtGreen;
            BYTE originalRed = image[i][j].rgbtRed;

            int sepia[3];

            // Get the sepia hex code for the pixel
            sepia[0] = .272 * originalRed + .534 * originalGreen + .131 * originalBlue;
            sepia[1] = .349 * originalRed + .686 * originalGreen + .168 * originalBlue;
            sepia[2] = .393 * originalRed + .769 * originalGreen + .189 * originalBlue;

            // If the formula results in value higher than 255 cap it to 255
            for (int k = 0; k < 3; k++)
            {
                if (sepia[k] > 255)
                {
                    sepia[k] = 255;
                }
            }

            // Write the sepia color values in
            image[i][j].rgbtBlue = sepia[0];
            image[i][j].rgbtGreen = sepia[1];
            image[i][j].rgbtRed = sepia[2];

        }
    }
    return;
}

// Reflect image horizontally
void reflect(int height, int width, RGBTRIPLE image[height][width])
{
    // Iterate over each row
    for (int i = 0; i < height; i++)
    {
        // Variable to store the current row
        RGBTRIPLE scanline[width];

        // Iterate over each pixel and store it in the scanline
        for (int j = 0; j < width; j++)
        {
            scanline[j] = image[i][j];
        }

        // Put the triples in reverse
        for (int j = 0; j < width; j++)
        {
            image[i][width - j] = scanline[j];
        }
    }
    return;
}

// Blur image
void blur(int height, int width, RGBTRIPLE image[height][width])
{

    for (int i = 0; i < height; i++)
    {
        for (int j = 0; j < width; j++)
        {
            int n = 9;

            if (i - 1 < 0 || i + 1 > height)
            {
                n = n - 3;

                if (j - 1 < 0 || j + 1 > height)
                {
                    n = n - 2;
                }
            }
            
            RGBTRIPLE pixel_array[n];
            int k = 0;

            // Pixel -1, -1
            if (i - 1 >= 0 && j - 1 >= 0)
            {
                pixel_array[k] = image[i - 1][j - 1];
                k++;
            }
            // Pixel 0, -1
            if (i - 1 >= 0 && j - 0 >= 0)
            {
                pixel_array[k] = image[i - 1][j - 0];
                k++;
            }
            // Pixel +1, -1
            if (i - 1 >= 0 && j + 1 <= width)
            {
                pixel_array[k] = image[i - 1][j + 1];
                k++;
            }
            // Pixel -1, 0
            if (i - 0 >= 0 && j - 1 >= 0)
            {
                pixel_array[k] = image[i - 0][j - 1];
                k++;
            }
            // Pixel 0, 0
            if (i - 0 >= 0 && j - 0 >= 0)
            {
                pixel_array[k] = image[i - 0][j - 0];
                k++;
            }
            // Pixel +1, 0
            if (i - 0 >= 0 && j + 1 <= width)
            {
                pixel_array[k] = image[i - 0][j + 1];
                k++;
            }
            // Pixel -1, +1
            if (i + 1 <= height && j - 1 >= 0)
            {
                pixel_array[k] = image[i + 1][j - 1];
                k++;
            }
            // Pixel 0, +1
            if (i + 1 <= height && j - 0 >= 0)
            {
                pixel_array[k] = image[i + 1][j - 0];
                k++;
            }
            // Pixel +1, +1
            if (i + 1 <= height && j + 1 <= width)
            {
                pixel_array[k] = image[i + 1][j + 1];
                k++;
            }

            int sums[3];

            for (int l = 0; l < n; l++)
            {
                sums[0] += pixel_array[l].rgbtBlue;
                sums[1] += pixel_array[l].rgbtGreen;
                sums[2] += pixel_array[l].rgbtRed;
            }

            image[i][j].rgbtBlue = sums[0]/n;
            image[i][j].rgbtGreen = sums[1]/n;
            image[i][j].rgbtRed = sums[2]/n;

        }
    }
    return;
}
