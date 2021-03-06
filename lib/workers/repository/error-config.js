module.exports = {
  raiseConfigWarningIssue,
};

async function raiseConfigWarningIssue(config, error) {
  logger.debug('raiseConfigWarningIssue()');
  let body = `There is an error with this repository's Renovate configuration that needs to be fixed. As a precaution, Renovate will stop renovations until it is fixed.\n\n`;
  if (error.configFile) {
    body += `Configuration file: \`${error.configFile}\`\n`;
  }
  body += `Error type: ${error.validationError}\n`;
  if (error.validationMessage) {
    body += `Message: ${error.validationMessage}\n`;
  }
  if (config.repoIsOnboarded) {
    const res = await platform.ensureIssue(
      'Action Required: Fix Renovate Configuration',
      body
    );
    if (res) {
      logger.warn({ configError: error, res }, 'Config Warning');
    }
  } else {
    // update onboarding Pr
    logger.info('Updating onboarding PR');
    const pr = await platform.getBranchPr('renovate/configure');
    body = `## Action Required: Fix Renovate Configuration\n\n${body}`;
    body += `\n\nOnce you have resolved this problem (in this onboarding branch), Renovate will return to providing you with a preview of your repository's configuration.`;
    await platform.updatePr(pr.number, 'Configure Renovate', body);
  }
}
