/**
 * 项目提交信息提取脚本
 * Submission information extraction script
 * 
 * 用于处理 GitHub Issue 中的提交信息，创建项目提交文件并更新 README 表格
 */

const SubmissionProcessor = require('./processors/submission-processor');

// 从环境变量获取参数
const issueBody = process.env.ISSUE_BODY || '';
const githubUser = process.env.ISSUE_USER || '';

// 调试输出
console.log('处理用户:', githubUser);
console.log('Issue 内容:\n', issueBody);

try {
    // 处理项目提交
    SubmissionProcessor.processSubmission(issueBody, githubUser);
} catch (error) {
    console.error('项目提交处理失败:', error.message);
    process.exit(1);
}
