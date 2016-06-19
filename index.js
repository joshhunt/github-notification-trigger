const fs = require('fs');
const url = require('url');
const _ = require('lodash');
const querystring = require('querystring');

const fetch = require('node-fetch');
const FormData = require('form-data');

function checkResponse(response) {
  if (!response.ok) {
    throw Error(response.statusText);
  }
  return response;
}

const configFilePath = './config.json';
const prevIssuesFilePath = './previous-issues.json';
let config;
let prevIssues = [];

console.log('\nStarting up at', (new Date()).toUTCString());

try {
  const configFile = fs.readFileSync(configFilePath).toString();
  config = JSON.parse(configFile);

  if (config.iftttUrl.includes('abc-123-def-456')) {
    console.log(`It looks like you havent filled in the iftttUrl value in ${configFilePath} correctly.\nCheck the readme for more details`);
    process.exit(1);
  }
} catch (err) {
  console.error(err.stack);
  console.log(`Could not read config file at ${configFilePath}.\nCopy ./config.sample.json and fill in the details.`);
  process.exit(1);
}

try {
  const prevIssuesFile = fs.readFileSync(prevIssuesFilePath).toString();
  prevIssues = JSON.parse(prevIssuesFile);
} catch (err) {
  if (err.code !== 'ENOENT') console.error(err);
  console.log(`Could not read previous issues file at ${prevIssuesFilePath}. Creating a new one.`);
}

console.log(`There are ${prevIssues.length} previous issues.`);

const query = querystring.stringify( _.extend({ per_page: 100 }, config.issueFilter || {}) );

const githubUrl = `https://api.github.com/repos/${config.repo}/issues?${query}`;
let allIssues; // need to hoist this up here so we can access it later on

fetch(githubUrl)
  .then(checkResponse)
  .then(res => res.json())
  .then((issues) => {
    allIssues = _.map(issues, 'id').map(String);
    const newIssues = _.difference(allIssues, prevIssues);

    console.log(`There are ${allIssues.length} issues from GitHub.`);
    console.log(`There are ${newIssues.length} new issues.`);

    if (newIssues.length === 0) {
      return Promise.reject(null); // return a null error just to quickly exit
    }

    const firstNewIssue = _.find(issues, (issue) => issue.id.toString() === newIssues[0]);

    const msg = newIssues.length === 1
      ? `A new ${config.issueDescription} has been posted on ${config.repo}: "${firstNewIssue.title}"`
      : `${newIssues.length} new ${config.issueDescription}s have been posted on ${config.repo}`;

    console.log(`Posting to IFTTT: ${msg}`);

    return fetch(config.iftttUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value1: msg }),
    })
  })
  .then(checkResponse)
  .then(res => res.text())
  .then((body) => {
    console.log(body);

    const newIssuesToSave = prevIssues.concat(allIssues);

    fs.writeFileSync(prevIssuesFilePath, JSON.stringify(allIssues, null, 2));
  })
  .catch((err) => {
    // if (!err) return;

    console.log(err.stack || err);
  });