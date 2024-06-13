const errorMessages = {
  ownerNotFound: (owner) => `Repository owner ${owner} not found.`,
  repoNotFound: (owner, repo) =>
    `Repository ${repo} not found under owner ${owner}.`,
  message: "not found",
  emptyOwner: () => `Owner name cannot be empty.`,
  emptyRepo: () => `Repository name cannot be empty.`,
  invalidDateFormat: "Date format must be YYYY-MM-DD.",
  emptyOwnerOrRepo: "Owner and repo cannot be empty.",
  invalidDate: "Invalid date format.",
  startLessDateEnd: "End date cannot be before start date.",
};

const githubApiUrls = {
  user: (owner) => `https://api.github.com/users/${owner}`,
  repo: (owner, repo) => `https://api.github.com/repos/${owner}/${repo}`,
  pullRequests: (owner, repo) =>
    `https://api.github.com/repos/${owner}/${repo}/pulls?state=all`,
};

const githubContentType = {
  v3Json: "application/vnd.github.v3+json",
};

module.exports = { errorMessages, githubApiUrls, githubContentType };
