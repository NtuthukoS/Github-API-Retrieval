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

module.exports = { unformattedData, formattedData };
