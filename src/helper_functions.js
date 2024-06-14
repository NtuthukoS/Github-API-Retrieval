require("dotenv").config();
const axios = require("axios");
const {
  errorMessages,
  githubApiUrls,
  githubContentType,
} = require("./helper_objects.js");

async function validateDateFormat(dateString) {
  return new Promise((resolve, reject) => {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dateString)) {
      reject(new Error(errorMessages.invalidDateFormat));
    } else {
      resolve();
    }
  });
}

async function validateDateRange(startDate, endDate) {
  await validateDateFormat(startDate);
  await validateDateFormat(endDate);

  const initialDate = new Date(startDate);
  const finalDate = new Date(endDate);
  if (isNaN(initialDate.getTime()) || isNaN(finalDate.getTime())) {
    throw new Error(errorMessages.invalidDate);
  }
  if (finalDate < initialDate) {
    throw new Error(errorMessages.startLessDateEnd);
  }
}
async function verifyUser(owner, apiToken) {
  if (!owner) {
    throw new Error(errorMessages.emptyOwner());
  }

  try {
    await axios.get(githubApiUrls.user(owner), {
      headers: {
        Accept: githubContentType.v3Json,
        ...(apiToken && { Authorization: `Bearer ${apiToken}` }),
      },
    });
  } catch (error) {
    if (error.response && error.response.status === 404) {
      throw new Error(errorMessages.ownerNotFound(owner));
    }
    throw new Error(`Failed to verify user '${owner}': ${error.message}`);
  }
}

async function verifyRepository(owner, repo, apiToken) {
  if (!repo) {
    throw new Error(errorMessages.emptyRepo());
  }

  try {
    await axios.get(githubApiUrls.repo(owner, repo), {
      headers: {
        Accept: githubContentType.v3Json,
        ...(apiToken && { Authorization: `Bearer ${apiToken}` }),
      },
    });
  } catch (error) {
    if (error.response && error.response.status === 404) {
      throw new Error(errorMessages.repoNotFound(owner, repo));
    }
    throw new Error(`Failed to verify repository '${owner}/${repo}': ${error.message}`);
  }
}
async function fetchPullRequests(owner, repo, page, perPage, apiToken) {
  const apiUrl = githubApiUrls.pullRequests(owner, repo);

  const response = await axios.get(apiUrl, {
    params: {
      state: "all",
      per_page: perPage,
      page,
    },
    headers: {
      Accept: githubContentType.v3Json,
      ...(apiToken && { Authorization: `Bearer ${apiToken}` }),
    },
  });

  return response;
}

async function handleRequestError(error, retryFunction) {
  if (error.response && error.response.status === 403) {
    const remainingRequests = parseInt(
      error.response.headers["x-ratelimit-remaining"]
    );
    const resetTime = new Date(
      parseInt(error.response.headers["x-ratelimit-reset"]) * 1000
    );

    if (remainingRequests <= 0) {
      const timeToWait = resetTime.getTime() - Date.now() + 1000;
      await new Promise((resolve) => setTimeout(resolve, timeToWait));

      return retryFunction();
    }
  }
  throw error;
}

async function filterAndFormatPullRequests(pullRequests, startDate, endDate) {
  const initialDate = new Date(startDate);
  const finalDate = new Date(endDate);
  finalDate.setHours(23, 59, 59, 999);

  return pullRequests
    .filter((pr) => {
      const createdAt = new Date(pr.created_at);
      const updatedAt = pr.updated_at ? new Date(pr.updated_at) : null;
      const closedAt = pr.closed_at ? new Date(pr.closed_at) : null;
      const mergedAt = pr.merged_at ? new Date(pr.merged_at) : null;

      return (
        (createdAt >= initialDate && createdAt <= finalDate) ||
        (updatedAt && updatedAt >= initialDate && updatedAt <= finalDate) ||
        (closedAt && closedAt >= initialDate && closedAt <= finalDate) ||
        (mergedAt && mergedAt >= initialDate && mergedAt <= finalDate)
      );
    })
    .map((pr) => ({
      id: pr.id,
      user: pr.user.login,
      title: pr.title,
      state: pr.state,
      created_at: pr.created_at.slice(0, 10),
    }));
}

module.exports = {
  validateDateFormat,
  validateDateRange,
  verifyUser,
  verifyRepository,
  fetchPullRequests,
  handleRequestError,
  filterAndFormatPullRequests,
};
