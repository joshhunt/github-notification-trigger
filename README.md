# Github Issues Notifier

Just a small, quick script to send push notifications (using IFTTT) when a new issue on a repo matching a specified filter has been posted.

## Usage

Install dependencies, setup config file and run using node 6.

```
$ nvm use 6
$ npm install
$ cp config.sample.json config.json
$ vim config.json
$ node index.js
```

It will check for new issues once, and exit. Use cron or something to schedule to run on an interval

## Configuration

This script uses `config.json` to store the IFTTT webhook URL, and the GitHub issues filter. Values are:

 * `iftttUrl`: URL to the webhook from the [IFTTT Maker Channel](https://ifttt.com/maker). Activate the channel and get the URL from the 'How to Trigger Events' page.
 * `issueDescription`: A description of the trigger used for the notification. It will automatically pluralized with an 's' at the end when there are multiple new issues.
 * `repo`: Owner and repository of the GitHub repo to monitor for issues, in the format of `owner/repo`.
 * `issueFilter`: Additional paramters to filter the issues with, passed straight to GitHub. See the [GitHub Issues API](https://developer.github.com/v3/issues/#list-issues-for-a-repository) for the allowed paramters