# Codeforces 71A: Way Too Long Words

**Statement:**
Sometimes some words like "localization" or "internationalization" are so long that writing them many times in one text is quite tiresome.

Let's consider a word too long, if its length is strictly more than 10 characters. All too long words should be replaced with a special abbreviation.

This abbreviation is made like this: we write down the first and the last letter of a word and between them we write the number of letters between the first and the last letters. That number is in decimal system and doesn't contain any leading zeros.

Thus, "localization" will be spelt as "l10n", and "internationalization» will be spelt as "i18n".

You are suggested to automatize the process of changing the words with abbreviations.

**Input:**
The first line contains an integer n (1 ≤ n ≤ 100). Each of the following n lines contains one word. All the words consist of lowercase Latin letters and possess lengths from 1 to 100 characters.

**Output:**
Print n lines. The i-th line should contain the result of replacing the i-th word from the input with an abbreviation (if needed) or should contain the word unchanged (if not needed).

**Sample Input:**
```
4
word
localization
internationalization
pneumonoultramicroscopicsilicovolcanoconiosis
```
**Sample Output:**
```
word
l10n
i18n
p43s
``` 