import * as core from "@actions/core";
import { context, getOctokit } from "@actions/github";

interface Review {
  [key: string]: string[];
}

const parseCommaList = (list: string) => list.split(",").filter((val) => val !== "");
const run = async () => {
  try {
    // Create GitHub client with the API token.
    const octokit = getOctokit(core.getInput("token", { required: true }));
    const { owner, repo } = context.repo;

    // inputs
    const head = core.getInput("source_branch", { required: true });
    const base = core.getInput("destination_branch", { required: true });
    const title = core.getInput("title");
    const body = core.getInput("body");
    const labels = parseCommaList(core.getInput("labels"));
    const assignees = parseCommaList(core.getInput("assignees"));
    const reviewers = parseCommaList(core.getInput("reviewers"));
    const teamReviewers = parseCommaList(core.getInput("teamReviewers"));
    const draft = core.getInput("draft") === "true";

    // if pr already exists, we silently fail (last catch block)
    const createPullRequestResponse = await octokit.rest.pulls.create({
      owner,
      repo,
      head,
      base,
      title,
      body,
      draft,
    });

    if (assignees.length > 0) {
      core.info(`Applying assignees ${assignees}`);
      await octokit.rest.issues.addAssignees({
        owner,
        repo,
        assignees,
        issue_number: createPullRequestResponse.data.number,
      });
    }

    if (labels.length > 0) {
      core.info(`Applying labels ${labels}`);
      await octokit.rest.issues.addLabels({
        owner,
        repo,
        issue_number: createPullRequestResponse.data.number,
        labels,
      });
    }

    const review: Review = {};
    if (reviewers.length > 0) {
      core.info(`Requesting reviewers ${reviewers}`);
      review.reviewers = reviewers;
    }

    if (teamReviewers.length > 0) {
      core.info(`Requesting team reviewers ${teamReviewers}`);
      review.team_reviewers = teamReviewers;
    }

    if (Object.keys(review).length > 0) {
      octokit.rest.pulls.requestReviewers({
        owner,
        repo,
        pull_number: createPullRequestResponse.data.number,
        ...review,
      });
    }

    core.setOutput("url", createPullRequestResponse.data.url);
    core.setOutput("number", createPullRequestResponse.data.number);
  } catch (e) {
    if (e.message.toLowerCase().includes("pull request already exists")) {
      core.info("Pull request already exists");
    } else {
      core.setFailed(e.message);
    }
  }
};

run();
