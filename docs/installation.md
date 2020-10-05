# Installing SMK

There are a variety of ways to install `smk` into your application.


## Use `smk create`

If you want to create a new application using `smk`, then the easiest way is with the `smk-cli`.
First make sure that the `smk-cli` is installed globally in your machine:

    > npm install --global smk-cli

Test that this worked:

    > smk help

You should see the help information for `smk-cli`.

Change to the a directory where you keep your projects, and create a new `smk` application (change `my-new-app` to whatever you like).

    > cd projects
    > smk create my-new-app

You will be asked some questions about your new application.
Once they are answered you will have a new skeleton application at `projects/my-new-app`.


## Install from NPM

In your NPM project, use this command to add `smk` as a dependency:

    > npm install smk

Then, in your application you add the `smk` library like this:

    <script src="node_modules/smk/dist/smk.js"></script>


## Download

Click one of the download links to left to download the most recent build of `smk`.
After unzipping the package, you should copy the `dist` folder to your project.

Then in your application, you could include `smk` like this (assumeing you copied `dist` to `assets/js/smk`):

    <script src="assets/js/smk/smk.js"></script>


## Use deployed version

Include this in your application:

    <script src="[url of smk deployment]/smk.js"></script>

