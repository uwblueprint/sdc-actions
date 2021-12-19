import * as core from "@actions/core";
import { context, getOctokit } from "@actions/github";
import semver from "semver";

const isSemVer = (person: semver.SemVer | null): person is semver.SemVer => person !== null;

function filterSemVer(persons: Array<semver.SemVer | null>): Array<semver.SemVer> {
  return persons.filter(isSemVer);
}

const run = async () => {
  try {
    // Create GitHub client with the API token.
    const octokit = getOctokit(core.getInput("token", { required: true }));
    const bump = core.getInput("bump", { required: true });
    const response = await octokit.rest.repos.listTags({
      owner: context.repo.owner,
      repo: context.repo.repo,
    });

    if (response.status !== 200) {
      core.setFailed(
        `The GitHub API for listing tags for this repo on a ${context.eventName} 
        event returned ${response.status}, expected 200`,
      );
    }

    const tagsArray = response.data;
    const tags = tagsArray
      .map((tag) => tag.name)
      .map((tagName) => semver.clean(tagName))
      .map((version) => semver.parse(version, { loose: true }));

    // would rather have a .filter after above like .filter((version) => version !== null) but typescript doesn't understand this
    // so we have to create a typeguard I believe https://stackoverflow.com/questions/64480140/typescript-filter-showing-error-is-not-assignable-to-type
    const versions = filterSemVer(tags).sort(semver.rcompare);
    core.info(`Versions: ${versions}`);
    const latestVersion = versions[0] || semver.parse("0.0.0");
    const newVersion = semver.inc(latestVersion, bump as semver.ReleaseType);
    if (newVersion === null) {
      core.setFailed(
        `Incremeting latest version ${latestVersion} by ${bump} failed. Check if latest version is correct and bump is valid. Otherwise there is likely an error with the semver package`,
      );
    }
    core.info(`New Version: ${newVersion}`);
    core.setOutput("version", newVersion);
  } catch (e) {
    core.setFailed(e.message);
  }
};

run();
