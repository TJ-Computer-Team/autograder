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

-------------- Effort ---------------------------
1) Overhaul the GUI using Bootstrap which allows Responsive Design, Consistent User Interface, Fast Devleopment, Flexible Customization.
2) Create Strip down version without OAuth and Database Integration.
3) New Functionalities:
    * Add new My Contest under Contests Tab
    * Display Contest Start Time and End Time
    * Display Problem Set Time Limit
    * Add upload file under Submit Tab
    * New Leader Board Tab
    * New Rating Graph Tab, which can be easily integrated with Profile Tab
4) Propose 
    * Create Database Table Contest with Start Time, which allows admin to manage Contests, such as start End time. Therefore, it eliminates the hardcoding
    * Allows admin to manage Problem, set up time limit.


