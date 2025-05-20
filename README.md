This is Zain Marshall's Web Master Application of TJ Computer Team. I have made the following changes to the website.

## CHANGES
* Visual
    * Reworked the color theme to make the frontend more visually appealing
    * Added smooth animations on page changes
    * Made the particle animation in the background a bit less distracting, but its too cool to fully remove. 
* Code Editor
    * Replaced the default text box in the gradeSumbit.ejs and Sumbission tab with CodeMirror 5. This has syntax highlighting for all three lanagues, auto indentation after curly braces, line numbers, and overall actually feels like a code editor, albiet very lightweight, rather than a blank textbox. 
* Problemset Changes
    * Added more data to the problemset view like difficulty, tags, the contest it was from. 
    * Made the problemset sortable by this data 
* Profile Changes
    * Edited the profile layout 
    * Made the edit profile options behind an edit profile button to make the home page cleaner
    * Added Codeforce Handle and Usaco Divsion to the fProfile.ejs so when vieweing others Profile's you can get more information that just their username. 
* Developer Expirence
    * When attempting to edit this website, the expirence wasn't the nicest due to two facts:
        * Setting up the ION OAuth was a bit unclear
        * Setting up the Postgress Database took a while
    * TODO: Finsih writing here

* Planned Changes
    * Rating graph
    * Profile Pictures?
    * Make it so that when sumbitting code for contests it doesn't take you all the way away from the contest page.  

## Installation Instructions
1. Clone this code locally
2. Go to https://ion.tjhsst.edu/oauth/applications and create a new oauth application with a client type of Confidental and a Authorization grant type of Authorization Code. Set the Redirect URI to http://localhost:3000/grade/login. Copy the Client ID and Client Secret and save this application.
3. Create a .env file in at the root of the autograder folder. Add:
CLIENT_ID= [YOUR_CLIENT_ID]
CLIENT_SECRET= [YOUR_CLIENT_SECRET]
CLIENT_REDIRECT_URI= http://localhost:3000/grade/login
4. will write more about psql setup later

## TJ Computer Team Autograder

TJ Computer Team Members: You can find all information about in-houses and the club here: https://activities.tjhsst.edu/ict/.
This grader website can be accessed at https://tjctgrader.org/.
Please contact us through tjctgrader@gmail.com if you have any questions or concerns.

This repository contains most of the website that deals with how pages are rendered to users. The part of the website that runs code and judges it can be found at this repository: https://github.com/TJ-Computer-Team/coderunner.

### Getting Started
`public` folder: Homepage animation, mainly visual

`routes` folder: Main grader code
- `admin.js` = admin functions
- `grade.js` = main functions
- `runTests.js` = portal to other VM where the code is run
- `sql.js` = functions to interact with database

`views` folder: EJS files that are rendered to users

To run this locally, download the files, install Node.js and use npm to install the necessary packages. Then, run: ```node app.js```. You will also have to update the environment variables and database code for it to load properly.

---

Current Developers: Gabriel Xu, Peter Kisselev, Andrew Chen

2023-2024 Developers: Johnny Liu, Daniel Qiu, Gabriel Xu

2022-2023 Developers: Johnny Liu, Daniel Qiu
