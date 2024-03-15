const { GITHUB_PAT, NETLIFY_PAT, SITE_ID } = process.env;
import fetch from "node-fetch";
import { Octokit } from "@octokit/core";
const octokit = new Octokit({ auth: GITHUB_PAT });

exports.handler = async (event, context) => {
  // Only allow POST
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const userResponse = await fetch("https://api.netlify.com/api/v1/user", {
    method: "get",
    headers: {
      "Content-Type": "application/json",
      // "User-Agent": "MyApp (YOUR_NAME@EXAMPLE.COM)",
      // 'Authorization': 'Bearer ' + "QX27v2jCdNZlAamPQaru1u0JjDF440uF-EgWUlnlBlA"
      Authorization: "Bearer " + NETLIFY_PAT,
      // 'Authorization': 'Bearer ' + "Zr20wX4I6jleYD61COTHLvZWdCfjFxQy8-NyVTnIFBk"
      // 'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
  const data = await userResponse.json();

  const siteResponse = await fetch(
    `https://api.netlify.com/api/v1/sites/${SITE_ID}`,
    {
      method: "get",
      headers: {
        "Content-Type": "application/json",
        // "User-Agent": "MyApp (YOUR_NAME@EXAMPLE.COM)",
        Authorization: "Bearer " + NETLIFY_PAT,
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
    },
  );

  const siteData = await siteResponse.json();
  const githubRepo = siteData.build_settings.repo_path.split(
    `${data.slug}/`,
  )[1];

  // Authorized
  const base64newSettings = Buffer.from(event.body).toString("base64");
  const originalFile = await octokit.request(
    "GET /repos/{owner}/{repo}/contents/{path}",
    {
      owner: data.slug,
      repo: githubRepo,
      path: "site-settings.json",
      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
      },
    },
  );

  const originalFileSHA = originalFile.data.sha;

  // update file with new data
  await octokit.request("PUT /repos/{owner}/{repo}/contents/{path}", {
    owner: data.slug,
    repo: githubRepo,
    path: "site-settings.json",
    message: `updates settings - ${Date.now()}`,
    committer: {
      name: "updated from admin dashboard",
      email: data.email,
    },
    content: base64newSettings,
    sha: originalFileSHA,
    headers: {
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });

  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*", // Allow from anywhere
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Methods": "*",
    },
    body: JSON.stringify({ data, originalFile }),
  };
};
