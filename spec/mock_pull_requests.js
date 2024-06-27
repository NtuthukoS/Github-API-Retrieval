const { errorMessages } = require("../src/helper_objects");

const unformattedData = [
  {
    id: 1,
    user: { login: "user1" },
    title: "Fix bug",
    state: "open",
    created_at: "2024-02-03T12:34:56Z",
    updated_at: "2024-02-04T13:34:56Z",
    closed_at: null,
    merged_at: null,
  },
];

const formattedData = [
  {
    id: 1,
    user: "user1",
    title: "Fix bug",
    state: "open",
    created_at: "2024-02-03",
  },
];

const errorResponse = {
  response: {
    status: 404,
    data: {
      message: "Not Found",
    },
  },
};

const ownerNotFoundError = {
  response: {
    status: 404,
    data: {
      message: errorMessages.ownerNotFound("Umuzi-org"),
    },
  },
};

const repoNotFoundError = {
  response: {
    status: 404,
    data: {
      message: errorMessages.repoNotFound("Umuzi-org", "non-existent-repo"),
    },
  },
};

module.exports = { unformattedData, formattedData, errorResponse, ownerNotFoundError, repoNotFoundError };
