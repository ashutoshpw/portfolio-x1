# Website Audit Tool

This directory contains a comprehensive website audit tool built with Puppeteer and TypeScript.

## Purpose

The audit tool analyzes websites for:
- 🔗 **Broken Links** - Identifies non-working links
- 🎨 **Visual Design Issues** - Detects inconsistencies in colors, fonts, buttons, and spacing
- 🧭 **Navigation Problems** - Tests navigation functionality and user flow
- 🔎 **SEO Issues** - Analyzes meta tags, headings, structured data, and more

## Usage

### Quick Start

```bash
npm run audit-website
```

This will audit the default target URL (https://appreviewbot.com) and generate:
- A detailed markdown report in `audit-reports/`
- Screenshots in `audit-reports/screenshots/`

### Modifying the Target URL

To audit a different website, edit `scripts/audit-website.ts` and change the `TARGET_URL` constant:

```typescript
const TARGET_URL = 'https://your-website.com';
```

## Features

### 1. Broken Link Detection
- Crawls all links on the page
- Tests each link with HEAD requests
- Reports HTTP status codes
- Identifies unreachable links
- Skips mailto:, tel:, and anchor links

### 2. Visual Consistency Analysis
- **Color Palette Analysis** - Counts unique colors used
- **Typography Check** - Identifies font families and sizes
- **Button Consistency** - Detects variations in button styles
- **Spacing Audit** - Analyzes margin and padding patterns
- **Alt Text Validation** - Finds images without alt attributes
- **Responsive Testing** - Captures screenshots at multiple viewports:
  - Mobile (375x667)
  - Tablet (768x1024)
  - Desktop (1920x1080)

### 3. Navigation Testing
- Tests all navigation links
- Verifies pages load successfully
- Checks for mobile menu elements
- Validates navigation structure

### 4. SEO Analysis
Comprehensive SEO checks including:
- Title tag (length and presence)
- Meta description (length and presence)
- Heading structure (H1 validation)
- Open Graph tags (og:title, og:description, og:image)
- Twitter Card tags
- Canonical URL
- Structured data (Schema.org)
- Viewport meta tag
- Language attribute
- HTTPS usage
- Image alt text coverage
- Internal linking structure
- Content length

## Output

### Report Structure

Each audit generates a timestamped markdown report with:

1. **Executive Summary** - High-level overview of findings
2. **Broken Links** - Table of all broken links with status codes
3. **Visual Design Issues** - Categorized visual problems
4. **Navigation Issues** - Navigation problems with expected vs actual behavior
5. **SEO Issues** - Categorized by severity (Critical, Warning, Info)
6. **Recommendations** - Prioritized action items

### Screenshots

Screenshots are automatically captured at multiple viewports:
- `full-page.png` - Complete page screenshot
- `mobile.png` - Mobile view (375x667)
- `tablet.png` - Tablet view (768x1024)
- `desktop.png` - Desktop view (1920x1080)

## Technical Details

### Dependencies

- **puppeteer** - Headless browser automation
- **tsx** - TypeScript execution
- **@types/node** - Node.js type definitions

### File Structure

```
scripts/
└── audit-website.ts    # Main audit script

audit-reports/          # Generated reports (gitignored)
├── audit-report-[timestamp].md
└── screenshots/
    ├── full-page.png
    ├── mobile.png
    ├── tablet.png
    └── desktop.png
```

### How It Works

1. **Initialization**
   - Creates output directories
   - Launches headless browser

2. **Page Load**
   - Navigates to target URL
   - Waits for network idle

3. **Checks Execution**
   - Runs all audit checks in parallel where possible
   - Collects findings from each check

4. **Report Generation**
   - Compiles all findings
   - Generates markdown report
   - Saves screenshots

5. **Cleanup**
   - Closes browser
   - Outputs summary to console

## Customization

### Modifying Checks

Each check is implemented as a separate async function:
- `checkBrokenLinks(page: Page)`
- `checkVisualConsistency(page: Page)`
- `checkNavigation(page: Page, browser: Browser)`
- `checkSEO(page: Page)`

To add or modify checks, edit these functions in `audit-website.ts`.

### Adjusting Thresholds

You can customize detection thresholds in the respective check functions:

```typescript
// Example: Adjust color count threshold
if (colors.size > 20) {  // Change this number
  problems.push({
    type: 'Color Inconsistency',
    description: `Found ${colors.size} unique colors...`,
    location: 'Global'
  });
}
```

### Adding New Viewports

To test additional screen sizes, modify the `viewports` array in `checkVisualConsistency()`:

```typescript
const viewports = [
  { width: 375, height: 667, name: 'Mobile' },
  { width: 768, height: 1024, name: 'Tablet' },
  { width: 1920, height: 1080, name: 'Desktop' },
  { width: 2560, height: 1440, name: '4K' }  // Add new viewport
];
```

## Best Practices

1. **Run Regularly** - Schedule periodic audits to catch issues early
2. **Version Control Reports** - Keep audit reports for historical comparison
3. **Prioritize Findings** - Focus on critical and high-priority issues first
4. **Validate Manually** - Automated tools can have false positives
5. **Track Progress** - Use reports to measure improvement over time

## Limitations

- Cannot test functionality requiring authentication
- JavaScript-heavy sites may need longer wait times
- Some dynamic content might not be captured
- External API calls might fail in certain environments
- Relative URLs in navigation need proper base URL context

## Troubleshooting

### Browser Launch Fails
```bash
# Install Chromium dependencies
npm run postinstall
```

### Timeout Errors
Increase timeout values in the script:
```typescript
await page.goto(TARGET_URL, { 
  waitUntil: 'networkidle0',
  timeout: 60000  // Increase from 30000
});
```

### Network Errors
Check firewall and proxy settings if the script can't reach external URLs.

## Future Enhancements

Potential improvements:
- [ ] Multi-page crawling
- [ ] Performance metrics (Lighthouse integration)
- [ ] Accessibility score (WCAG compliance)
- [ ] Comparison with previous audits
- [ ] HTML report format
- [ ] CI/CD integration
- [ ] Configurable targets via CLI arguments
- [ ] PDF export option

## Contributing

To improve the audit tool:
1. Modify `scripts/audit-website.ts`
2. Test your changes with `npm run audit-website`
3. Update this README if adding new features

## License

This tool is part of the portfolio-x1 project and follows the same license.

---

*For questions or issues with the audit tool, please check the main project documentation.*
