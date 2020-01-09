#include "helpers.h"
#include <math.h>
#include <stdio.h>
#include <stdlib.h>

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
            BYTE avg = round((image[i][j].rgbtRed + image[i][j].rgbtGreen + image[i][j].rgbtBlue) / (float) 3);

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
            sepia[0] = round(.272 * originalRed + .534 * originalGreen + .131 * originalBlue);
            sepia[1] = round(.349 * originalRed + .686 * originalGreen + .168 * originalBlue);
            sepia[2] = round(.393 * originalRed + .769 * originalGreen + .189 * originalBlue);

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

        // Iterate over each pixel and store it in the scanline in reverse order
        for (int j = 0; j < width; j++)
        {
            scanline[width - j - 1].rgbtBlue = image[i][j].rgbtBlue;
            scanline[width - j - 1].rgbtGreen = image[i][j].rgbtGreen;
            scanline[width - j - 1].rgbtRed = image[i][j].rgbtRed;
        }

        // Put the triples in the image
        for (int j = 0; j < width; j++)
        {
            image[i][j] = scanline[j];
        }
    }
    return;
}

// Blur image
void blur(int height, int width, RGBTRIPLE image[height][width])
{

    // Space to store the new image
    RGBTRIPLE(*new_image)[width] = calloc(height, width * sizeof(RGBTRIPLE));

    // Iterate over the rows
    for (int i = 0; i < height; i++)
    {
        // Iterate over the pixels in the row
        for (int j = 0; j < width; j++)
        {
            // Store the amount of pixels around the pixel (inclusive)
            int n = 9;

            // Corner and side checks
            if (i - 1 < 0 || i + 1 >= height)
            {
                n = n - 3;

                if (j - 1 < 0 || j + 1 >= width)
                {
                    n = n - 2;
                }
            } 
            else if (j - 1 < 0 || j + 1 >= width)
            {
                n = n - 3;

                if (i - 1 < 0 || i + 1 >= height)
                {
                    n = n - 2;
                }
            }

            // Variable to store the pixels
            RGBTRIPLE pixel_array[n];
            // Temp variable for iteration
            int k = 0;

            // Row -1
            // Pixel -1, -1
            if (!(i - 1 < 0) && !(j - 1 < 0))
            {
                pixel_array[k] = image[i - 1][j - 1];
                k++;
            }
            // Pixel 0, -1
            if (!(i - 1 < 0))
            {
                pixel_array[k] = image[i - 1][j];
                k++;
            }
            // Pixel +1, -1
            if (!(i - 1 < 0) && j + 1 < width)
            {
                pixel_array[k] = image[i - 1][j + 1];
                k++;
            }

            // Row 0 / Original Row
            // Pixel -1, 0
            if (!(j - 1 < 0))
            {
                pixel_array[k] = image[i][j - 1];
                k++;
            }
            // Pixel 0, 0
            // Original Pixel
            pixel_array[k] = image[i][j];
            k++;

            // Pixel +1, 0
            if (j + 1 < width)
            {
                pixel_array[k] = image[i][j + 1];
                k++;
            }

            // Row +1
            // Pixel -1, +1
            if (i + 1 < height && !(j - 1 < 0))
            {
                pixel_array[k] = image[i + 1][j - 1];
                k++;
            }
            // Pixel 0, +1
            if (i + 1 < height)
            {
                pixel_array[k] = image[i + 1][j];
                k++;
            }
            // Pixel +1, +1
            if (i + 1 < height && j + 1 < width)
            {
                pixel_array[k] = image[i + 1][j + 1];
                k++;
            }

            // Initialise sums of the rgb values
            int sums[3] = {0, 0, 0};

            // Determine the sums
            for (int l = 0; l < n; l++)
            {
                sums[0] += pixel_array[l].rgbtBlue;
                sums[1] += pixel_array[l].rgbtGreen;
                sums[2] += pixel_array[l].rgbtRed;
            }

            // Determine the value of rgb of new pixel and store it
            new_image[i][j].rgbtBlue = round(sums[0] / (float) n);
            new_image[i][j].rgbtGreen = round(sums[1] / (float) n);
            new_image[i][j].rgbtRed = round(sums[2] / (float) n);

        }
    }

    // Write the new pixels into the image
    for (int i = 0; i < height; i++)
    {
        for (int j = 0; j < width; j++)
        {
            image[i][j] = new_image[i][j];
        }
    }

    free(new_image);

    return;
}
