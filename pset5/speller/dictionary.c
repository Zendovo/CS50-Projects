// Implements a dictionary's functionality

#include <stdbool.h>
#include <stdio.h>
#include <string.h>
#include <strings.h>
#include <stdlib.h>
#include <ctype.h>

#include "dictionary.h"

// Represents a node in a hash table
typedef struct node
{
    char word[LENGTH + 1];
    struct node *next;
}
node;

// Number of buckets in hash table
const unsigned int N = 26 * 26;

// Hash table
node *table[N];

// Number of words
int WORD_COUNT = 0;

// Returns true if word is in dictionary else false
bool check(const char *word)
{
    // store lowercase form of word
    char lword[LENGTH + 1];

    int c = 0;
    while (word[c] != '\0')
    {
        lword[c] = tolower(word[c]);
        c++;
    }

    // get the index
    int index = hash(lword);

    // check if word is in the dictionary
    for (node *tmp = table[index]; tmp != NULL; tmp = tmp->next)
    {
        if (strcasecmp(word, tmp->word) == 0)
        {
            return true;
        }
    }

    return false;
}

// Hashes word to a number
unsigned int hash(const char *word)
{
    int i = word[0] - 97;
    int j = word[0] - 97;
    int index = 26 * i + j;
    return index;
}

// Loads dictionary into memory, returning true if successful else false
bool load(const char *dictionary)
{
    // Try to open the dictionary
    FILE *dict_ptr = fopen(dictionary, "r");
    if (!dict_ptr)
    {
        return false;
    }

    // Space for storing the word
    char word[LENGTH + 1];
    
    while (fscanf(dict_ptr, "%s", word) != EOF)
    {
        // Make a node for the word
        node *n = malloc(sizeof(node));
        if (!n)
        {
            return false;
        }
        strcpy(n->word, word);
        n->next = NULL;

        int index = hash(word);

        // Add word to hash table
        n->next = table[index];
        table[index] = n;

        // Keep count of words
        WORD_COUNT++;
    }

    fclose(dict_ptr);
    
    return true;
}

// Returns number of words in dictionary if loaded else 0 if not yet loaded
unsigned int size(void)
{
    return WORD_COUNT;
}

// Unloads dictionary from memory, returning true if successful else false
bool unload(void)
{
    for (int i = 0; i < N; i++)
    {
        // Until table is empty free the nodes
        while (table[i] != NULL)
        {
            node *tmp = table[i]->next;
            free(table[i]);
            table[i] = tmp;
        }
    }
    
    return true;
}
