# Backend Test

This project is a backend API that integrates with the GitHub API to fetch your GitHub activity data and manage issues on your repositories. The API exposes three main endpoints:

- **GET /github**: Fetches your GitHub profile details and a list of your personal repositories.
- **GET /github/{repoName}**: Retrieves detailed information about a specific repository.
- **POST /github/{repoName}/issues**: Creates a new issue in a specified repository with a given title and body.

## Features

- **GitHub Profile & Repositories:**  
  Fetch your user profile information including username, bio, and repository list.
- **Repository Details:**  
  Retrieve comprehensive details of a particular repository.
- **Issue Creation:**  
  Create an issue in any of your repositories by providing a title and body.

## API Endpoints & cURL Examples

### 1. GET /github

```
curl --location --request GET 'http://localhost:3000/github'
```

### 2. GET /github/{repoName}

```
curl --location --request GET 'http://localhost:3000/github/your-repo-name'
```

### 3. POST /github/{repoName}/issues

```
curl --location --request POST 'http://localhost:3000/github/your-repo-name/issues' \
--header 'Content-Type: application/json' \
--data-raw '{
"title": "Issue Title",
"body": "Detailed description of the issue."
}'
```
