# CI/CD Workflow Templates

This document explains how to use the automated publishing workflows for other npm packages.

## Available Workflows

### 1. **Patch Version Publishing** (`.github/workflows/publish.yml`)
- **Use case**: Regular updates, bug fixes, minor improvements
- **Version bump**: `1.0.0` → `1.0.1`
- **When to use**: Most common updates, backward compatible changes

### 2. **Major Version Publishing** (`.github/workflows/publish-major.yml`)
- **Use case**: Breaking changes, major feature releases
- **Version bump**: `1.0.0` → `2.0.0`
- **When to use**: Breaking changes, major refactors, new major features

## How to Use in Other Packages

### Step 1: Copy the Workflow
```bash
# Copy the appropriate workflow to your package
cp .github/workflows/publish.yml /path/to/your-package/.github/workflows/
# OR for major versions
cp .github/workflows/publish-major.yml /path/to/your-package/.github/workflows/
```

### Step 2: Configure Package.json
Ensure your `package.json` has the required scripts:
```json
{
  "scripts": {
    "build": "your-build-command",
    "test": "your-test-command",
    "lint": "your-lint-command"
  }
}
```

### Step 3: Set Up GitHub Secrets
1. Go to your repository Settings → Secrets and variables → Actions
2. Add `NPM_TOKEN` secret with your npm authentication token

### Step 4: Configure Package Files
Add `.npmignore` to exclude unnecessary files:
```bash
# Source code
src/
tests/
node_modules/

# Development files
tsconfig.json
*.config.js
.eslintrc*

# Git files
.git/
.github/
```

## Workflow Steps Explained

### **Standard Flow** (Both Workflows)
1. **Trigger**: PR merge to main branch
2. **Setup**: Node.js 20, npm cache
3. **Install**: `npm ci` for clean install
4. **Lint**: `npm run lint` for code quality
5. **Test**: `npm test` for functionality
6. **Build**: `npm run build` for production files
7. **Version**: Automatic bump (patch or major)
8. **Publish**: To npm with public access
9. **Tag**: Git tag creation and push

### **Quality Gates**
- ✅ **Lint passes** - Code quality standards
- ✅ **Tests pass** - Functionality verified
- ✅ **Build succeeds** - Production-ready code
- ✅ **Version bump** - Proper semantic versioning

## Version Strategy

### **Patch Version** (`1.0.0` → `1.0.1`)
- Bug fixes
- Documentation updates
- Minor improvements
- Backward compatible changes

### **Minor Version** (`1.0.0` → `1.1.0`)
- New features (backward compatible)
- Enhancements
- Performance improvements

### **Major Version** (`1.0.0` → `2.0.0`)
- Breaking changes
- Major refactors
- New major features
- API changes

## Customization Options

### **Environment Variables**
```yaml
env:
  NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
  NPM_REGISTRY: https://registry.npmjs.org/
  NPM_ACCESS: public
```

### **Node.js Version**
```yaml
- name: Use Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '18'  # Change as needed
```

### **Additional Steps**
Add custom steps before publishing:
```yaml
- name: Custom validation
  run: |
    # Your custom validation logic
    echo "Running custom checks..."
    
- name: Security audit
  run: npm audit --audit-level=moderate
```

## Troubleshooting

### **Common Issues**

**Lint Failures**
```bash
# Fix locally first
npm run lint -- --fix
```

**Test Failures**
```bash
# Run tests locally
npm test
```

**Build Failures**
```bash
# Check build locally
npm run build
```

**Publish Failures**
- Verify `NPM_TOKEN` secret is set
- Check package name availability
- Ensure npm login status

### **Debug Commands**
```bash
# Check what will be published
npm pack --dry-run

# Check package.json scripts
npm run

# Verify npm token
npm whoami
```

## Best Practices

### **Before Using Workflows**
1. ✅ Ensure all tests pass locally
2. ✅ Fix all linting issues
3. ✅ Update documentation
4. ✅ Test build process
5. ✅ Verify package contents

### **Workflow Management**
1. ✅ Use descriptive PR titles
2. ✅ Include breaking change notes
3. ✅ Update CHANGELOG.md
4. ✅ Tag releases appropriately

### **Security**
1. ✅ Never commit tokens
2. ✅ Use GitHub secrets
3. ✅ Regular dependency updates
4. ✅ Security audits

## Example Usage

### **For a React Component Library**
```yaml
# .github/workflows/publish.yml
name: Publish React Components

on:
  pull_request:
    types: [closed]
    branches: [main]

jobs:
  publish:
    runs-on: ubuntu-latest
    if: github.event.pull_request.merged == true
    
    steps:
    - uses: actions/checkout@v4
    - name: Use Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        registry-url: 'https://registry.npmjs.org/'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run lint
      run: npm run lint
    
    - name: Run tests
      run: npm test
    
    - name: Build
      run: npm run build
    
    - name: Publish
      run: |
        npm version patch --no-git-tag-version
        npm publish --access public
        git tag "v$(npm run version --silent)"
        git push origin main
        git push origin "v$(npm run version --silent)"
      env:
        NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

## Support

For questions about these workflows:
- Check the [DEPLOYMENT.md](./DEPLOYMENT.md) guide
- Review GitHub Actions documentation
- Contact the development team
