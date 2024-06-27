const {
  verifyUser,
  verifyRepository,
  fetchPullRequests,
  validateDateRange,
  handleRequestError,
  filterAndFormatPullRequests,
} = require("./helper_functions");
const { token } = require("./github_token");

async function getPullRequests({ owner, repo, startDate, endDate }) {
  try {
    await validateDateRange(startDate, endDate);
    await verifyUser(owner, token);
    await verifyRepository(owner, repo, token);

    const perPage = 100;
    let allPullRequests = [];
    let page = 1;
    let hasNextPage = true;

    while (hasNextPage) {
      const pullRequests = await fetchPullRequests(
        owner,
        repo,
        page,
        perPage,
        token
      );
      allPullRequests = allPullRequests.concat(pullRequests.data);

      const linkHeader = pullRequests.headers.link;
      hasNextPage = linkHeader && linkHeader.includes('rel="next"');
      page++;
    }

    const formattedPullRequests = await filterAndFormatPullRequests(
      allPullRequests,
      startDate,
      endDate
    );

    return formattedPullRequests;
  } catch (error) {
    await handleRequestError(error, () =>
      fetchPullRequests(owner, repo, page, perPage, token)
    );
  }
}

module.exports = { getPullRequests };
