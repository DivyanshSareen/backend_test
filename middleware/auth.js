function authMiddleware(req, res, next) {
  const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
  if (!ACCESS_TOKEN) {
    console.error("ACCESS_TOKEN is not set in environment variables.");
    return res.status(500).json({ error: "ACCESS_TOKEN is not set" });
  }

  req.authHeaders = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    Authorization: `Bearer ${ACCESS_TOKEN}`,
  };

  console.log("Authentication headers attached to request.");
  next();
}

module.exports = authMiddleware;
