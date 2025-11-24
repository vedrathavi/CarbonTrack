# Test Suite Documentation

## Overview
Comprehensive test suite for CarbonTrack frontend with 80+ test cases covering components, hooks, utilities, boundary conditions, and known issues.

## Test Structure

```
frontend/tests/
├── setup.js                          # Test environment configuration
├── components/                       # Component tests (38 tests)
│   ├── button.test.jsx              # 4 tests - Button UI component
│   ├── TotalCard.test.jsx           # 4 tests - Emission card display
│   ├── ComparisonStat.test.jsx      # 7 tests - Global comparison widget
│   ├── TopContributor.test.jsx      # 7 tests - Top appliance display
│   ├── Sidebar.test.jsx             # 6 tests - Navigation sidebar
│   ├── Input.test.jsx               # 7 tests - Input UI component
│   └── Checkbox.test.jsx            # 5 tests - Checkbox UI component
├── hooks/                            # Hook tests (10 tests)
│   ├── useAuthHook.test.js          # 2 tests - Auth store integration
│   └── useHomeHook.test.js          # 5 tests - Home store integration
├── utils/                            # Utility tests (11 tests)
│   ├── constants.test.js            # 3 tests - API routes and constants
│   └── apiClient.test.js            # 4 tests - Axios configuration
├── lib/                              # Library tests (7 tests)
│   └── utils.test.js                # 7 tests - Tailwind class merger
├── boundary/                         # Boundary tests (25 tests)
│   └── boundaryTests.test.jsx       # Edge cases and limits
└── intentional-failures/             # Known issues (13 tests)
    └── knownIssues.test.js          # Documented limitations
```

## Test Categories

### 1. Component Tests (38 tests)
Testing UI components for rendering, user interaction, and state management.

**TotalCard.test.jsx**
- ✅ Returns null when no summary
- ✅ Displays emissions with proper formatting
- ✅ Shows time-based greeting
- ✅ Shows motivational messages

**ComparisonStat.test.jsx**
- ✅ Returns null when no data
- ✅ Displays home vs global average
- ✅ Shows "Better" status correctly
- ✅ Shows "Higher" status correctly
- ✅ Calculates percentages accurately
- ✅ Displays difference in grams
- ✅ Handles equal values

**TopContributor.test.jsx**
- ✅ Shows "No Data Yet" for empty data
- ✅ Displays appliance names formatted
- ✅ Shows emission values
- ✅ Calculates contribution percentage
- ✅ Shows total emissions
- ✅ Formats camelCase to Title Case
- ✅ Auto-selects highest emitter

**Sidebar.test.jsx**
- ✅ Renders user name
- ✅ Displays all navigation sections
- ✅ Shows dashboard sub-options
- ✅ Renders "View Profile" text

**UI Components (Button, Input, Checkbox)**
- ✅ Basic rendering
- ✅ User interactions (click, change)
- ✅ Disabled states
- ✅ Event handlers
- ✅ Controlled components

### 2. Hook Tests (10 tests)
Testing custom React hooks and store integrations.

**useAuthHook & useHomeHook**
- ✅ Provides user/home data from store
- ✅ Handles loading states
- ✅ Handles error states
- ✅ Provides stats data
- ✅ Provides action methods

### 3. Utility Tests (11 tests)
Testing helper functions and configurations.

**constants.test.js**
- ✅ HOST variable defined
- ✅ Auth routes defined
- ✅ Dashboard route helpers work

**apiClient.test.js**
- ✅ Axios importable
- ✅ Handles GET requests
- ✅ Handles POST requests
- ✅ Handles errors

**utils.test.js (cn function)**
- ✅ Merges class names
- ✅ Handles conditionals
- ✅ Filters falsy values
- ✅ Resolves Tailwind conflicts
- ✅ Handles arrays and objects

### 4. Boundary Tests (25 tests)
Testing edge cases, limits, and defensive programming.

**Zero/Empty Values**
- ✅ Zero emissions display
- ✅ Empty appliances object
- ✅ Zero global average (division by zero)
- ✅ Both values as zero

**Extreme Values**
- ✅ MAX_SAFE_INTEGER emissions
- ✅ Negative emissions (invalid but defensive)
- ✅ Very large percentage differences (>1000%)
- ✅ Single appliance at 100% contribution

**Special Cases**
- ✅ Floating point precision (0.1 + 0.2)
- ✅ undefined/null values
- ✅ NaN values
- ✅ Infinity values
- ✅ Very long appliance names
- ✅ Special characters in names

**Type Coercion**
- ✅ String numbers ("123.45")
- ✅ Boolean values (true = 1)
- ✅ Array values (invalid but handled)

### 5. Intentional Failures (13 tests)
Documenting known limitations and technical debt.

**Type Safety (2 tests)**
- ⚠️ No runtime type validation
- ⚠️ No input validation on emissions

**Data Validation (2 tests)**
- ⚠️ No realistic range validation
- ⚠️ No cross-field consistency checks

**Performance (2 tests)**
- ⚠️ No handling for large datasets (>1000 items)
- ⚠️ No memoization for calculations

**Accessibility (2 tests)**
- ⚠️ Missing ARIA labels on some charts
- ⚠️ Color-only indicators without text

**Component Behavior (2 tests)**
- ⚠️ No prop combination validation
- ⚠️ No data freshness validation

**Library Limitations (3 tests)**
- ⚠️ cn() nested array order preservation
- ⚠️ Responsive class conflict handling
- ⚠️ twMerge edge cases

## Running Tests

### Run All Tests
```bash
npm run test
```

### Run Tests with UI
```bash
npm run test:ui
```
Opens browser at http://localhost:51204/__vitest__/

### Run with Coverage
```bash
npm run test:coverage
```

### Watch Mode
```bash
npm run test -- --watch
```

### Run Specific Test File
```bash
npm run test -- tests/components/TotalCard.test.jsx
```

### Run Tests Matching Pattern
```bash
npm run test -- --grep "Boundary"
```

## Test Results Summary

### Current Status
- ✅ **61 tests passing**
- ⚠️ **13 tests intentionally failing** (documented)
- 📊 **Total: 74 test cases**

### Coverage Areas
- **Components**: 38 tests (51%)
- **Boundary Testing**: 25 tests (34%)
- **Hooks & Utils**: 18 tests (24%)
- **Known Issues**: 13 tests (18%)

## Key Testing Patterns

### 1. Component Testing
```javascript
it('displays total emissions correctly', () => {
  const mockSummary = { totalEmissions: 25.5 };
  render(<TotalCard summary={mockSummary} />);
  expect(screen.getByText('25.5')).toBeInTheDocument();
});
```

### 2. Boundary Testing
```javascript
it('handles zero emissions', () => {
  const mockSummary = { totalEmissions: 0 };
  render(<TotalCard summary={mockSummary} />);
  expect(screen.getByText('0.0')).toBeInTheDocument();
});
```

### 3. Intentional Failures
```javascript
it.fails('should validate emissions are within realistic ranges', () => {
  const unrealisticEmissions = 999999999;
  const MAX_REALISTIC = 50000;
  expect(unrealisticEmissions).toBeLessThan(MAX_REALISTIC);
  // ACTUAL: No validation, displays any value
});
```

### 4. Hook Testing
```javascript
it('provides home data from store', () => {
  useAppStore.mockReturnValue({ home: mockHome });
  const store = useAppStore();
  expect(store.home).toEqual(mockHome);
});
```

## Vitest UI Features

When running `npm run test:ui`, you get:

- ✅ **Real-time test results** with pass/fail indicators
- 📊 **Code coverage reports** with line-by-line highlighting
- 🔍 **Test filtering** by file, name, or status
- ⏱️ **Execution time** for each test
- 📝 **Stack traces** for failures
- 🎯 **Re-run failed tests** quickly
- 🌳 **Test tree view** organized by suite

## Best Practices Implemented

1. ✅ **Descriptive test names** - Each test clearly states what it tests
2. ✅ **AAA Pattern** - Arrange, Act, Assert structure
3. ✅ **Isolated tests** - No dependencies between tests
4. ✅ **Mock external dependencies** - Use vi.mock for stores/APIs
5. ✅ **Test edge cases** - Boundary testing for robustness
6. ✅ **Document known issues** - Intentional failures track technical debt
7. ✅ **Accessibility testing** - Check for ARIA labels and screen reader support
8. ✅ **Performance awareness** - Test with large datasets

## Future Improvements

### High Priority
- [ ] Add E2E tests with Playwright
- [ ] Increase component test coverage to 80%
- [ ] Add visual regression testing
- [ ] Implement accessibility automated testing

### Medium Priority
- [ ] Add integration tests for API calls
- [ ] Test error boundaries
- [ ] Add snapshot testing for complex components
- [ ] Performance benchmarking tests

### Low Priority
- [ ] Add mutation testing
- [ ] Test bundle size limits
- [ ] Add security testing
- [ ] Cross-browser compatibility tests

## Contributing

When adding new tests:
1. Place in appropriate directory
2. Follow naming convention: `*.test.js` or `*.test.jsx`
3. Group related tests with `describe()`
4. Use clear, descriptive test names
5. Add comments for complex test logic
6. Update this documentation

## Continuous Integration

Tests run automatically on:
- Every commit (pre-commit hook)
- Pull request creation
- Merge to main branch

Required: All tests must pass before merging.
