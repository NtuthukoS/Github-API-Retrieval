const { getPullRequests } = require("../src/consume_github_api");
const { githubApiUrls,errorMessages } = require("../src/helper_objects");
const {
  formattedData,
  unformattedData,
  ownerNotFoundError,
  repoNotFoundError,
  errorResponse
} = require("./mock_pull_requests.js");
const axios = require("axios");
require("dotenv").config();

describe("getPullRequests()", () => {
  let pullRequest, result;
  const dummyToken = 'grahgrahboom';
  process.env.GITHUB_TOKEN = dummyToken;

  beforeEach(async () => {
    pullRequest = {
      owner: "Umuzi-org",
      repo: "ACN-syllabus",
      startDate: "2024-02-03",
      endDate: "2024-02-04",
    };

    spyOn(axios, "get").and.callFake((url, config) => {
      if (url.includes("pulls")) {
        return Promise.resolve({
          status: 200,
          data: unformattedData,
          headers: {
            Authorization: `Bearer ${dummyToken}`,
            link: '<https://api.github.com/resource?page=2>; rel=next',
          },
        });
      }
      return Promise.resolve({ status: 200 });
    });

    spyOn(axios, "head").and.returnValue(Promise.resolve({ status: 200 }));
    result = await getPullRequests(pullRequest);
  });

  it("should make GitHub API call with correct arguments, headers, and URL", async () => {
    expect(axios.get).toHaveBeenCalled();
    const calls = axios.get.calls.all();

    const pullRequestsCalls = calls.filter(call => call.args[0].includes("/pulls"));
    expect(pullRequestsCalls.length).toBeGreaterThan(0);

    pullRequestsCalls.forEach(call => {
      const [url, config] = call.args;
      const expectedUrl = githubApiUrls.pullRequests(pullRequest.owner, pullRequest.repo);
      expect(url).toEqual(expectedUrl);
      expect(config.params).toEqual({
        state: 'all',
        per_page: 100,
        page: 1,
      });
      expect(config.headers).toEqual({
        Accept: "application/vnd.github.v3+json",
      });
    });
  });

  it("should return the pull requests within the given range in the correct format.", () => {
    expect(result[0]).toEqual(formattedData[0]);
  });


  it("should throw an error for a non-existing repository", async () => {
    axios.get.and.callFake((url, config) => {
      if (url.includes("repos")) {
        return Promise.reject(repoNotFoundError);
      }
      return Promise.resolve({ status: 200 });
    });

    try {
      await getPullRequests({
        owner: "Umuzi-org",
        repo: "non-existent-repo",
        startDate: "2024-02-03",
        endDate: "2024-02-04",
      });
    } catch (error) {
      expect(error.message).toBe(
        errorMessages.repoNotFound("Umuzi-org", "non-existent-repo")
      );
    }
  });

  it("should throw an error for a non-existing owner", async () => {
    axios.get.and.callFake((url, config) => {
      if (url.includes("users")) {
        return Promise.reject(ownerNotFoundError);
      }
      return Promise.resolve({ status: 200 });
    });

    try {
      await getPullRequests({
        owner: "non-existent-owner",
        repo: "ACN-syllabus",
        startDate: "2024-02-03",
        endDate: "2024-02-04",
      });
    } catch (error) {
      expect(error.message).toBe(
        errorMessages.ownerNotFound("non-existent-owner")
      );
    }
  });

});
