# Release Workflow Guide

This guide explains how to release new versions of the Spinal Observability SDK, including version management, CI/CD automation, and best practices.

## 🚀 **Release Process Overview**

The Spinal SDK uses a **manual version management** approach with **automated publishing** via CI/CD. This gives you full control over releases while automating the publishing process.

### **Release Workflow:**
1. **Update version** manually in `package.json`
2. **Commit and push** to main branch
3. **CI automatically publishes** to npm
4. **Create GitHub release** with release notes

## 📋 **Version Management**

### **Semantic Versioning (SemVer)**
The SDK follows [Semantic Versioning](https://semver.org/) with the format `MAJOR.MINOR.PATCH`:

- **MAJOR** (1.0.0 → 2.0.0): Breaking changes, incompatible API changes
- **MINOR** (1.0.0 → 1.1.0): New features, backward-compatible additions
- **PATCH** (1.0.0 → 1.0.1): Bug fixes, documentation updates

### **Version Bump Commands**
```bash
# Patch release (bug fixes, docs, minor improvements)
npm version patch
git push origin main

# Minor release (new features, backward-compatible)
npm version minor
git push origin main

# Major release (breaking changes)
npm version major
git push origin main
```

### **Manual Version Update**
Alternatively, you can manually edit `package.json`:
```json
{
  "name": "spinal-obs-node",
  "version": "1.0.1",  // Update this line
  "description": "Spinal cost-aware OpenTelemetry SDK for Node.js"
}
```

## 🔄 **CI/CD Automation**

### **Automatic Publishing**
When you push to the main branch, the CI/CD pipeline:

1. ✅ **Runs tests** on Node.js 18, 20, and 22
2. ✅ **Builds the package** with TypeScript
3. ✅ **Checks if version exists** on npm
4. ✅ **Publishes automatically** if version is new
5. ✅ **Skips publish** if version already exists

### **Workflow Benefits**
- ✅ **Automatic publishing** when version changes
- ✅ **Duplicate prevention** (won't publish same version twice)
- ✅ **Clear feedback** about what's happening
- ✅ **Manual control** over release timing
- ✅ **Multi-Node.js testing** (18, 20, 22)

### **CI/CD Pipeline Steps**
```yaml
# Test Job (runs on all Node.js versions)
- Install dependencies
- Build package
- Run unit tests
- Run linting

# Publish Job (runs only on main branch pushes)
- Install dependencies
- Build package
- Check if version already published
- Publish to npm (if new version)
- Skip publish (if version exists)
```

## 📝 **Release Checklist**

### **Before Release**
- [ ] **Test locally**: `npm test` passes
- [ ] **Update documentation** if needed
- [ ] **Review changes** since last release
- [ ] **Determine version bump** (patch/minor/major)

### **Release Steps**
1. **Bump version**:
   ```bash
   npm version patch  # or minor/major
   ```

2. **Review changes**:
   ```bash
   git diff HEAD~1
   ```

3. **Push to main**:
   ```bash
   git push origin main
   ```

4. **Monitor CI/CD**:
   - Check [GitHub Actions](https://github.com/withspinal/obs-node/actions)
   - Verify tests pass
   - Confirm publish step runs

5. **Create GitHub release**:
   - Go to [Releases page](https://github.com/withspinal/obs-node/releases)
   - Click "Create a new release"
   - Use the version tag (e.g., `v1.0.1`)
   - Write release notes
   - Publish release

### **After Release**
- [ ] **Verify npm package** is published
- [ ] **Test installation**: `npm install spinal-obs-node@latest`
- [ ] **Update changelog** if maintained
- [ ] **Announce release** to users

## 🎯 **Release Examples**

### **Patch Release (Bug Fix)**
```bash
# Fix a bug in local mode storage
git add .
git commit -m "fix: resolve file permission issue in local mode"

# Bump patch version
npm version patch
git push origin main

# CI automatically publishes 1.0.0 → 1.0.1
```

### **Minor Release (New Feature)**
```bash
# Add new CLI command
git add .
git commit -m "feat: add spinal query command for custom analysis"

# Bump minor version
npm version minor
git push origin main

# CI automatically publishes 1.0.1 → 1.1.0
```

### **Major Release (Breaking Change)**
```bash
# Change API interface
git add .
git commit -m "feat!: change configure() to accept new options structure"

# Bump major version
npm version major
git push origin main

# CI automatically publishes 1.1.0 → 2.0.0
```

## 🔧 **Troubleshooting**

### **Common Issues**

**Version already exists on npm:**
```
Skipping publish - version 1.0.1 already exists on npm
```
**Solution**: Bump version before pushing

**CI tests failing:**
```
FAIL tests/unit/index.test.ts
```
**Solution**: Fix tests before releasing

**Publish step skipped:**
```
publish  0s publish
```
**Solution**: Check if pushing to main branch

### **Manual Publishing (Emergency)**
If CI/CD fails, you can publish manually:
```bash
npm login
npm publish --access public
```

### **Rollback Release**
If you need to unpublish (within 72 hours):
```bash
npm unpublish spinal-obs-node@1.0.1
```

## 📊 **Release Metrics**

### **Current Status**
- **Latest Version**: 1.0.0
- **Total Downloads**: [Check npm stats](https://www.npmjs.com/package/spinal-obs-node)
- **GitHub Stars**: [Check repository](https://github.com/withspinal/obs-node)

### **Release History**
- `v1.0.0` - Initial release with local mode and CLI
- Future releases will be documented here

## 🚀 **Best Practices**

### **Version Management**
- ✅ **Use semantic versioning** consistently
- ✅ **Bump version before pushing** to main
- ✅ **Write clear commit messages** for releases
- ✅ **Test locally** before releasing

### **Release Notes**
- ✅ **Summarize changes** clearly
- ✅ **List breaking changes** prominently
- ✅ **Include migration guides** for major releases
- ✅ **Link to documentation** updates

### **Quality Assurance**
- ✅ **All tests pass** before release
- ✅ **Documentation is updated**
- ✅ **Changelog is current**
- ✅ **No known issues** in release

## 📚 **Related Documentation**

- [INSTALLATION.md](./INSTALLATION.md) - What users get when installing
- [QUICKSTART.md](./QUICKSTART.md) - Getting started guide
- [LOCAL_MODE.md](./LOCAL_MODE.md) - Local mode documentation
- [TRACKING.md](./TRACKING.md) - What data gets tracked

## 🆘 **Support**

For questions about releases:
- **CI/CD Issues**: Check [GitHub Actions](https://github.com/withspinal/obs-node/actions)
- **NPM Issues**: Check [npm package page](https://www.npmjs.com/package/spinal-obs-node)
- **Documentation**: Review this guide and related docs
- **Contact**: founders@withspinal.com
