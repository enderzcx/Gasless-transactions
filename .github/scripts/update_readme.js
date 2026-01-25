const fs = require('fs');
const path = require('path');

const readmePath = path.join(process.env.GITHUB_WORKSPACE, 'README.md');
const registrationsPath = process.env.REGISTRATIONS_PATH;
const submissionsPath = process.env.SUBMISSIONS_PATH;

// Helper to extract value from issue body
function extractValue(body, keyRegex) {
  if (!body) return '';
  const match = body.match(keyRegex);
  return match ? match[1].trim() : '';
}

// Format table row column (escape pipes, remove newlines)
function formatCol(text) {
  if (!text) return '-';
  return text.replace(/\|/g, '\\|').replace(/\r?\n/g, '<br>');
}

function generateRegistrationTable(issues) {
  // Header
  let table = '| 姓名 | GitHub ID | 联系方式 | 组队意愿 | 备注 | 更新资料 |\n';
  table += '| --------- | --------- | -------- | -------- | ---- | -------- |\n';

  if (!issues || issues.length === 0) {
    table += '| 待更新... | - | - | - | - | - |\n';
    return table;
  }

  issues.forEach(issue => {
    const body = issue.body || '';
    const name = extractValue(body, /\*\*Name \[姓名\]:\*\*\s*(.*)/i);
    const contact = extractValue(body, /\*\*ContactMethod.*?:\*\*\s*(.*)/i);
    const wantsTeam = extractValue(body, /\*\*WantsTeam.*?:\*\*\s*(.*)/i);
    const comment = extractValue(body, /\*\*Comment.*?:\*\*\s*(.*)/i);
    const githubId = issue.user.login;
    const issueUrl = issue.html_url;

    table += `| ${formatCol(name)} | [@${githubId}](https://github.com/${githubId}) | ${formatCol(contact)} | ${formatCol(wantsTeam)} | ${formatCol(comment)} | [Link](${issueUrl}) |\n`;
  });

  return table;
}

function generateSubmissionTable(issues) {
  // Header
  let table = '| 项目名称 | GitHub ID | 项目描述 | 项目链接 | 提交时间 |\n';
  table += '| --------- | --------- | -------- | -------- | -------- |\n';

  if (!issues || issues.length === 0) {
    table += '| 待更新... | - | - | - | - |\n';
    return table;
  }

  issues.forEach(issue => {
    const body = issue.body || '';
    const projectName = extractValue(body, /\*\*ProjectName.*?:\*\*\s*(.*)/i);
    const description = extractValue(body, /\*\*Brief description.*?:\*\*\s*(.*)/i);
    const repoLink = extractValue(body, /\*\*Github Repo Link.*?:\*\*\s*(.*)/i);
    const githubId = issue.user.login;
    // Use created_at or updated_at, formatted blindly as YYYY-MM-DD
    const date = issue.created_at ? issue.created_at.split('T')[0] : '-';

    table += `| ${formatCol(projectName)} | [@${githubId}](https://github.com/${githubId}) | ${formatCol(description)} | [Repo](${repoLink}) | ${date} |\n`;
  });

  return table;
}

function replaceSection(content, startMarker, endMarker, newContent) {
  const startIndex = content.indexOf(startMarker);
  const endIndex = content.indexOf(endMarker);

  if (startIndex === -1 || endIndex === -1) {
    console.log(`Markers not found: ${startMarker}, ${endMarker}`);
    return content;
  }

  return content.substring(0, startIndex + startMarker.length) + '\n\n' + newContent + '\n' + content.substring(endIndex);
}

// Main execution
try {
  let readmeContent = fs.readFileSync(readmePath, 'utf8');

  // 1. Process Registrations
  if (fs.existsSync(registrationsPath)) {
    const registrations = JSON.parse(fs.readFileSync(registrationsPath, 'utf8'));
    console.log(`Found ${registrations.length} registrations.`);
    const regTable = generateRegistrationTable(registrations);
    readmeContent = replaceSection(readmeContent, '<!-- Registration star -->', '<!-- Registration end -->', regTable);
  }

  // 2. Process Submissions
  if (fs.existsSync(submissionsPath)) {
    const submissions = JSON.parse(fs.readFileSync(submissionsPath, 'utf8'));
    console.log(`Found ${submissions.length} submissions.`);
    const subTable = generateSubmissionTable(submissions);
    readmeContent = replaceSection(readmeContent, '<!-- Submission star -->', '<!-- Submission end -->', subTable);
  }

  fs.writeFileSync(readmePath, readmeContent);
  console.log('README.md updated successfully.');

} catch (error) {
  console.error('Error updating README:', error);
  process.exit(1);
}
