# How to get involved
Pontoon Tools started as my personal project, but it's dedicated to the community of Mozilla localizers and I am open to any inputs or contributions.

For Mozilla localizers the easiest way to get involved is to use Pontoon Tools, [report bugs, request features](https://github.com/MikkCZ/pontoon-tools/issues) or send some short feedback to the [dev-l10n list](https://lists.mozilla.org/listinfo/dev-l10n).

For those, who prefer coding, Pontoon Tools add-on is written in pure JS, HTML and CSS. The JS code is documented using JSDoc and [documentation published here](https://mikkcz.github.io/pontoon-tools/). If you know these and a bit of [WebExtensions API](https://developer.mozilla.org/Add-ons/WebExtensions), [pick a task here](https://github.com/MikkCZ/pontoon-tools/issues) and leave a comment you would like to work on it. In the meantime, before I get back to you, here are few tips to help you start.

Prior making any changes in the code, make sure bulding the add-on works on your machine. The only dependency you should need is [npm](https://www.npmjs.com/get-npm). After installing npm, [fork](https://help.github.com/articles/fork-a-repo/) this repository, [clone](https://help.github.com/articles/cloning-a-repository/) it and use this command to run linting and all applicable tests.

`npm test`

If there are only warnings, no errors, you should be good to go. I use IntelliJ IDEs and gedit, but you can use any editor you feel comfortable with. [Atom](https://atom.io/) or [Notepad++](https://notepad-plus-plus.org/) are never bad choices.

Before creating and pushing your commits, please write a meaningful commit message. A single brief like is perfectly ok, if it says what has been changed. Also please run `npm test` again to ensure your code is well formatted and without obvious errors. When nothing is red, create a [pull request](https://help.github.com/articles/about-pull-requests/).

In any moment, if you are in doubt what to do, do not hesitate to write a comment in the task you are working on and we will find out a solution.
