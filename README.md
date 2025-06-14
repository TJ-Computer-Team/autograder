## TJ Computer Team Autograder

TJ Computer Team Members: You can find all information about in-houses and the club here: https://activities.tjhsst.edu/ict/.
This grader website can be accessed at https://tjctgrader.org/.
Please contact us through tjctgrader@gmail.com if you have any questions or concerns.

This repository contains most of the website that deals with how pages are rendered to users. The part of the website that runs code and judges it can be found at this repository: https://github.com/TJ-Computer-Team/coderunner.

### Getting Started
`autograder` folder: contains main code
`autograder/public` folder: Homepage animation, mainly visual

`autograder/routes` folder: Main grader code
- `admin.js` = admin functions
- `grade.js` = main functions
- `runTests.js` = portal to other VM where the code is run
- `sql.js` = functions to interact with database

`autograder/views` folder: EJS files that are rendered to users

`config` folder: contains code for dev testing

To run this locally, make sure to have docker installed and run `docker compose up --build` inside the `config` folder. If you want to make changes to the database layout, edit `init.sql` and run `reset_db.sh`. This will delete all data in the database and replace it with filler example data.

---

Current Developers: Gabriel Xu, Peter Kisselev, Andrew Chen

2023-2024 Developers: Johnny Liu, Daniel Qiu, Gabriel Xu

2022-2023 Developers: Johnny Liu, Daniel Qiu