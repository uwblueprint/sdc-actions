import * as core from "@actions/core";
import { context, getOctokit } from "@actions/github";


const run = async () => {
  try {
    // Create GitHub client with the API token.
    const octokit = getOctokit(core.getInput("token", { required: true }));

  } catch (e) {
    core.setFailed(e.message);
  }
};

run();
