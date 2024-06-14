const { getPullRequests } = require("../src/consume_github_api");
const { githubApiUrls } = require("../src/helper_objects");
const { formattedData, unformattedData } = require("./mock_pull_requests.js");
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
      console.log('URL:', url);
      console.log('Expected URL:', expectedUrl);
      console.log('Config:', config);
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
});
