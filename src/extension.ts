import * as vscode from "vscode";
import { extractModules } from "./terraformParser";
import { getLatestTerraformVersion } from "./gitlabClient";
import { isOutdated } from "./versionService";
import { getCached, setCache } from "./cache";

const SECRET_KEY = "gitlabToken";

export function activate(context: vscode.ExtensionContext) {

  const setGitlabUrlCommand = vscode.commands.registerCommand(
    "gitlab-tfmodule-version-checker.setGitlabUrl",
    async () => {
      const url = await vscode.window.showInputBox({
        prompt: "Enter your GitLab URL",
        value: vscode.workspace.getConfiguration("gitlab-tfmodule-version-checker").get<string>("gitlabUrl") ?? "https://gitlab.com",
        ignoreFocusOut: true
      });

      if (!url) return;

      await vscode.workspace.getConfiguration("gitlab-tfmodule-version-checker").update("gitlabUrl", url, vscode.ConfigurationTarget.Global);
      vscode.window.showInformationMessage(`GitLab URL set to ${url}`);
    }
  );
  
  const setTokenCommand = vscode.commands.registerCommand(
    "gitlab-tfmodule-version-checker.setToken",
    async () => {
      const token = await vscode.window.showInputBox({
        prompt: "Enter your GitLab Personal Access Token",
        ignoreFocusOut: true,
        password: true
      });

      if (!token) return;

      await context.secrets.store(SECRET_KEY, token);
      vscode.window.showInformationMessage("GitLab token saved securely.");
    }
  );

  const clearTokenCommand = vscode.commands.registerCommand(
    "gitlab-tfmodule-version-checker.clearToken",
    async () => {
      await context.secrets.delete(SECRET_KEY);
      vscode.window.showInformationMessage("GitLab token removed.");
    }
  );

  const collection =
    vscode.languages.createDiagnosticCollection("terraform");

  context.subscriptions.push(collection);

  const checkCommand = vscode.commands.registerCommand(
    "gitlab-tfmodule-version-checker.checkVersions",
    async () => {

      const editor = vscode.window.activeTextEditor;
      if (!editor) return;

      let token = await context.secrets.get(SECRET_KEY);

      if (!token) {
        const config = vscode.workspace.getConfiguration("gitlab-tfmodule-version-checker");

        const url = await vscode.window.showInputBox({
          prompt: "Enter your GitLab URL (press Enter to use default)",
          value: config.get<string>("gitlabUrl") ?? "https://gitlab.com",
          ignoreFocusOut: true
        });

        if (url === undefined) return;

        await config.update("gitlabUrl", url || "https://gitlab.com", vscode.ConfigurationTarget.Global);

        const newToken = await vscode.window.showInputBox({
          prompt: "Enter your GitLab Personal Access Token",
          ignoreFocusOut: true,
          password: true
        });

        if (!newToken) {
          vscode.window.showErrorMessage("GitLab token is required.");
          return;
        }

        await context.secrets.store(SECRET_KEY, newToken);
        token = newToken;
      }

      const document = editor.document;
      const text = document.getText();

      const config =
        vscode.workspace.getConfiguration("gitlab-tfmodule-version-checker");

      const gitlabUrl = config.get<string>("gitlabUrl")!;

      const modules = extractModules(text);

      if (!modules.length) {
        vscode.window.showInformationMessage("No Terraform modules found.");
        return;
      }

      await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: "Checking Terraform module versions..."
        },
        async () => {

          const diagnostics: vscode.Diagnostic[] = [];

          await Promise.all(
            modules.map(async (mod) => {

              let latest = getCached(mod.source);
              let projectUrl: string | undefined;

              if (!latest) {
                const result = await getLatestTerraformVersion(
                  gitlabUrl,
                  mod.source,
                  token
                );

                if (!result) return;

                latest = result.version;
                projectUrl = result.projectUrl;

                if (latest) {
                  setCache(mod.source, latest);
                }
              }


              if (latest && isOutdated(mod.version, latest)) {

                const range = new vscode.Range(
                  document.positionAt(mod.versionStart),
                  document.positionAt(mod.versionEnd)
                );
            
                const tagUrl = `${projectUrl}/-/tags/${latest}`;

                const diagnostic = new vscode.Diagnostic(
                  range,
                  `Module "${mod.name}" is outdated. Latest: ${latest}`,
                  vscode.DiagnosticSeverity.Warning
                );

                diagnostic.code = {
                  value: `View ${latest}`,
                  target: vscode.Uri.parse(tagUrl)
                };

                diagnostics.push(diagnostic);
              }
            })
          );

          collection.set(document.uri, diagnostics);

          vscode.window.showInformationMessage(
            "Terraform module version check completed."
          );
        }
      );
    }
  );

  context.subscriptions.push(
    setTokenCommand,
    clearTokenCommand,
    setGitlabUrlCommand,
    checkCommand
  );
}