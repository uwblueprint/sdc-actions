import * as core from "@actions/core";
import { context, getOctokit } from "@actions/github";

const run = async () => {
  try {
    // Create GitHub client with the API token.
    const octokit = getOctokit(core.getInput("token", { required: true }));

    // inputs
    const sourceBranch = core.getInput("source_branch", { required: true });
    const destinationBranch = core.getInput("destination_branch", { required: true });
    const title = core.getInput("title");
    const body = core.getInput("body");
    const assignees = core.getInput("assignees");
    const reviewers = core.getInput("reviewers");
    const teamReviewers = core.getInput("teamReviewers");
    const draft = core.getInput("draft") === "true";

    const createPullRequestResponse = await octokit.rest.pulls.create({
      owner: context.repo.owner,
      repo: context.repo.repo,
      head: sourceBranch,
      base: destinationBranch,
      title,
      body,
      draft,
    });

    if (assignees.length) {
      core.info(assignees);
    }

    if (reviewers) {
      core.info(reviewers);
    }

    if (teamReviewers) {
      core.info(teamReviewers);
    }

    core.setOutput("url", createPullRequestResponse.data.url);
    core.setOutput("id", createPullRequestResponse.data.id);
  } catch (e) {
    core.setFailed(e.message);
  }
};

run();
