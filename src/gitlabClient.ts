import semver from "semver";

interface TerraformLatestResponse {
  version: string;
  versions: string[];
  source: string;
}

export async function getLatestTerraformVersion(
  gitlabUrl: string,
  source: string,
  token: string
): Promise<{ version: string; projectUrl: string } | null> {

  let cleaned = source.replace(/^https?:\/\//, "");
  const parts = cleaned.split("/");

  // hostname/group/module/system
  parts.shift();

  if (parts.length < 3) {
    console.error("Invalid Terraform module source:", source);
    return null;
  }

  const namespace = parts[0];
  const module = parts[1];
  const system = parts[2];

  const url =
    `${gitlabUrl}/api/v4/packages/terraform/modules/v1/${namespace}/${module}/${system}`;

  console.log("Registry URL:", url);

  const response = await fetch(url, {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  if (!response.ok) {
    console.error("Terraform registry API error:", response.status);
    return null;
  }

  const data: TerraformLatestResponse = await response.json();

  if (!data.version || !data.source) {
   return null;
  }
   
  return {
    version: data.version.replace(/^v/, ""),
    projectUrl: data.source
  };
}