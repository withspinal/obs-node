# Testing Guide for Spinal Observability SDK

## Overview

This document outlines the testing strategy, coverage requirements, and best practices for the Spinal Observability SDK.

## Test Structure

```
tests/
├── setup.ts              # Global test setup and teardown
├── unit/                 # Unit tests for individual modules
│   ├── analytics.test.ts
│   ├── config.test.ts
│   ├── index.test.ts
│   ├── pricing.test.ts
│   ├── providers.test.ts
│   ├── public.test.ts
│   └── runtime.test.ts
└── e2e/                  # End-to-end integration tests
    ├── analytics-e2e.test.ts
    └── cli-integration.test.ts
```

## Coverage Requirements

### Current Coverage Status
- **Overall**: 69.24% (meets adjusted thresholds)
- **Analytics**: 97.53% (excellent)
- **Pricing**: 100% (perfect)
- **Runtime**: 84.73% (good)
- **Providers**: 15.86% (needs improvement)
- **CLI**: 0% (excluded from coverage)

### Coverage Thresholds

#### Global Thresholds
- **Statements**: 60%
- **Branches**: 60%
- **Functions**: 70%
- **Lines**: 60%

#### Module-Specific Thresholds
- **Analytics**: 90% (high business logic importance)
- **Runtime**: 80% (core functionality)
- **Pricing**: 100% (critical for cost calculations)

## Test Categories

### 1. Unit Tests (`tests/unit/`)
- **Purpose**: Test individual functions and modules in isolation
- **Coverage**: Core business logic, error handling, edge cases
- **Dependencies**: Mocked external dependencies

### 2. E2E Tests (`tests/e2e/`)
- **Purpose**: Test complete workflows and integrations
- **Coverage**: Real API calls, CLI functionality, data flow
- **Dependencies**: Real OpenAI API (requires API key)

## Running Tests

### Unit Tests
```bash
# Run all unit tests
npm test

# Run unit tests in watch mode
npm run test:watch

# Run unit tests with coverage
npm run test:coverage
```

### E2E Tests
```bash
# Run E2E tests (requires OPENAI_API_KEY)
npm run test:e2e
```

### All Tests
```bash
# Run both unit and E2E tests
npm test && npm run test:e2e
```

## Test Setup

### Environment Variables
- `SPINAL_MODE=local` - Set to local mode for testing
- `SPINAL_LOCAL_STORE_PATH` - Path for test data storage
- `OPENAI_API_KEY` - Required for E2E tests

### Test Data Management
- Test data is stored in `.spinal-test/` directory
- Directory is cleaned before and after each test
- E2E tests create real spans for analysis

## Coverage Improvements Needed

### 1. Providers Module (15.86% coverage)
**Priority**: High
**Areas to test**:
- HTTP request interception
- OpenAI API call capture
- Token usage extraction
- Error handling scenarios

**Example test cases**:
```typescript
describe('OpenAI Provider', () => {
  it('should capture OpenAI API calls', async () => {
    // Test fetch interception
  })
  
  it('should extract token usage from responses', async () => {
    // Test response parsing
  })
  
  it('should handle API errors gracefully', async () => {
    // Test error scenarios
  })
})
```

### 2. CLI Module (0% coverage)
**Priority**: Medium
**Areas to test**:
- Command parsing and execution
- Configuration management
- Data display formatting
- Error handling

**Example test cases**:
```typescript
describe('CLI Commands', () => {
  it('should show status correctly', async () => {
    // Test status command
  })
  
  it('should display local data in table format', async () => {
    // Test data display
  })
  
  it('should handle missing data gracefully', async () => {
    // Test error scenarios
  })
})
```

### 3. Public Module (5.49% coverage)
**Priority**: Medium
**Areas to test**:
- Data display functions
- Format conversion
- Cost calculation integration

## Best Practices

### 1. Test Organization
- Group related tests in describe blocks
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)

### 2. Mocking Strategy
- Mock external dependencies (HTTP, file system)
- Use real implementations for core business logic
- Avoid over-mocking

### 3. Error Testing
- Test both success and failure scenarios
- Verify error messages and handling
- Test edge cases and boundary conditions

### 4. Performance Testing
- E2E tests include real API calls
- Monitor test execution time
- Use appropriate timeouts

## CI/CD Integration

### GitHub Actions
- **Unit tests**: Run on all PRs and pushes
- **E2E tests**: Run on PRs and pushes (requires API key)
- **Coverage reporting**: Generated automatically
- **Publish**: Only on main branch pushes

### Coverage Reporting
- Coverage reports generated for each run
- Thresholds enforced in CI
- Coverage data available in GitHub Actions

## Troubleshooting

### Common Issues

1. **E2E Tests Failing**
   - Check `OPENAI_API_KEY` environment variable
   - Verify API key has sufficient credits
   - Check network connectivity

2. **Coverage Thresholds Failing**
   - Review uncovered lines in coverage report
   - Add tests for missing scenarios
   - Adjust thresholds if appropriate

3. **Test Timeouts**
   - Increase timeout for slow operations
   - Check for hanging promises
   - Verify cleanup in afterEach/afterAll

### Debug Mode
```bash
# Run tests with verbose output
npm test -- --reporter=verbose

# Run specific test file
npm test -- tests/unit/analytics.test.ts

# Run tests with coverage and HTML report
npm run test:coverage -- --reporter=html
```

## Future Improvements

### 1. Test Infrastructure
- Add visual regression tests for CLI output
- Implement performance benchmarks
- Add load testing for high-volume scenarios

### 2. Coverage Enhancements
- Add integration tests for different Node.js versions
- Test edge cases in data processing
- Add stress tests for memory usage

### 3. Documentation
- Add test examples for common use cases
- Document testing patterns and conventions
- Create troubleshooting guide

## Contributing

When adding new features:
1. Write unit tests for core functionality
2. Add E2E tests for integration scenarios
3. Ensure coverage thresholds are met
4. Update this documentation if needed

When fixing bugs:
1. Add regression tests
2. Verify fix with existing test suite
3. Update relevant test documentation
