# GitHub Health Monitor Badge

A simple, dynamic, serverless badge that shows the open-source health status of any GitHub repository in real time. It calculates how old the repository is, its total commits, and the average time between commits to give a quick health snapshot.

## How to use

You can embed the badge into any `README.md` file using standard Markdown syntax.

**Examples:**
To show the health status for repository like `ffmpeg/ffmpeg` place the markdown images on the same line:

```markdown
![FFmpeg Health](https://osshealthmonitor.vercel.app/api/badge/ffmpeg/ffmpeg)
```

**Output:**

![FFmpeg Health](https://osshealthmonitor.vercel.app/api/badge/ffmpeg/ffmpeg)

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
