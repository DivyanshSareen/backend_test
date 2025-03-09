// index.js
const express = require("express");
const axios = require("axios");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;
const GITHUB_API_BASE = "https://api.github.com";

app.use(express.json());

const HEADERS = {
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
};

function getAuthHeaders() {
  const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
  if (!ACCESS_TOKEN) {
    throw new Error("ACCESS_TOKEN is not set");
  }
  return { ...HEADERS, Authorization: `Bearer ${ACCESS_TOKEN}` };
}

/**
 * Endpoint: GET /github
 * - Fetches user profile data and personal repositories concurrently.
 * - Response structure includes:
 *    - profile: Basic user info (login, name, bio, etc.)
 *    - followersCount and followingCount from the profile.
 *    - personalRepositories: Array of repository objects with key details.
 */
app.get("/github", async (req, res) => {
  try {
    const authHeaders = getAuthHeaders();

    // Fetch user profile and repositories concurrently
    const [userResponse, reposResponse] = await Promise.all([
      axios.get(`${GITHUB_API_BASE}/user`, { headers: authHeaders }),
      axios.get(`${GITHUB_API_BASE}/user/repos`, {
        headers: authHeaders,
        params: { affiliation: "owner" },
      }),
    ]);

    const userData = userResponse.data;
    const reposData = reposResponse.data;

    // Construct a clean response structure
    const responseData = {
      profile: {
        login: userData.login,
        id: userData.id,
        name: userData.name,
        bio: userData.bio,
        avatar_url: userData.avatar_url,
        html_url: userData.html_url,
        location: userData.location,
        company: userData.company,
        blog: userData.blog,
        created_at: userData.created_at,
        updated_at: userData.updated_at,
      },
      followersCount: userData.followers,
      followingCount: userData.following,
      personalRepositories: reposData.map((repo) => ({
        id: repo.id,
        name: repo.name,
        full_name: repo.full_name,
        html_url: repo.html_url,
        description: repo.description,
        private: repo.private,
        fork: repo.fork,
        created_at: repo.created_at,
        updated_at: repo.updated_at,
        pushed_at: repo.pushed_at,
        language: repo.language,
        forks_count: repo.forks_count,
        stargazers_count: repo.stargazers_count,
        watchers_count: repo.watchers_count,
        open_issues_count: repo.open_issues_count,
      })),
    };

    res.json(responseData);
  } catch (error) {
    console.error("Error fetching GitHub data:", error.message);
    res.status(500).json({ error: "Failed to fetch data from GitHub API" });
  }
});

/**
 * Endpoint: GET /github/:repoName
 * - Fetches details for a particular repository.
 * - First, it retrieves the user info to get the GitHub username (owner).
 * - Then, it calls the GitHub API to fetch the repository details.
 */
app.get("/github/:repoName", async (req, res) => {
  try {
    const { repoName } = req.params;
    const authHeaders = getAuthHeaders();

    // Retrieve user data to obtain the owner (username)
    const userResponse = await axios.get(`${GITHUB_API_BASE}/user`, {
      headers: authHeaders,
    });
    const owner = userResponse.data.login;

    // Fetch repository details using owner and repoName
    const repoResponse = await axios.get(
      `${GITHUB_API_BASE}/repos/${owner}/${repoName}`,
      { headers: authHeaders }
    );
    res.json(repoResponse.data);
  } catch (error) {
    console.error("Error fetching repository data:", error.message);
    res.status(500).json({ error: "Failed to fetch repository data" });
  }
});

/**
 * Endpoint: POST /github/:repoName/issues
 * - Creates a new issue in the specified repository.
 * - Expects a JSON body with `title` and `body` for the issue.
 * - Retrieves the user info to determine the owner, then posts to create the issue.
 * - Returns the created issue's URL in the response.
 */
app.post("/github/:repoName/issues", async (req, res) => {
  try {
    const { repoName } = req.params;
    const { title, body } = req.body;

    // Validate input: both title and body are required
    if (!title || !body) {
      return res
        .status(400)
        .json({ error: "Both title and body are required" });
    }

    const authHeaders = getAuthHeaders();

    // Retrieve user info to get the owner
    const userResponse = await axios.get(`${GITHUB_API_BASE}/user`, {
      headers: authHeaders,
    });
    const owner = userResponse.data.login;

    // Create a new issue using the GitHub API
    const issueResponse = await axios.post(
      `${GITHUB_API_BASE}/repos/${owner}/${repoName}/issues`,
      { title, body },
      { headers: authHeaders }
    );

    // Return the URL of the created issue
    res.json({ issue_url: issueResponse.data.html_url });
  } catch (error) {
    console.error("Error creating issue:", error.message);
    res.status(500).json({ error: "Failed to create issue on GitHub" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
