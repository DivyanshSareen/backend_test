// routes/github.js
const express = require("express");
const axios = require("axios");
const router = express.Router();
const authMiddleware = require("../middleware/auth");

const GITHUB_API_BASE = "https://api.github.com";

// Apply auth middleware to all routes in this router
router.use(authMiddleware);

/**
 * GET /github
 * Fetches GitHub profile details and personal repositories.
 */
router.get("/", async (req, res) => {
  console.log("Received request for GET /github");
  try {
    // Fetch user profile and repositories concurrently using the attached auth headers
    console.log("Fetching GitHub profile and personal repositories...");
    const [userResponse, reposResponse] = await Promise.all([
      axios.get(`${GITHUB_API_BASE}/user`, { headers: req.authHeaders }),
      axios.get(`${GITHUB_API_BASE}/user/repos`, {
        headers: req.authHeaders,
        params: { affiliation: "owner" },
      }),
    ]);

    console.log("GitHub profile and repositories fetched successfully.");
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

    console.log("Response constructed successfully. Sending response.");
    res.json(responseData);
  } catch (error) {
    console.error("Error fetching GitHub data:", error.message);
    res.status(500).json({ error: "Failed to fetch data from GitHub API" });
  }
});

/**
 * GET /github/:repoName
 * Fetches details for a specific repository.
 */
router.get("/:repoName", async (req, res) => {
  const { repoName } = req.params;
  console.log(`Received request for GET /github/${repoName}`);
  try {
    // Retrieve user data to obtain the owner (username)
    console.log("Fetching GitHub profile to get owner details...");
    const userResponse = await axios.get(`${GITHUB_API_BASE}/user`, {
      headers: req.authHeaders,
    });
    const owner = userResponse.data.login;
    console.log(
      `Owner determined as ${owner}. Fetching details for repository: ${repoName}`
    );

    // Fetch repository details using owner and repoName
    const repoResponse = await axios.get(
      `${GITHUB_API_BASE}/repos/${owner}/${repoName}`,
      { headers: req.authHeaders }
    );
    console.log("Repository data fetched successfully.");
    res.json(repoResponse.data);
  } catch (error) {
    console.error("Error fetching repository data:", error.message);
    res.status(500).json({ error: "Failed to fetch repository data" });
  }
});

/**
 * POST /github/:repoName/issues
 * Creates a new issue in the specified repository.
 * Expects a JSON body with 'title' and 'body'.
 */
router.post("/:repoName/issues", async (req, res) => {
  const { repoName } = req.params;
  const { title, body } = req.body;
  console.log(
    `Received request for POST /github/${repoName}/issues with title: "${title}"`
  );

  if (!title || !body) {
    console.error("Validation error: Both title and body are required.");
    return res.status(400).json({ error: "Both title and body are required" });
  }

  try {
    // Retrieve user info to get the owner
    console.log(
      "Fetching GitHub profile to determine owner for issue creation..."
    );
    const userResponse = await axios.get(`${GITHUB_API_BASE}/user`, {
      headers: req.authHeaders,
    });
    const owner = userResponse.data.login;
    console.log(
      `Owner determined as ${owner}. Creating issue in repository: ${repoName}`
    );

    // Create a new issue using the GitHub API
    const issueResponse = await axios.post(
      `${GITHUB_API_BASE}/repos/${owner}/${repoName}/issues`,
      { title, body },
      { headers: req.authHeaders }
    );
    console.log(`Issue created successfully at ${issueResponse.data.html_url}`);

    // Return the URL of the created issue
    res.json({ issue_url: issueResponse.data.html_url });
  } catch (error) {
    console.error("Error creating issue:", error.message);
    res.status(500).json({ error: "Failed to create issue on GitHub" });
  }
});

module.exports = router;
