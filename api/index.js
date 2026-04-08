function extractCommitCount(linkHeader) {
  if (!linkHeader) return 1;
  const match = linkHeader.match(/page=(\d+)>; rel="last"/);
  if (match) {
    return parseInt(match[1], 10);
  }
  return 1;
}

function formatAge(ms) {
  const years = Math.floor(ms / (1000 * 60 * 60 * 24 * 365.25));
  const months = Math.floor((ms % (1000 * 60 * 60 * 24 * 365.25)) / (1000 * 60 * 60 * 24 * 30.44));
  if (years > 0) return `${years}y ${months}m`;
  if (months > 0) return `${months} mo`;
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  return `${days} d`;
}

function formatPace(days) {
  if (days >= 1) return `${days.toFixed(1)}d`;
  const hours = days * 24;
  if (hours >= 1) return `${hours.toFixed(1)}h`;
  const mins = hours * 60;
  return `${mins.toFixed(0)}m`;
}

function formatTimeAgo(ms) {
  if (ms < 0) ms = 0;
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  if (days === 0) {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    if (hours === 0) return "now";
    return `${hours}h ago`;
  }
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30.44);
  if (months < 12) return `${months}mo ago`;
  const years = Math.floor(days / 365.25);
  return `${years}y ago`;
}

function shortenNumber(num) {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
  return num.toString();
}

function getHealthColor(paceDays, ageDays) {
  if (ageDays < 7) return "#3fb950"; // new and active
  if (paceDays <= 2) return "#3fb950"; // highly active
  if (paceDays <= 7) return "#58a6ff"; // healthy
  if (paceDays <= 30) return "#d29922"; // slowing down
  return "#f85149"; // stale
}

function generateSvg({ repoName, ageStr, commits, paceStr, lastCommitAgoStr, error }) {
  if (error) {
    return `<svg width="150" height="24" viewBox="0 0 150 24" xmlns="http://www.w3.org/2000/svg">
      <rect width="150" height="24" rx="4" fill="#0d1117" stroke="#f85149" stroke-width="1"/>
      <text x="75" y="16" fill="#f85149" font-family="sans-serif" font-size="11" text-anchor="middle">Error: ${error}</text>
    </svg>`;
  }

  return `<svg width="435" height="24" viewBox="0 0 435 24" xmlns="http://www.w3.org/2000/svg">
    <rect width="435" height="24" rx="4" fill="#0d1117" stroke="#30363d" stroke-width="1"/>
    
    <!-- OSS Health -->
    <text x="40" y="16" fill="#c9d1d9" font-family="sans-serif" font-size="11" font-weight="bold" text-anchor="middle">OSS Health</text>
    <path d="M 80 0 L 80 24" stroke="#30363d" stroke-width="1"/>
    
    <!-- Age -->
    <text x="120" y="16" fill="#8b949e" font-family="sans-serif" font-size="11" text-anchor="middle">Age <tspan fill="#c9d1d9" font-weight="bold">${ageStr}</tspan></text>
    <path d="M 160 0 L 160 24" stroke="#30363d" stroke-width="1"/>
    
    <!-- Commits -->
    <text x="207" y="16" fill="#8b949e" font-family="sans-serif" font-size="11" text-anchor="middle">Commits <tspan fill="#c9d1d9" font-weight="bold">${shortenNumber(commits)}</tspan></text>
    <path d="M 255 0 L 255 24" stroke="#30363d" stroke-width="1"/>
    
    <!-- Pace -->
    <text x="300" y="16" fill="#8b949e" font-family="sans-serif" font-size="11" text-anchor="middle">Pace <tspan fill="#c9d1d9" font-weight="bold">${paceStr}</tspan></text>
    <path d="M 345 0 L 345 24" stroke="#30363d" stroke-width="1"/>
    
    <!-- Last Commit -->
    <text x="390" y="16" fill="#8b949e" font-family="sans-serif" font-size="11" text-anchor="middle">Last <tspan fill="#c9d1d9" font-weight="bold">${lastCommitAgoStr}</tspan></text>
  </svg>`;
}

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'image/svg+xml');
  // Cache at the edge for 1 hour, serve stale up to 1 day while revalidating
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');

  const { owner, repo } = req.query;

  if (!owner || !repo) {
    return res.status(400).send(generateSvg({ error: "Missing owner/repo" }));
  }

  const headers = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'github-health-monitor-badge'
  };

  if (process.env.GITHUB_TOKEN) {
    headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
  }

  try {
    // 1. Fetch Repository Details
    const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });
    if (!repoRes.ok) {
      if (repoRes.status === 404) return res.status(404).send(generateSvg({ error: "Repo not found" }));
      if (repoRes.status === 403) return res.status(403).send(generateSvg({ error: "API Rate Limited" }));
      return res.status(repoRes.status).send(generateSvg({ error: `API Error ${repoRes.status}` }));
    }
    const repoData = await repoRes.json();
    const createdAt = new Date(repoData.created_at);
    
    // 2. Fetch Commits
    const commitsRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/commits?per_page=1`, { headers });
    let commits = 0;
    let lastCommitDate = null;
    
    if (commitsRes.ok) {
      const linkHeader = commitsRes.headers.get('link');
      const body = await commitsRes.json();
      
      if (body.length > 0 && body[0].commit && body[0].commit.committer) {
        lastCommitDate = new Date(body[0].commit.committer.date);
      }
      
      if (linkHeader) {
        commits = extractCommitCount(linkHeader);
      } else {
        commits = body.length || 0;
      }
    } else if (commitsRes.status === 409) {
      // Empty repo
      commits = 0;
    } else {
      return res.status(commitsRes.status).send(generateSvg({ error: "Commits fetch failed" }));
    }

    // 3. Calculate Stats
    const now = new Date();
    const ageMs = now.getTime() - createdAt.getTime();
    const ageStr = formatAge(ageMs);

    let paceDays = 0;
    let lastCommitAgoStr = "N/A";

    if (commits > 0 && lastCommitDate) {
      const devTimeMs = lastCommitDate.getTime() - createdAt.getTime();
      const devTimeDays = Math.max(0, devTimeMs / (1000 * 60 * 60 * 24));
      paceDays = commits > 1 ? devTimeDays / (commits - 1) : devTimeDays;
      
      const lastCommitMs = now.getTime() - lastCommitDate.getTime();
      lastCommitAgoStr = formatTimeAgo(lastCommitMs);
    }
    
    const paceStr = commits > 0 ? formatPace(paceDays) : "N/A";

    const svgString = generateSvg({
      repoName: repoData.name,
      ageStr,
      commits,
      paceStr,
      lastCommitAgoStr
    });

    res.status(200).send(svgString);

  } catch (error) {
    console.error(error);
    res.status(500).send(generateSvg({ error: "Internal Server Error" }));
  }
}
