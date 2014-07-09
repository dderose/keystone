#FED Framework

The FED Framework is a modular CSS and JavaScript framework created to unify and simplify front-end, application development
at Constant Contact.

##Table of Contents
* [Overview](#overview)
* [Working with the project](#working-with-the-project)
* [Using Grunt](#using-grunt)
   * [Installation and setup](#grunt-and-node-installation-and-setup)
   * [List of tasks](#using-grunt-in-bridge-css)
* [Testing the Framework](#testing-bridge-css)
   * [CSS testing with Huxley](#css-with-huxley)
   * [JavaScript testing with qUnit](#javascript-with-qunit)


##Overview
**PURPOSE:** Provide a reusable, flexible and extensible library of styles and components to enable any application to adopt the CTCT look and feel quickly and easily.

**GOALS:**
* Make it easier for applications to adopt the CTCT look and feel
* Make it easier for applications to update their look and feel as design goals change

##Working with the project

***Please only submit changes to the development branch.***

To contribute to the FED Framework, you'll want to properly configure your IDE and familiarize yourself with
the code quality, convenience and testing tools built into the project:

* Editor Configuration: (.editorconfig) http://editorconfig.org/
    * Plugins for your IDE: http://editorconfig.org/#download
* Grunt CSSlint: (.csslintrc) https://github.com/stubbornella/csslint/wiki/Rules
* Grunt SASS: https://github.com/sindresorhus/grunt-sass and https://github.com/andrew/node-sass
* Grunt JSHint: http://www.jshint.com/docs/
* Node Huxley: https://github.com/chenglou/node-huxley

You'll also need to go through the Grunt and Huxley setup guides, below. But for a shortcut:

````bash
git clone https://github.roving.com/ES/fed-framework.git
cd fed-framework
npm install -g grunt-cli huxley selenium-server karma-cli
npm install
selenium
grunt build
````


<br>
##Using Grunt
The FED Framework uses Gruntjs for asset management, unit testing, developer convenience, build and deployment.
Below is a list of the tasks, modes and how to use them.

SUMMARY:
[Grunt](http://gruntjs.com) is a JavaScript task runner, not too different from Maven, Rake, Make, Gradle, etc.
It can be used to automate a wide assortment of build and development tasks. In Campaign-UI, Grunt is being used
as a code-quality and convenience tool.

###PURPOSE:
- Enable enhanced JavaScript unit testing with Karma and Jasmine
- Promote best practices when coding HTML, CSS and JavaScript
- Unify JavaScript code style across the application
- Provide auto-documentation for JavaScript and CSS

###GRUNT AND NODE INSTALLATION AND SETUP:
1. [Install Node & Node Package Manager (npm)](http://nodejs.org)
2. Install Grunt-CLI (command line interface) into your system path with the command: `npm install -g grunt-cli`
3. Read the [Grunt getting started guide](http://gruntjs.com/getting-started)
4. Change directories into root of the repo, the directory with the Gruntfile.js
5. Install all the necessary dependencies `npm install`
6. Congratulations, you're all setup. Use the `grunt --help` command to see all configured tasks, which are also detailed below.


###USING GRUNT IN FED-FRAMEWORK:
Below are a list of custom Grunt tasks. They are designed to make your life easier and your code better.

Currently, the complete tasks:
- `grunt dev`: Watches your project files and compiles the JS and CSS into the dist/ directory. It will also lint your CSS and JS files, run Jasmine unit test, recompile docs as needed, and live reload your browsers if they have the proper plugins installed and activated.
- `grunt testhuxley`: Run the available Huxley tests against the current files.
- `grunt testqunit`: Run all qUnit JavaScript tests.
- `grunt blanket_qunit`: Run blanket code coverage and qUnit tests.
- `grunt viewtests`: Open the qUnit test page, complete with blanket code coverage.
- `grunt updatetests`: **[BE CAREFUL WITH THIS]** Runs the available Huxley tests, and updates all the baseline images.
- `grunt createdocs`: Auto-generate new documentation and fixtures.
- `grunt viewdocs`: Auto-generate new documentation and fixtures, then serve docs on port 9000. Visit http://localhost:9000/doc/
- `grunt build`: Produces linted, tested, and minified CSS and JS files with supporting documentation and testing fixtures.
- `grunt deploy`: Runs the build task, and then creates a versioned zip file ready for Artifactory in the dist/ directory.

<br>

###UPDATING NPM DEPENDENCIES:
The dependencies for npm (in [package.json](./package.json)) are used by grunt to perform tasks.
The dependencies are exact versioned to ensure a consistent experience for developers and build servers.
To check for updates, run `npm outdated -depth=0`.
If you wish to update any dev dependencies for the project, update [package.json](./package.json) accordingly and run `npm install`.
Run all tests and perform a manual regression (as needed) before submitting a pull request.

##TESTING FED-FRAMEWORK:
There will be both CSS and JS tests ensuring that the modules and components work as expected.

###CSS: with Huxley
We're using the [Node port](https://github.com/chenglou/node-huxley) of Facebook's [huxley](https://github.com/facebook/huxley) to catch visual regressions accross the framework. Huxley uses a Selenium server to record browser sessions and user actions as well as take screenshots. When a test is run, it replays the recordings and compares the new screenshots to the baseline. If they are different the test fails.

**INSTALLATION & SETUP:**

1. Make sure you have Node, NPM and Grunt already setup and working. [See instructions above](#grunt-and-node-installation-and-setup).
2. Install [node-huxley](https://github.com/chenglou/node-huxley) globally: `npm install -g huxley`
3. Install the [node wrapper for Selenium](https://github.com/eugeneware/selenium-server): `npm install -g selenium-server`

<br>
**CREATING A HUXLEY TEST:**

1. If there's not already a named direcory and Huxleyfile.json in the appropriate location inside the test/ directory, create one. Each task is an object. Only name and url are mandatory and screenSize is the only other option. A sample Huxley is below this list.
2. Start your Selenium server from a new terminal window with bash command: `selenium`
3. Next, in your terminal, change directories, `cd`, into the directory of the Huxleyfile.json you'd like to use.
4. Start the recording for your Huxley test with the bash command: `hux -r`
5. A browser will be opened by Selenium, and your actions will be recorded. Each time you'd like to create a screenshot, go to the terminal where you typed `hux -r` and press 'enter'. Your screeshot will be saved and used as the baseline for all comparisons when you run the test in the future. Be sure to activate and take screenshots of the various states of your component.
6. When you're done recording your test, type: `q` and then press 'enter' to stop and save the recording.
7. Huxley by default speeds up the time between interactions, so if you need to test a component in real time, ajax requests or animations for example, you'll want to use "Live Recording Mode." [See instructions for Live Recording Mode here](https://github.com/chenglou/node-huxley#l-for-live).

<br>
**SAMPLE Huxley.json FILE**
````javascript
[
  {
    "name": "componentName",
    "screenSize": [1000, 600],
    "url": "http://localhost:9001/test/fixtures/correspondingFixtureFile.html"
  },
  {
    "name": "componentName2",
    "url": "http://localhost:9001/test/fixtures/correspondingFixtureFile2.html"
  }
]
````

<br>
**RUNNING YOUR HUXLEY TESTS:**<br>
You can run the full suite of Huxley tests with `grunt test`, but you must first have a Selenium server running: `selenium` command once it's installed.

If there is a failure, you'll want to follow these steps:

1. Isolate the failing test in its Huxleyfile.json, by adding an 'x' in front of the "name" parameters of all tests except the one that failed ( "name" => "xname").
2. With your terminal change directories, `cd`, into the directory with the offending Huxleyfile.json.
3. Run the single, failing test again with `hux`, to verify the failure, then check the image diff that was generated, something like diff.png. It will be located in a directory labeled with the name of the test and a ".hux" extension.
4. If the change is intentional, run `hux -u` to update the baseline images with your changes. If it's not an intentional change, fix the issue.
5. Revert back all the "xname" keys to "name", and rerun the tests in the currently targeted Huxley.json file with: `hux`. If they all pass, life is good.
6. Run the full suite of Huxley tests with grunt: `grunt test`. If they all now pass, life is even better.

<br>
**EXTRA RESOURCES:**
- [Node-huxley info](https://github.com/chenglou/node-huxley)
- [Facebook Huxley info](https://github.com/facebook/huxley)
- [Node Selenium Wrapper info](https://github.com/eugeneware/selenium-server)
- [General info about CSS testing](http://csste.st)

<br>
###JavaScript: with qUnit

You can run all existing qUnit test with `grunt testqunit`
