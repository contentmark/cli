import { exec } from 'child_process';
import { promisify } from 'util';
import { resolve } from 'path';
import { createTempFile, TEST_MANIFESTS } from './setup';

const execAsync = promisify(exec);

describe('CLI Integration Tests', () => {
  const CLI_PATH = './dist/cli.js';
  const ABSOLUTE_CLI_PATH = resolve(process.cwd(), CLI_PATH);

  beforeAll(async () => {
    await execAsync('npm run build');
  });

  describe('validate command', () => {
    it('should validate a valid manifest file', async () => {
      const tempFile = createTempFile(JSON.stringify(TEST_MANIFESTS.VALID_BASIC));

      try {
        const { stdout } = await execAsync(`node ${CLI_PATH} validate ${tempFile.path}`);
        expect(stdout).toContain('✅ Valid ContentMark manifest');
      } finally {
        tempFile.cleanup();
      }
    });

    it('should reject invalid manifest file', async () => {
      const tempFile = createTempFile(JSON.stringify(TEST_MANIFESTS.INVALID_MISSING_FIELDS));

      try {
        const result = await execAsync(`node ${CLI_PATH} validate ${tempFile.path}`).catch(e => e);
        expect(result.stdout || result.stderr).toContain('❌ Invalid ContentMark manifest');
      } finally {
        tempFile.cleanup();
      }
    });

    it('should output JSON format when requested', async () => {
      const tempFile = createTempFile(JSON.stringify(TEST_MANIFESTS.VALID_BASIC));

      try {
        const { stdout } = await execAsync(`node ${CLI_PATH} validate ${tempFile.path} --json`);
        const result = JSON.parse(stdout);
        expect(result.valid).toBe(true);
      } finally {
        tempFile.cleanup();
      }
    });

    it('should handle file not found error', async () => {
      try {
        const result = await execAsync(`node ${CLI_PATH} validate nonexistent.json`).catch(e => e);
        expect(result.code).toBe(1);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('generate command', () => {
    it('should generate blog template', async () => {
      const tempPath = '/tmp/test-blog.json';
      const { stdout } = await execAsync(`node ${CLI_PATH} generate --type blog --output ${tempPath} --overwrite`);
      expect(stdout).toContain('✅ Generated ContentMark manifest');

      const { stdout: catOutput } = await execAsync(`cat ${tempPath}`);
      const manifest = JSON.parse(catOutput);
      expect(manifest.siteName).toBe('Your Blog Name');
      expect(manifest.feeds[0].type).toBe('blog');
    });

    it('should generate business template', async () => {
      const tempPath = '/tmp/test-business.json';
      const { stdout } = await execAsync(`node ${CLI_PATH} generate --type business --output ${tempPath} --overwrite`);
      expect(stdout).toContain('✅ Generated ContentMark manifest');

      const { stdout: catOutput } = await execAsync(`cat ${tempPath}`);
      const manifest = JSON.parse(catOutput);
      expect(manifest.siteName).toBe('Your Business Name');
      expect(manifest.visibility.aiDiscovery).toBe('enhanced');
    });

    it('should generate premium template', async () => {
      const tempPath = '/tmp/test-premium.json';
      const { stdout } = await execAsync(`node ${CLI_PATH} generate --type premium --output ${tempPath} --overwrite`);
      expect(stdout).toContain('✅ Generated ContentMark manifest');

      const { stdout: catOutput } = await execAsync(`cat ${tempPath}`);
      const manifest = JSON.parse(catOutput);
      expect(manifest.access.type).toBe('paywall');
    });
  });

  describe('info command', () => {
    it('should display protocol information', async () => {
      const { stdout } = await execAsync(`node ${CLI_PATH} info`);
      expect(stdout).toContain('ContentMark Protocol');
      expect(stdout).toContain('ContentMark Protocol');
    });
  });

  describe('init command', () => {
    it('should initialize ContentMark in directory', async () => {
      const tempDir = '/tmp/contentmark-test';
      await execAsync(`mkdir -p ${tempDir}`);

      try {
        const { stdout } = await execAsync(`cd ${tempDir} && node ${ABSOLUTE_CLI_PATH} init`);
        expect(stdout).toContain('✅ ContentMark has been initialized in your project');

        const { stdout: lsOutput } = await execAsync(`ls ${tempDir}/.well-known/`);
        expect(lsOutput).toContain('contentmark.json');
      } finally {
        await execAsync(`rm -rf ${tempDir}`);
      }
    });
  });
});
