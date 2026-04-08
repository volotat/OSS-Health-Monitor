# GitHub Health Monitor Badge

A simple, dynamic, and 100% free serverless badge that shows the open-source health status of any GitHub repository in real time. It calculates how old the repository is, its total commits, and the average time between commits to give a quick health snapshot.

## How to use

You can embed the badge into any `README.md` file using standard Markdown syntax.

**Examples:**
To show the health status for repositories like `ffmpeg/ffmpeg` and `torvalds/linux` side-by-side, place the markdown images on the same line:

```markdown
![FFmpeg Health](https://osshealthmonitor.vercel.app/api/badge/ffmpeg/ffmpeg) ![Linux Health](https://osshealthmonitor.vercel.app/api/badge/torvalds/linux)
```

**Output:**

![FFmpeg Health](https://osshealthmonitor.vercel.app/api/badge/ffmpeg/ffmpeg) ![Linux Health](https://osshealthmonitor.vercel.app/api/badge/torvalds/linux)

## How to Deploy Your Own Instance (100% Free)

This service uses **Vercel Serverless Functions**. It is completely free to host and uses Vercel's global CDN caching to prevent hitting GitHub API rate limits.

1. **Fork or clone** this repository to your GitHub account.
2. Go to [Vercel](https://vercel.com/) and click **Add New Project**.
3. Import your repository.
4. Set the following Environment Variable in Vercel before deploying:
   - `GITHUB_TOKEN`: A Personal Access Token from your GitHub Settings (only `public_repo` permissions needed).
5. Click **Deploy**.

Vercel will give you a free `{project-name}.vercel.app` domain. Use that domain in your markdown links!

## License
MIT
