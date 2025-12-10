import fs from 'fs-extra';
import { glob } from 'glob';
import path from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

class SecurityService {
  constructor(controller = null) {
    this.controller = controller;
    if (!process.env.GOOGLE_AI_API_KEY) {
      throw new Error('GOOGLE_AI_API_KEY not found in environment variables');
    }

    this.genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
    this.model = null;
    this.initializeAI();
  }

  async initializeAI() {
    const modelNames = ['gemini-2.5-flash'];

    for (const modelName of modelNames) {
      try {
        this.model = this.genAI.getGenerativeModel({ model: modelName });
        console.log(`✅ Using AI model: ${modelName}`);
        break;
      } catch (modelError) {
        console.warn(`⚠️ Model ${modelName} not available, trying next...`);
      }
    }

    if (!this.model) {
      throw new Error('No available AI models found');
    }
  }

  /**
   * Scan repository for security issues
   */
  async scanRepository(repoPath) {
    try {
      console.log('🔍 Security scan started for:', repoPath);

      const pathExists = await fs.pathExists(repoPath);
      if (!pathExists) {
        throw new Error('Repository path does not exist');
      }

      // Scan for files
      const files = await glob('**/*.*', {
        cwd: repoPath,
        absolute: true,
        ignore: ['node_modules/**', 'dist/**', 'build/**', '.git/**', 'repos/**'],
        maxDepth: 10,
        nodir: true,
      });

      console.log(`📁 Found ${files.length} files`);

      if (this.controller) {
        this.controller.scanLogs.push({
          timestamp: new Date(),
          repoId: this.controller.currentRepoId || 'unknown',
          username: this.controller.currentUsername || 'unknown',
          status: 'scanning',
          message: `Found ${files.length} files to scan`
        });
      }

      const issues = [];
      let filesScanned = 0;

      for (const file of files) {
        try {
          const ext = path.extname(file).toLowerCase();

          // Only scan code files
          if (
            !['.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.php', '.rb', '.go', '.cs'].includes(
              ext
            )
          )
            continue;

          const stats = await fs.stat(file);
          if (stats.size > 1024 * 200) continue; // Skip files larger than 200KB

          const content = await fs.readFile(file, 'utf-8');
          filesScanned++;

          // Check for eval() usage
          const evalMatches = content.match(/(?:^|[^\/\*\s]).*eval\s*\(/gm);
          if (
            evalMatches &&
            !content.includes('ast.literal_eval') &&
            !content.includes('status(400)') &&
            !evalMatches.every((match) => match.trim().startsWith('//'))
          ) {
            issues.push({
              file: file,
              fileName: path.basename(file),
              severity: 'CRITICAL',
              issue: '🚨 eval() usage detected - potential code injection vulnerability',
              type: 'UNSAFE_EVAL',
              line: this.findLineNumber(content, evalMatches[0]),
            });
          }

          // Check for hardcoded secrets
          if (
            content.match(/(?:password|apikey|secret|token)\s*[:=]\s*["'][^"']{8,}["']/i) &&
            !content.includes('REMOVED_FOR_SECURITY') &&
            !content.includes('YOUR_API_KEY') &&
            !content.includes('PLACEHOLDER') &&
            !content.includes('example.com')
          ) {
            issues.push({
              file: file,
              fileName: path.basename(file),
              severity: 'CRITICAL',
              issue: '🚨 Hardcoded credentials found - security risk',
              type: 'HARDCODED_SECRET',
              line: this.findLineNumber(
                content,
                content.match(/(?:password|apikey|secret|token)\s*[:=]\s*["'][^"']{8,}["']/i)[0]
              ),
            });
          }

          // Check for SQL injection risks
          if (content.match(/(?:SELECT|INSERT|UPDATE|DELETE).*["']\s*\+/gi)) {
            issues.push({
              file: file,
              fileName: path.basename(file),
              severity: 'HIGH',
              issue: '⚠️ SQL injection risk - dynamic query construction',
              type: 'SQL_INJECTION',
              line: this.findLineNumber(
                content,
                content.match(/(?:SELECT|INSERT|UPDATE|DELETE).*["']\s*\+/gi)[0]
              ),
            });
          }

          // Check for insecure HTTP requests
          if (content.match(/http:\/\/(?!localhost|127\.0\.0\.1)/gi)) {
            issues.push({
              file: file,
              fileName: path.basename(file),
              severity: 'MEDIUM',
              issue: '🔓 Insecure HTTP request detected',
              type: 'INSECURE_HTTP',
              line: this.findLineNumber(
                content,
                content.match(/http:\/\/(?!localhost|127\.0\.0\.1)/gi)[0]
              ),
            });
          }

          // Check for weak crypto
          if (content.match(/md5|sha1/gi) && !content.match(/sha256|sha512/gi)) {
            issues.push({
              file: file,
              fileName: path.basename(file),
              severity: 'MEDIUM',
              issue: '🔐 Weak cryptographic hash detected',
              type: 'WEAK_CRYPTO',
              line: this.findLineNumber(content, content.match(/md5|sha1/gi)[0]),
            });
          }

          // Check for missing input validation
          if (
            content.match(/req\.(query|params|body)\.[a-zA-Z]+/) &&
            !content.includes('validator') &&
            !content.includes('validate') &&
            !content.includes('sanitize')
          ) {
            issues.push({
              file: file,
              fileName: path.basename(file),
              severity: 'MEDIUM',
              issue: '📝 Potential missing input validation',
              type: 'INPUT_VALIDATION',
              line: this.findLineNumber(
                content,
                content.match(/req\.(query|params|body)\.[a-zA-Z]+/)[0]
              ),
            });
          }
        } catch (fileErr) {
          console.error(`❌ Error scanning ${file}:`, fileErr.message);
        }
      }

      const summary = {
        critical: issues.filter((i) => i.severity === 'CRITICAL').length,
        high: issues.filter((i) => i.severity === 'HIGH').length,
        medium: issues.filter((i) => i.severity === 'MEDIUM').length,
        total: issues.length,
      };

      console.log(`✅ Scan complete: ${issues.length} issues found`);

      if (this.controller) {
        const criticalCount = summary.critical;
        const highCount = summary.high;
        const mediumCount = summary.medium;
        
        this.controller.scanLogs.push({
          timestamp: new Date(),
          repoId: this.controller.currentRepoId || 'unknown',
          username: this.controller.currentUsername || 'unknown',
          status: 'scanned',
          message: `Scan complete: ${issues.length} issues found (Critical: ${criticalCount}, High: ${highCount}, Medium: ${mediumCount})`
        });
      }

      return {
        repoPath,
        totalFiles: files.length,
        filesScanned,
        summary: {
          ...summary,
          riskLevel:
            summary.critical > 0 ? 'HIGH_RISK' : summary.high > 0 ? 'MEDIUM_RISK' : 'LOW_RISK',
        },
        issues,
        recommendations:
          summary.total === 0
            ? ['✅ No security issues found']
            : ['🔧 Address security vulnerabilities', '📚 Review code security practices'],
      };
    } catch (err) {
      console.error('❌ Scan error:', err);
      throw new Error(`Error during scan: ${err.message}`);
    }
  }

  /**
   * Fix security issues in repository
   */
  async fixRepository(repoPath, issues, maxFileSize = 1024 * 200) {
    try {
      console.log(`🔧 AI Fix request for: ${repoPath}`);
      

      if (!issues || issues.length === 0) {
        return {
          appliedFixes: [],
          failedFixes: [],
          skippedFiles: [],
          summary: {
            totalIssues: 0,
            successful: 0,
            failed: 0,
            skipped: 0,
            successRate: '100%',
          },
        };
      }

      console.log(`🔍 Found ${issues.length} issues to fix`);

      if (this.controller) {
        this.controller.scanLogs.push({
          timestamp: new Date(),
          repoId: this.controller.currentRepoId || 'unknown',
          username: this.controller.currentUsername || 'unknown',
          status: 'fixing',
          message: `Starting to fix ${issues.length} security issues`
        });
      }

      const appliedFixes = [];
      const failedFixes = [];
      const skippedFiles = [];

      for (let i = 0; i < issues.length; i++) {
        const issue = issues[i];
        const filePath = issue.file;
        const fileName = path.basename(filePath);

        console.log(`\n🔄 Processing ${i + 1}/${issues.length}: ${fileName}`);
        console.log(`🔧 Issue: ${issue.issue}`);

        if (this.controller) {
          this.controller.scanLogs.push({
            timestamp: new Date(),
            repoId: this.controller.currentRepoId || 'unknown',
            username: this.controller.currentUsername || 'unknown',
            status: 'fixing',
            message: `Processing ${fileName} (${i + 1}/${issues.length}) - ${issue.issue}`
          });
        }

        try {
          // Check if file exists
          if (!(await fs.pathExists(filePath))) {
            console.warn(`❌ File not found: ${filePath}`);
            failedFixes.push({
              file: filePath,
              fileName,
              issue: issue.issue,
              status: 'file_not_found',
              reason: 'File does not exist in repository',
            });
            continue;
          }

          const fileStats = await fs.stat(filePath);
          if (fileStats.size > maxFileSize) {
            console.warn(
              `⏭️ Skipping large file (${Math.round(fileStats.size / 1024)}KB): ${fileName}`
            );
            skippedFiles.push({
              file: filePath,
              fileName,
              issue: issue.issue,
              reason: `File too large (${Math.round(
                fileStats.size / 1024
              )}KB > ${Math.round(maxFileSize / 1024)}KB)`,
            });
            continue;
          }

          const fileExt = path.extname(filePath).toLowerCase();
          const binaryExtensions = [
            '.jpg',
            '.jpeg',
            '.png',
            '.gif',
            '.pdf',
            '.zip',
            '.exe',
            '.dll',
            '.ico',
            '.svg',
          ];
          if (binaryExtensions.includes(fileExt)) {
            console.log(`⏭️ Skipping binary file: ${fileName}`);
            skippedFiles.push({
              file: filePath,
              fileName,
              issue: issue.issue,
              reason: 'Binary file - cannot be processed',
            });
            continue;
          }

          // Skip lock files and auto-generated files
          if (this.shouldSkipFile(fileName, filePath)) {
            console.log(`⏭️ Skipping auto-generated file: ${fileName}`);
            skippedFiles.push({
              file: filePath,
              fileName,
              issue: issue.issue,
              reason: 'Auto-generated or dependency file',
            });
            continue;
          }

          const originalContent = await fs.readFile(filePath, 'utf-8');
          console.log(`📖 Read ${originalContent.length} characters from ${fileName}`);

          const fixedContent = await this.fixFileContent(originalContent, issue, fileName, fileExt);

          if (fixedContent === originalContent) {
            console.log('ℹ️ No changes made by AI');
            failedFixes.push({
              file: filePath,
              fileName,
              issue: issue.issue,
              status: 'no_changes',
              reason: 'AI determined no changes were needed',
            });
            continue;
          }

          // Validate the fixed content
          const validation = this.validateFixedContent(fixedContent, fileExt);
          if (!validation.isValid) {
            failedFixes.push({
              file: filePath,
              fileName,
              issue: issue.issue,
              status: 'validation_failed',
              reason: validation.error,
            });
            continue;
          }

          // Create backup and apply fix
          const backupPath = `${filePath}.backup_${Date.now()}`;
          await fs.copyFile(filePath, backupPath);
          console.log(`💾 Created backup: ${path.basename(backupPath)}`);

          await fs.writeFile(filePath, fixedContent, 'utf-8');

          appliedFixes.push({
            file: filePath,
            fileName,
            issue: issue.issue,
            status: 'fixed_by_ai',
            explanation: `Successfully fixed: ${issue.issue}`,
            backupCreated: backupPath,
            changes: {
              originalSize: originalContent.length,
              fixedSize: fixedContent.length,
              sizeDifference: fixedContent.length - originalContent.length,
            },
          });

          console.log(`✅ Successfully fixed ${fileName}`);
          console.log(`📊 Size change: ${originalContent.length} → ${fixedContent.length} chars`);
          
          if (this.controller) {
            this.controller.scanLogs.push({
              timestamp: new Date(),
              repoId: this.controller.currentRepoId || 'unknown',
              username: this.controller.currentUsername || 'unknown',
              status: 'fixing',
              message: `✓ Fixed ${fileName} - ${issue.issue}`
            });
          }
        } catch (error) {
          console.error(`❌ Error processing ${fileName}:`, error.message);
          failedFixes.push({
            file: filePath,
            fileName,
            issue: issue.issue,
            status: 'processing_error',
            reason: error.message,
          });
        }
      }

      const summary = {
        totalIssues: issues.length,
        successful: appliedFixes.length,
        failed: failedFixes.length,
        skipped: skippedFiles.length,
        successRate: `${Math.round((appliedFixes.length / issues.length) * 100)}%`,
      };

      console.log('\n📊 Fixing Summary:');
      console.log(`✅ Successful: ${summary.successful}`);
      console.log(`❌ Failed: ${summary.failed}`);
      console.log(`⏭️ Skipped: ${summary.skipped}`);
      console.log(`📈 Success Rate: ${summary.successRate}`);

      if (this.controller) {
        this.controller.scanLogs.push({
          timestamp: new Date(),
          repoId: this.controller.currentRepoId || 'unknown',
          username: this.controller.currentUsername || 'unknown',
          status: 'fixing',
          message: `Fix complete: ${summary.successful} fixed, ${summary.failed} failed, ${summary.skipped} skipped (${summary.successRate} success rate)`
        });
      }

      return {
        appliedFixes,
        failedFixes,
        skippedFiles,
        summary,
      };
    } catch (error) {
      console.error('❌ Fix processing error:', error);
      throw new Error(`Error processing fixes: ${error.message}`);
    }
  }

  /**
   * Fix file content using AI
   */
  async fixFileContent(originalContent, issue, fileName, fileExt) {
    const prompt = `You are an expert code security fixer. Fix the following security issue and return ONLY the complete corrected file content.

**IMPORTANT: Your response must contain ONLY the fixed file content. No explanations, no markdown formatting, no code blocks, no extra text.**

File: ${fileName}
Issue: ${issue.issue}
Issue Type: ${issue.type}
File Extension: ${fileExt}

Security Fixing Instructions:
- For UNSAFE_EVAL: Replace eval() with safer alternatives like JSON.parse() or remove if unnecessary
- For HARDCODED_SECRET: Replace with environment variables or configuration placeholders
- For SQL_INJECTION: Use parameterized queries or escape user input properly
- For INSECURE_HTTP: Replace http:// with https:// for external requests
- For WEAK_CRYPTO: Replace MD5/SHA1 with SHA-256 or stronger algorithms
- For INPUT_VALIDATION: Add proper validation and sanitization

Original Content:
${originalContent}

FIXED CONTENT:`;

    let attempt = 0;
    const maxAttempts = 3;

    while (attempt < maxAttempts) {
      try {
        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        let fixedContent = response.text().trim();

        // Clean the AI response
        fixedContent = this.cleanAIResponse(fixedContent);
        return fixedContent;
      } catch (aiError) {
        attempt++;
        console.warn(`⚠️ AI attempt ${attempt} failed: ${aiError.message}`);

        if (attempt >= maxAttempts) {
          throw aiError;
        }

        // Wait before retry
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }
  }

  /**
   * Clean AI response to extract only the code content
   */
  cleanAIResponse(response) {
    let cleaned = response.trim();

    // Remove code blocks if present
    if (cleaned.includes('```')) {
      const codeBlockRegex = /```[\w]*\n?([\s\S]*?)\n?```/;
      const match = cleaned.match(codeBlockRegex);
      if (match) {
        cleaned = match[1];
      }
    }

    // Remove common AI response prefixes
    const prefixes = [
      'Here is the fixed content:',
      'Fixed content:',
      'FIXED CONTENT:',
      'The corrected file content is:',
      "Here's the corrected version:",
    ];

    for (const prefix of prefixes) {
      if (cleaned.toLowerCase().startsWith(prefix.toLowerCase())) {
        cleaned = cleaned.substring(prefix.length).trim();
      }
    }

    return cleaned;
  }

  /**
   * Validate fixed content
   */
  validateFixedContent(content, fileExt) {
    try {
      if (fileExt === '.json') {
        JSON.parse(content);
      }

      // Add more validation rules as needed

      return { isValid: true };
    } catch (error) {
      return {
        isValid: false,
        error: `Validation failed: ${error.message}`,
      };
    }
  }

  /**
   * Check if file should be skipped
   */
  shouldSkipFile(fileName, filePath) {
    const skipFiles = [
      'package-lock.json',
      'yarn.lock',
      'pnpm-lock.yaml',
      'composer.lock',
      'Pipfile.lock',
      'poetry.lock',
    ];

    const skipPatterns = [
      /\/node_modules\//,
      /\/\.git\//,
      /\/dist\//,
      /\/build\//,
      /\/coverage\//,
      /\/\.next\//,
      /\/\.nuxt\//,
    ];

    return skipFiles.includes(fileName) || skipPatterns.some((pattern) => pattern.test(filePath));
  }

  /**
   * Find line number of a match in content
   */
  findLineNumber(content, match) {
    if (!match) return 1;

    const beforeMatch = content.substring(0, content.indexOf(match));
    return beforeMatch.split('\n').length;
  }
}

export default SecurityService;
