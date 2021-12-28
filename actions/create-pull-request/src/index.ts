import * as core from "@actions/core";
import { context, getOctokit } from "@actions/github";

const parseCommaList = (list: string) => list.split(",").filter((val) => val !== "");
const run = async () => {
  try {
    // Create GitHub client with the API token.
    const octokit = getOctokit(core.getInput("token", { required: true }));

    // inputs
    const sourceBranch = core.getInput("source_branch", { required: true });
    const destinationBranch = core.getInput("destination_branch", { required: true });
    const title = core.getInput("title");
    const body = core.getInput("body");
    const assignees = parseCommaList(core.getInput("assignees"));
    const reviewers = parseCommaList(core.getInput("reviewers"));
    const teamReviewers = parseCommaList(core.getInput("teamReviewers"));
    const draft = core.getInput("draft") === "true";

    let createPullRequestResponse;
    try {
      createPullRequestResponse = await octokit.rest.pulls.create({
        owner: context.repo.owner,
        repo: context.repo.repo,
        head: sourceBranch,
        base: destinationBranch,
        title,
        body,
        draft,
      });
    } catch (e) {
      if (e.message.toLowerCase().includes("pull request already exists")) {
        core.info("Pull request already exists");
      } else {
        core.setFailed(e.message);
      }
    }
    core.info(assignees.length.toString());
    core.info(assignees.toString());
    // if (assignees.length > 0) {
    //   core.info(assignees.toString());
    // }

    // if (reviewers.length > 0) {
    //   core.info(reviewers.toString());
    // }

    // if (teamReviewers.length > 0) {
    //   core.info(teamReviewers.toString());
    // }

    core.setOutput("url", createPullRequestResponse?.data.url);
    core.setOutput("id", createPullRequestResponse?.data.id);
  } catch (e) {
    core.setFailed(e.message);
  }
};

run();
