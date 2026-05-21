import semver from "semver";

export function isOutdated(current: string, latest: string): boolean {
  if (!semver.valid(current) || !semver.valid(latest)) {
    return false;
  }

  return semver.lt(current, latest);
}