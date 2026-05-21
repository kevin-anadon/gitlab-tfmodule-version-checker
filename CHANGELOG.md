# Changelog

## [1.0.0] - 2025-05-21

### Added
- First stable release
- Inline diagnostics for outdated Terraform modules
- First-use setup flow: prompts for GitLab URL and Personal Access Token
- `checkVersions` command to validate module versions against GitLab registry
- `setToken` command to store GitLab token securely via SecretStorage
- `clearToken` command to remove stored token
- `setGitlabUrl` command to configure a custom GitLab instance
- In-memory cache with 5-minute TTL to reduce API calls
- Semantic version comparison using `semver`
- Clickable diagnostic links to GitLab tag pages
- Unit tests for `terraformParser`, `versionService`, `cache`, and `gitlabClient`
