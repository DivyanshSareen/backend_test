// index.js
const express = require("express");
const axios = require("axios");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;
const GITHUB_API_BASE = "https://api.github.com";
const HEADERS = {
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
};

app.get("/github", async (req, res) => {
  try {
    const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
    if (!ACCESS_TOKEN) {
      return res.status(500).json({ error: "ACCESS_TOKEN is not set" });
    }

    // Set the authorization header once
    const authHeaders = { ...HEADERS, Authorization: `Bearer ${ACCESS_TOKEN}` };

    // Fetch both user and repository data concurrently
    const [userResponse, reposResponse] = await Promise.all([
      axios.get(`${GITHUB_API_BASE}/user`, { headers: authHeaders }),
      axios.get(`${GITHUB_API_BASE}/user/repos`, {
        headers: authHeaders,
        params: { affiliation: "owner" },
      }),
    ]);

    const userData = userResponse.data;
    const reposData = reposResponse.data;

    // Cleanly structure the response
    const profile = {
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
    };

    const personalRepositories = reposData.map((repo) => ({
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
    }));

    const responseData = {
      profile,
      followersCount: userData.followers,
      followingCount: userData.following,
      personalRepositories,
    };

    res.json(responseData);
  } catch (error) {
    console.error("Error fetching GitHub data:", error.message);
    res.status(500).json({ error: "Failed to fetch data from GitHub API" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
