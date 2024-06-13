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

    spyOn(axios, "get").and.callFake((url, _config) => {
      if (url.includes("pulls")) {
        return Promise.resolve({
          status: 200,
          data: unformattedData,
          headers: {
            link: '<https://api.github.com/resource?page=2>; rel=null',
          },
        });
      }
      return Promise.resolve({ status: 200 });
    });

    spyOn(axios, "head").and.returnValue(Promise.resolve({ status: 200 }));
    result = await getPullRequests(pullRequest);
  });

  it("should make GitHub API call with correct arguments and URL", async () => {
    expect(axios.get).toHaveBeenCalled();
    const calls = axios.get.calls.all();
    calls.forEach(call => {
      const [url] = call.args;
      if (url.includes("/pulls")) {
        const expectedUrl = githubApiUrls.pullRequests(pullRequest.owner, pullRequest.repo, 100, 1);
        expect(url).toEqual(expectedUrl);
      }
    });
  });

  it("should return the pull requests within the given range in the correct format.", () => {
    expect(result[0]).toEqual(formattedData[0]);
  });
});
