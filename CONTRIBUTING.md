# How to get involved
Pontoon Tools started as my personal project, but it's dedicated to the community of Mozilla localizers and I am open to any inputs or contributions.

For Mozilla localizers the easiest way to get involved is to use Pontoon Tools, [report bugs, request features](https://github.com/MikkCZ/pontoon-tools/issues) or send some short feedback to the [dev-l10n list](https://lists.mozilla.org/listinfo/dev-l10n).

For those, who prefer coding, Pontoon Tools add-on is written in JS, HTML, CSS + [WebExtensions APIs](https://developer.mozilla.org/Add-ons/WebExtensions). The JS code is documented using JSDoc and [documentation published here](https://mikkcz.github.io/pontoon-tools/). Feel free to [pick a task here](https://github.com/MikkCZ/pontoon-tools/issues) and leave a comment you would like to work on it. In the meantime, before I get back to you, here are few tips to help you start.

Prior you start making any changes, make sure you can build the add-on on your machine. The only tool you should need is [npm](https://www.npmjs.com/get-npm). After installing npm, [fork](https://help.github.com/articles/fork-a-repo/) this repository, [clone](https://help.github.com/articles/cloning-a-repository/) it and use these commands to run linting and all applicable tests.

```
npm install
npm test
```

Before diving deep in the code, please [read this wiki page](https://wiki.mozilla.org/L10n:Pontoon-Tools/Technical_Overview) with a high-level overview, what to expect and what the architecture is. If you are in doubt what to do, do not hesitate to write a comment in the task you are working on and we will find out a solution.

Before creating and pushing your commits, please write a meaningful commit message, what has been changed. Also please run `npm test` again to ensure your code is well formatted and without obvious errors. When nothing is red, create a [pull request](https://help.github.com/articles/about-pull-requests/).
