import * as core from "@actions/core";
import fs from "fs";

interface Package {
  [key: string]: any;
}

const run = async () => {
  try {
    // Create GitHub client with the API token.
    const path: string = core.getInput("path", { required: true });
    const pkg: Package = JSON.parse(fs.readFileSync(path, "utf-8"));
    const { version } = pkg;

    core.setOutput("version", version);
  } catch (e) {
    core.setFailed(e.message);
  }
};

run();
