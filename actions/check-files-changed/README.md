# `check-files-changed`

This action lists changed files by comparing commit to target branch and returns a string Boolean if a changed file matches an input regex

## Input

| Name     | Description                 | Type     | Required |
| -------- | --------------------------- | -------- | -------- |
| `branch` | Target branch to compare to | `string` | `true`   |
| `regex`  | Regex to compare to         | `string` | `true`   |

## Output

| Name      | Description                                                          | Type     |
| --------- | ---------------------------------------------------------------------| -------- |
| `changed` | String boolean (`true`/`false`) if a changed files matches the regex | `string` |

## Example Workflow File

```yaml
name: check-files-changed

on: [pull_request]

jobs:
  job1:
    runs-on: ubuntu-latest
    steps:
      - name: Check files changed
        id: changed-terraform
        uses: uwblueprint/sdc-actions/actions/check-files-changed@main
        with:
          branch: $GITHUB_BASE_REF
          expression: "terraform/*"

      - name: Terraform changed
        if: steps.changed-terraform.outputs.changed == 'true'
        run: echo terraform files changed
```
