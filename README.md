This is Zain Marshall's Web Master Application for TJ Computer Team. I have made the following changes to the website.

## CHANGES
* Visual
    * Reworked the color theme to make the frontend more visually appealing
    * Added smooth animations on page changes
    * Made the particle animation in the background a bit less distracting, but its too cool to fully remove. 
* Teams
    * I added a teams tab which allows users to create teams and join teams using secret codes so you can't just randomly join teams.
    * Added a team rankings page similar to the indivudal rankings page. It is based solely off in-houses.
    * This feature can be used to implement team in-houses which is an idea I had for the club that I feel could increase engagment and collaboration. 
* Code Editor
    * Replaced the default text box in the gradeSumbit.ejs and Submission tab with CodeMirror 5. This has syntax highlighting for all three languages, auto indentation after curly braces, line numbers, and overall actually feels like a code editor, albeit very lightweight, rather than a blank textbox. 
* Problem-Set Changes
    * Added more data to the problem-set view like difficulty, tags, the contest it was from to make the problem-set more useful at a glance rather than making the user click through all the problem names to find out info about it. 
    * Made the problem-set sortable by this data
    * The problem-set defaults to sorting by descending order of problem ID, so the newest problems are on the top just like in codeforces. 
* Profile Changes
    * Edited the profile layout 
    * Made the edit profile options behind an edit profile button to make the home page cleaner
    * Added Codeforce Handle and Usaco Division to the fProfile.ejs so when viewing others Profiles you can get more information that just their username.
    * Added a preferred language tag just for fun  
* Developer Experience
    * When attempting to edit this website, the experience wasn't the nicest due to two facts:
        * Setting up the ION OAuth was a bit unclear
        * Setting up the Postgres Database took a while
    * Below this I wrote some installation instructions, which is more for the future webmaster applicants than the webmasters themselves but it's still helpful. 


## Installation Instructions
1. Clone this code locally
2. Go to https://ion.tjhsst.edu/oauth/applications and create a new OAuth application with a client type of Confidential and a Authorization grant type of Authorization Code. Set the Redirect URI to http://localhost:3000/grade/login. Copy the Client ID and Client Secret and save the application.
3. Create a .env file in the root of the autograder folder. Add:
CLIENT_ID= [YOUR_CLIENT_ID]
CLIENT_SECRET= [YOUR_CLIENT_SECRET]
CLIENT_REDIRECT_URI= http://localhost:3000/grade/login
4. Set up the PostgreSQL database:
    - Install PostgreSQL (https://www.postgresql.org/download/) if you don't have it already.
    - Create a database named `autograder`.
    - Run the schema.sql file to get a sample database:
      ```sh
      psql -U postgres -d autograder -f schema.sql
      ```
    - Make sure your database user and password match what is in your .env
5. Install dependencies:
    ```sh
    npm install
    ```
6. Start the server:
    ```sh
    node app.js
    ```
7. The website is now running http://localhost:3000!

* Planned Changes
    * Rating graph
    * Profile Pictures?
    * Make it so that when sumbitting code for contests it doesn't take you all the way away from the contest page.  

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
