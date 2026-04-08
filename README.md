# GitHub Health Monitor Badge

A simple, dynamic, serverless badge that shows the open-source health status of any GitHub repository in real time. It calculates how old the repository is, its total commits, and the average time between commits to give a quick health snapshot.

## How to use

You can embed the badge into any `README.md` file using standard Markdown syntax.

**Example:**
To show the badge for your repo, simply replace the `owner/repo` paths with your own GitHub username and repository name. For example, for `ffmpeg/ffmpeg`:

```markdown
[![FFmpeg Health](https://oss-health-monitor.vercel.app/api/badge/ffmpeg/ffmpeg)](https://github.com/volotat/OSS-Health-Monitor)
```

**Output:**

[![FFmpeg Health](https://oss-health-monitor.vercel.app/api/badge/ffmpeg/ffmpeg?v=2)](https://github.com/volotat/OSS-Health-Monitor)

## How to Deploy Your Own Instance (100% Free)

This service uses **Vercel Serverless Functions**. It is completely free to host and uses Vercel's global CDN caching to prevent hitting GitHub API rate limits.

1. **Fork or clone** this repository to your GitHub account.
2. Go to [Vercel](https://vercel.com/) and click **Add New Project**.
3. Import your repository.
4. In the Vercel deployment screen, expand **Environment Variables** (or go to **Settings -> Environment Variables** if already deployed), and set:
   - Name: `GITHUB_TOKEN`
   - Value: A Personal Access Token from your GitHub Settings (only `public_repo` permissions needed).
   > **Note:** While it works without a token temporarily, GitHub limits unauthenticated requests to 60 per hour. Setting this token increases your limit to 5,000 per hour, preventing the badge from breaking!
5. Click **Deploy**.

Vercel will give you a free `{project-name}.vercel.app` domain. Use that domain in your markdown links!

## License
MIT
