## TJ Computer Team Autograder

TJ Computer Team Members: You can find all information about in-houses and the club here: https://activities.tjhsst.edu/ict/.
This grader website can be accessed at https://tjctgrader.org/.
Please contact us through tjctgrader@gmail.com if you have any questions or concerns.

This repository contains most of the website that deals with how pages are rendered to users. The part of the website that runs code and judges it can be found at this repository: https://github.com/scienceqiu/coderunner.

### Getting Started

Public folder: Homepage Animation, mainly visual

Routes folder: Main grader code
- admin.js = admin functions
- grade.js = main functions
- runTests.js = portal to VM2 (where the code gets run)
- sql.js = functions to interact with database

Views folder: EJS files that are rendered to users

To run this locally, download the files, install Node.js and use npm to install the necessary packages. Then, run:
```node app.js```.

Current Developers: Gabriel Xu, Johnny Liu, and Daniel Qiu

**VISUAL CHANGES:**
1) Overhauled the GUI using Bootstrap, allowing for responsive design, consistent UI, faster development, and more flexible customization later on.
2) Added Tailwind CSS, leading to more modern and better customization later on
3) Gve website a more modern aesthetic (which I think looks better)
4) Moved logo to top-left
5) New and improved log-out button
7) Removed gradient from the background and changed the overall website theme color to nicer navy deep blue
9) Font changes (it's ui-sans-serif, looking for future ones that could fit even better)
11) Added hover color changes to nav bar tabs, submit button, tables, etc.
12) Submissions tab now displays bold green in Verdict if solution accepted
13) Improved table design (centered text, padding, white border, colorings, etc.)
14) Added shadow to nav bar 

**FUNCTIONALITY CHANGES**

1) Added a "my contests" tab to contests, where after in-house contests, in-house takers can review their past contests as well as their corersponding editorial solutions to learn from mistakes or try past problems they didn't get to
2) Added a rating graph, which can easily be integrated into the Dashboard
3) Added personal stats to dashboard (e.g. #contests attended, #problems solved, future steps w/ access to database)
4) Added a leaderboard tab, which displays rank / rated elo of Computer Team members
6) Added start time and end times to contest
7) Time limits on each problem (future steps with access to database)
8) Helped clean up code by reducing repetition. For example, nav bar code no longer has to be repeatedly rewritten between 8 different ejs files, but now  it is instead written once in new partials folder
9) Added hyperlink between the Submissions page and Problems page (now can directly get to a problem from submissions page)
10) Other small tweaks


**COMMENTS:**
I got rid of the database and oauth sections of the code. Because of this, to run my code you've got to create a .env file or else it gives an error.

In the future, I want to expand on the functionalities mentioned above with access to the database. With more time, I want to further enhance the visual look of the website. 

**- Andrew Chen**

