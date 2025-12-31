import * as fs from "node:fs/promises";
import * as path from "node:path";
import puppeteer, { type Browser, type Page } from "puppeteer";

const TARGET_URL = "https://appreviewbot.com";
const REPORT_DIR = path.join(process.cwd(), "audit-reports");
const SCREENSHOTS_DIR = path.join(REPORT_DIR, "screenshots");

interface AuditReport {
  timestamp: string;
  url: string;
  brokenLinks: BrokenLink[];
  visualIssues: VisualIssue[];
  navigationIssues: NavigationIssue[];
  seoIssues: SEOIssue[];
  summary: string;
}

interface BrokenLink {
  url: string;
  status: number | string;
  location: string;
  context: string;
}

interface VisualIssue {
  type: string;
  description: string;
  location: string;
  screenshot?: string;
}

interface NavigationIssue {
  type: string;
  description: string;
  element: string;
  expected: string;
  actual: string;
}

interface SEOIssue {
  type: string;
  severity: "critical" | "warning" | "info";
  description: string;
  recommendation: string;
}

async function setupDirectories() {
  await fs.mkdir(REPORT_DIR, { recursive: true });
  await fs.mkdir(SCREENSHOTS_DIR, { recursive: true });
}

async function checkBrokenLinks(page: Page): Promise<BrokenLink[]> {
  console.log("🔍 Checking for broken links...");

  const brokenLinks: BrokenLink[] = [];

  // Get all links on the page
  const links = await page.evaluate(() => {
    const anchors = Array.from(document.querySelectorAll("a[href]"));
    return anchors.map((a) => ({
      href: (a as HTMLAnchorElement).href,
      text: a.textContent?.trim() || "",
      location: a.getAttribute("href") || "",
    }));
  });

  console.log(`Found ${links.length} links to check`);

  // Check each link
  for (const link of links) {
    try {
      // Skip mailto, tel, and anchor links
      if (
        link.href.startsWith("mailto:") ||
        link.href.startsWith("tel:") ||
        link.href.startsWith("#") ||
        link.location.startsWith("#")
      ) {
        continue;
      }

      const response = await fetch(link.href, {
        method: "HEAD",
        redirect: "follow",
      });

      if (!response.ok) {
        brokenLinks.push({
          url: link.href,
          status: response.status,
          location: link.location,
          context: link.text,
        });
        console.log(`❌ Broken link: ${link.href} (${response.status})`);
      }
    } catch (error) {
      brokenLinks.push({
        url: link.href,
        status: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
        location: link.location,
        context: link.text,
      });
      console.log(`❌ Error checking link: ${link.href}`);
    }
  }

  return brokenLinks;
}

async function checkVisualConsistency(page: Page): Promise<VisualIssue[]> {
  console.log("🎨 Checking visual design consistency...");

  const visualIssues: VisualIssue[] = [];

  // Take full page screenshot
  const screenshotPath = path.join(SCREENSHOTS_DIR, "full-page.png");
  await page.screenshot({
    path: screenshotPath,
    fullPage: true,
  });
  console.log(`📸 Full page screenshot saved`);

  // Check for various visual consistency issues
  const issues = await page.evaluate(() => {
    const problems: { type: string; description: string; location: string }[] =
      [];

    // Check for inconsistent colors
    const elements = document.querySelectorAll("*");
    const colors = new Map<string, number>();
    const fontFamilies = new Map<string, number>();
    const fontSizes = new Map<string, number>();

    elements.forEach((el) => {
      const styles = window.getComputedStyle(el);

      // Track colors
      const color = styles.color;
      const bgColor = styles.backgroundColor;
      if (color && color !== "rgba(0, 0, 0, 0)") {
        colors.set(color, (colors.get(color) || 0) + 1);
      }
      if (bgColor && bgColor !== "rgba(0, 0, 0, 0)") {
        colors.set(bgColor, (colors.get(bgColor) || 0) + 1);
      }

      // Track fonts
      const fontFamily = styles.fontFamily;
      if (fontFamily) {
        fontFamilies.set(fontFamily, (fontFamilies.get(fontFamily) || 0) + 1);
      }

      // Track font sizes
      const fontSize = styles.fontSize;
      if (fontSize) {
        fontSizes.set(fontSize, (fontSizes.get(fontSize) || 0) + 1);
      }
    });

    // Report if too many unique colors (might indicate inconsistency)
    if (colors.size > 20) {
      problems.push({
        type: "Color Inconsistency",
        description: `Found ${colors.size} unique colors. Consider using a more consistent color palette.`,
        location: "Global",
      });
    }

    // Report if too many font families
    if (fontFamilies.size > 5) {
      problems.push({
        type: "Font Inconsistency",
        description: `Found ${fontFamilies.size} different font families. Consider limiting to 2-3 fonts.`,
        location: "Global",
      });
    }

    // Report if too many font sizes
    if (fontSizes.size > 15) {
      problems.push({
        type: "Typography Inconsistency",
        description: `Found ${fontSizes.size} different font sizes. Consider using a consistent type scale.`,
        location: "Global",
      });
    }

    // Check for missing alt text on images
    const images = Array.from(document.querySelectorAll("img"));
    images.forEach((img, index) => {
      if (!img.alt || img.alt.trim() === "") {
        problems.push({
          type: "Accessibility Issue",
          description: `Image without alt text: ${img.src}`,
          location: `Image #${index + 1}`,
        });
      }
    });

    // Check for inconsistent button styles
    const buttons = Array.from(
      document.querySelectorAll('button, a.btn, a[class*="button"]'),
    );
    const buttonStyles = new Set<string>();
    buttons.forEach((btn) => {
      const styles = window.getComputedStyle(btn);
      const styleKey = `${styles.padding}-${styles.borderRadius}-${styles.backgroundColor}`;
      buttonStyles.add(styleKey);
    });

    if (buttonStyles.size > 5 && buttons.length > 5) {
      problems.push({
        type: "Button Inconsistency",
        description: `Found ${buttonStyles.size} different button styles. Consider using consistent button designs.`,
        location: "Global",
      });
    }

    // Check for spacing inconsistencies
    const sections = Array.from(
      document.querySelectorAll('section, div[class*="section"]'),
    );
    const margins = new Set<string>();
    sections.forEach((section) => {
      const styles = window.getComputedStyle(section);
      margins.add(`${styles.marginTop}-${styles.marginBottom}`);
    });

    if (margins.size > 10 && sections.length > 5) {
      problems.push({
        type: "Spacing Inconsistency",
        description: `Found ${margins.size} different spacing patterns. Consider using a consistent spacing system.`,
        location: "Global",
      });
    }

    return problems;
  });

  visualIssues.push(
    ...issues.map((issue) => ({
      ...issue,
      screenshot: "full-page.png",
    })),
  );

  // Check for responsive design issues
  const viewports = [
    { width: 375, height: 667, name: "Mobile" },
    { width: 768, height: 1024, name: "Tablet" },
    { width: 1920, height: 1080, name: "Desktop" },
  ];

  for (const viewport of viewports) {
    await page.setViewport(viewport);
    const screenshotName = `${viewport.name.toLowerCase()}.png`;
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, screenshotName),
      fullPage: false,
    });
    console.log(`📸 ${viewport.name} screenshot saved`);

    // Check for overflow issues
    const overflow = await page.evaluate(() => {
      const body = document.body;
      return {
        hasHorizontalScroll: body.scrollWidth > body.clientWidth,
        hasHiddenContent: Array.from(document.querySelectorAll("*")).some(
          (el) => {
            const rect = el.getBoundingClientRect();
            return rect.right > window.innerWidth || rect.left < 0;
          },
        ),
      };
    });

    if (overflow.hasHorizontalScroll) {
      visualIssues.push({
        type: "Responsive Design Issue",
        description: `Horizontal scroll detected on ${viewport.name} viewport (${viewport.width}x${viewport.height})`,
        location: viewport.name,
        screenshot: screenshotName,
      });
    }
  }

  return visualIssues;
}

async function checkNavigation(
  page: Page,
  browser: Browser,
): Promise<NavigationIssue[]> {
  console.log("🧭 Checking navigation functionality...");

  const navigationIssues: NavigationIssue[] = [];

  // Check main navigation links
  const navLinks = await page.evaluate(() => {
    const nav =
      document.querySelector("nav") || document.querySelector("header");
    if (!nav) return [];

    const links = Array.from(nav.querySelectorAll("a"));
    return links.map((link) => ({
      text: link.textContent?.trim() || "",
      href: link.getAttribute("href") || "",
      isExternal: link.getAttribute("target") === "_blank",
    }));
  });

  console.log(`Found ${navLinks.length} navigation links`);

  // Test each navigation link
  for (const link of navLinks) {
    if (
      link.href.startsWith("#") ||
      link.href.startsWith("mailto:") ||
      link.href.startsWith("tel:")
    ) {
      continue;
    }

    try {
      const newPage = await browser.newPage();

      const response = await newPage.goto(link.href, {
        waitUntil: "networkidle0",
        timeout: 10000,
      });

      if (!response || !response.ok()) {
        navigationIssues.push({
          type: "Navigation Link Error",
          description: `Navigation link "${link.text}" leads to an error`,
          element: link.href,
          expected: "200 OK",
          actual: response ? `${response.status()}` : "Failed to load",
        });
      }

      await newPage.close();
    } catch (error) {
      navigationIssues.push({
        type: "Navigation Link Error",
        description: `Navigation link "${link.text}" failed to load`,
        element: link.href,
        expected: "Page loads successfully",
        actual: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  // Check for back button functionality
  await page.goto(TARGET_URL);

  // Check for menu toggles (mobile menu)
  const menuToggleExists = await page.evaluate(() => {
    const toggles = document.querySelectorAll(
      '[class*="menu-toggle"], [class*="hamburger"], button[aria-label*="menu" i]',
    );
    return toggles.length > 0;
  });

  if (!menuToggleExists) {
    navigationIssues.push({
      type: "Mobile Navigation",
      description: "No mobile menu toggle found",
      element: "Menu Toggle",
      expected: "Mobile menu toggle button should exist",
      actual: "No menu toggle found",
    });
  }

  // Check for breadcrumbs
  const hasBreadcrumbs = await page.evaluate(() => {
    const breadcrumbs = document.querySelector(
      '[aria-label*="breadcrumb" i], .breadcrumb, nav[class*="breadcrumb"]',
    );
    return breadcrumbs !== null;
  });

  if (!hasBreadcrumbs && navLinks.length > 5) {
    navigationIssues.push({
      type: "Navigation Enhancement",
      description: "No breadcrumbs found on the site",
      element: "Breadcrumbs",
      expected: "Breadcrumbs for better navigation",
      actual: "No breadcrumbs present",
    });
  }

  return navigationIssues;
}

async function checkSEO(page: Page): Promise<SEOIssue[]> {
  console.log("🔎 Analyzing SEO...");

  const seoIssues: SEOIssue[] = [];

  const seoData = await page.evaluate(() => {
    const data: Record<string, unknown> = {
      // Meta tags
      title: document.title,
      metaDescription: document
        .querySelector('meta[name="description"]')
        ?.getAttribute("content"),
      metaKeywords: document
        .querySelector('meta[name="keywords"]')
        ?.getAttribute("content"),
      metaRobots: document
        .querySelector('meta[name="robots"]')
        ?.getAttribute("content"),
      canonicalUrl: document
        .querySelector('link[rel="canonical"]')
        ?.getAttribute("href"),

      // Open Graph
      ogTitle: document
        .querySelector('meta[property="og:title"]')
        ?.getAttribute("content"),
      ogDescription: document
        .querySelector('meta[property="og:description"]')
        ?.getAttribute("content"),
      ogImage: document
        .querySelector('meta[property="og:image"]')
        ?.getAttribute("content"),
      ogUrl: document
        .querySelector('meta[property="og:url"]')
        ?.getAttribute("content"),

      // Twitter Card
      twitterCard: document
        .querySelector('meta[name="twitter:card"]')
        ?.getAttribute("content"),
      twitterTitle: document
        .querySelector('meta[name="twitter:title"]')
        ?.getAttribute("content"),
      twitterDescription: document
        .querySelector('meta[name="twitter:description"]')
        ?.getAttribute("content"),
      twitterImage: document
        .querySelector('meta[name="twitter:image"]')
        ?.getAttribute("content"),

      // Structured data
      hasStructuredData:
        Array.from(
          document.querySelectorAll('script[type="application/ld+json"]'),
        ).length > 0,

      // Headings
      h1Count: document.querySelectorAll("h1").length,
      h1Text: Array.from(document.querySelectorAll("h1")).map((h) =>
        h.textContent?.trim(),
      ),

      // Images
      imagesWithoutAlt: Array.from(
        document.querySelectorAll('img:not([alt]), img[alt=""]'),
      ).length,
      totalImages: document.querySelectorAll("img").length,

      // Links
      internalLinks: Array.from(
        document.querySelectorAll(
          `a[href^="/"], a[href^="${window.location.origin}"]`,
        ),
      ).length,
      externalLinks: Array.from(
        document.querySelectorAll('a[href^="http"]'),
      ).filter(
        (a) => !a.getAttribute("href")?.startsWith(window.location.origin),
      ).length,

      // Mobile
      viewport: document
        .querySelector('meta[name="viewport"]')
        ?.getAttribute("content"),

      // Performance hints
      hasLazyLoading:
        Array.from(document.querySelectorAll('img[loading="lazy"]')).length > 0,

      // Security
      hasHttps: window.location.protocol === "https:",

      // Content
      wordCount: document.body.textContent?.split(/\s+/).length || 0,

      // Language
      htmlLang: document.documentElement.lang,
    };

    return data;
  });

  // Check title
  if (!seoData.title || typeof seoData.title !== "string") {
    seoIssues.push({
      type: "Missing Title",
      severity: "critical",
      description: "Page title is missing",
      recommendation: "Add a descriptive page title (50-60 characters)",
    });
  } else if (seoData.title.length > 60) {
    seoIssues.push({
      type: "Title Too Long",
      severity: "warning",
      description: `Page title is ${seoData.title.length} characters long`,
      recommendation:
        "Keep page title under 60 characters for optimal display in search results",
    });
  } else if (seoData.title.length < 30) {
    seoIssues.push({
      type: "Title Too Short",
      severity: "warning",
      description: `Page title is only ${seoData.title.length} characters long`,
      recommendation:
        "Consider a more descriptive title (aim for 50-60 characters)",
    });
  }

  // Check meta description
  if (!seoData.metaDescription) {
    seoIssues.push({
      type: "Missing Meta Description",
      severity: "critical",
      description: "Meta description is missing",
      recommendation: "Add a compelling meta description (150-160 characters)",
    });
  } else if (
    typeof seoData.metaDescription === "string" &&
    seoData.metaDescription.length > 160
  ) {
    seoIssues.push({
      type: "Meta Description Too Long",
      severity: "warning",
      description: `Meta description is ${seoData.metaDescription.length} characters`,
      recommendation: "Keep meta description under 160 characters",
    });
  }

  // Check H1 tags
  if (typeof seoData.h1Count === "number" && seoData.h1Count === 0) {
    seoIssues.push({
      type: "Missing H1",
      severity: "critical",
      description: "No H1 heading found on the page",
      recommendation:
        "Add exactly one H1 heading that describes the main content",
    });
  } else if (typeof seoData.h1Count === "number" && seoData.h1Count > 1) {
    seoIssues.push({
      type: "Multiple H1 Tags",
      severity: "warning",
      description: `Found ${seoData.h1Count} H1 tags on the page`,
      recommendation: "Use only one H1 tag per page for better SEO",
    });
  }

  // Check Open Graph
  if (!seoData.ogTitle) {
    seoIssues.push({
      type: "Missing Open Graph Title",
      severity: "warning",
      description: "Open Graph title is missing",
      recommendation: "Add og:title meta tag for better social media sharing",
    });
  }

  if (!seoData.ogDescription) {
    seoIssues.push({
      type: "Missing Open Graph Description",
      severity: "warning",
      description: "Open Graph description is missing",
      recommendation:
        "Add og:description meta tag for better social media sharing",
    });
  }

  if (!seoData.ogImage) {
    seoIssues.push({
      type: "Missing Open Graph Image",
      severity: "warning",
      description: "Open Graph image is missing",
      recommendation: "Add og:image meta tag (recommended size: 1200x630px)",
    });
  }

  // Check Twitter Card
  if (!seoData.twitterCard) {
    seoIssues.push({
      type: "Missing Twitter Card",
      severity: "info",
      description: "Twitter Card meta tags are missing",
      recommendation: "Add Twitter Card meta tags for better Twitter sharing",
    });
  }

  // Check canonical URL
  if (!seoData.canonicalUrl) {
    seoIssues.push({
      type: "Missing Canonical URL",
      severity: "warning",
      description: "Canonical URL is not set",
      recommendation:
        "Add a canonical link tag to prevent duplicate content issues",
    });
  }

  // Check structured data
  if (!seoData.hasStructuredData) {
    seoIssues.push({
      type: "Missing Structured Data",
      severity: "info",
      description: "No structured data (Schema.org) found",
      recommendation:
        "Add structured data markup for better search engine understanding",
    });
  }

  // Check viewport
  if (!seoData.viewport) {
    seoIssues.push({
      type: "Missing Viewport Meta Tag",
      severity: "critical",
      description: "Viewport meta tag is missing",
      recommendation: "Add viewport meta tag for mobile responsiveness",
    });
  }

  // Check images
  if (
    typeof seoData.imagesWithoutAlt === "number" &&
    typeof seoData.totalImages === "number" &&
    seoData.imagesWithoutAlt > 0
  ) {
    seoIssues.push({
      type: "Images Without Alt Text",
      severity: "warning",
      description: `${seoData.imagesWithoutAlt} out of ${seoData.totalImages} images are missing alt text`,
      recommendation:
        "Add descriptive alt text to all images for accessibility and SEO",
    });
  }

  // Check HTTPS
  if (!seoData.hasHttps) {
    seoIssues.push({
      type: "Not Using HTTPS",
      severity: "critical",
      description: "Website is not using HTTPS",
      recommendation: "Switch to HTTPS for security and SEO benefits",
    });
  }

  // Check language attribute
  if (!seoData.htmlLang) {
    seoIssues.push({
      type: "Missing Language Attribute",
      severity: "warning",
      description: "HTML lang attribute is missing",
      recommendation: 'Add lang attribute to <html> tag (e.g., lang="en")',
    });
  }

  // Check content length
  if (typeof seoData.wordCount === "number" && seoData.wordCount < 300) {
    seoIssues.push({
      type: "Thin Content",
      severity: "info",
      description: `Page has only ${seoData.wordCount} words`,
      recommendation:
        "Consider adding more substantial content (aim for 300+ words)",
    });
  }

  // Check internal linking
  if (typeof seoData.internalLinks === "number" && seoData.internalLinks < 3) {
    seoIssues.push({
      type: "Limited Internal Links",
      severity: "info",
      description: `Only ${seoData.internalLinks} internal links found`,
      recommendation:
        "Add more internal links to improve site structure and navigation",
    });
  }

  return seoIssues;
}

async function generateReport(report: AuditReport) {
  console.log("📝 Generating report...");

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const reportPath = path.join(REPORT_DIR, `audit-report-${timestamp}.md`);

  let markdown = `# Website Audit Report: ${report.url}\n\n`;
  markdown += `**Generated:** ${report.timestamp}\n\n`;
  markdown += `---\n\n`;

  // Executive Summary
  markdown += `## Executive Summary\n\n`;
  markdown += `${report.summary}\n\n`;
  markdown += `---\n\n`;

  // Broken Links
  markdown += `## 🔗 Broken Links (${report.brokenLinks.length} issues)\n\n`;
  if (report.brokenLinks.length === 0) {
    markdown += `✅ No broken links found!\n\n`;
  } else {
    markdown += `| URL | Status | Location | Context |\n`;
    markdown += `|-----|--------|----------|----------|\n`;
    for (const link of report.brokenLinks) {
      markdown += `| ${link.url} | ${link.status} | ${link.location} | ${link.context} |\n`;
    }
    markdown += `\n`;
  }
  markdown += `---\n\n`;

  // Visual Issues
  markdown += `## 🎨 Visual Design Issues (${report.visualIssues.length} issues)\n\n`;
  if (report.visualIssues.length === 0) {
    markdown += `✅ No visual consistency issues detected!\n\n`;
  } else {
    for (const issue of report.visualIssues) {
      markdown += `### ${issue.type}\n`;
      markdown += `- **Location:** ${issue.location}\n`;
      markdown += `- **Description:** ${issue.description}\n`;
      if (issue.screenshot) {
        markdown += `- **Screenshot:** \`screenshots/${issue.screenshot}\`\n`;
      }
      markdown += `\n`;
    }
  }
  markdown += `---\n\n`;

  // Navigation Issues
  markdown += `## 🧭 Navigation Issues (${report.navigationIssues.length} issues)\n\n`;
  if (report.navigationIssues.length === 0) {
    markdown += `✅ No navigation issues found!\n\n`;
  } else {
    for (const issue of report.navigationIssues) {
      markdown += `### ${issue.type}\n`;
      markdown += `- **Element:** ${issue.element}\n`;
      markdown += `- **Description:** ${issue.description}\n`;
      markdown += `- **Expected:** ${issue.expected}\n`;
      markdown += `- **Actual:** ${issue.actual}\n`;
      markdown += `\n`;
    }
  }
  markdown += `---\n\n`;

  // SEO Issues
  markdown += `## 🔎 SEO Issues (${report.seoIssues.length} issues)\n\n`;
  if (report.seoIssues.length === 0) {
    markdown += `✅ No SEO issues found!\n\n`;
  } else {
    const critical = report.seoIssues.filter((i) => i.severity === "critical");
    const warnings = report.seoIssues.filter((i) => i.severity === "warning");
    const info = report.seoIssues.filter((i) => i.severity === "info");

    if (critical.length > 0) {
      markdown += `### 🚨 Critical Issues (${critical.length})\n\n`;
      for (const issue of critical) {
        markdown += `#### ${issue.type}\n`;
        markdown += `- **Description:** ${issue.description}\n`;
        markdown += `- **Recommendation:** ${issue.recommendation}\n`;
        markdown += `\n`;
      }
    }

    if (warnings.length > 0) {
      markdown += `### ⚠️ Warnings (${warnings.length})\n\n`;
      for (const issue of warnings) {
        markdown += `#### ${issue.type}\n`;
        markdown += `- **Description:** ${issue.description}\n`;
        markdown += `- **Recommendation:** ${issue.recommendation}\n`;
        markdown += `\n`;
      }
    }

    if (info.length > 0) {
      markdown += `### ℹ️ Informational (${info.length})\n\n`;
      for (const issue of info) {
        markdown += `#### ${issue.type}\n`;
        markdown += `- **Description:** ${issue.description}\n`;
        markdown += `- **Recommendation:** ${issue.recommendation}\n`;
        markdown += `\n`;
      }
    }
  }
  markdown += `---\n\n`;

  // Recommendations
  markdown += `## 📋 Summary of Recommendations\n\n`;
  markdown += `### Priority Actions\n\n`;
  const criticalSEO = report.seoIssues.filter((i) => i.severity === "critical");
  if (criticalSEO.length > 0) {
    markdown += `1. **Address Critical SEO Issues:**\n`;
    for (const issue of criticalSEO) {
      markdown += `   - ${issue.type}: ${issue.recommendation}\n`;
    }
  }
  if (report.brokenLinks.length > 0) {
    markdown += `2. **Fix Broken Links:** ${report.brokenLinks.length} broken links need attention\n`;
  }
  if (report.visualIssues.length > 0) {
    markdown += `3. **Improve Visual Consistency:** ${report.visualIssues.length} visual issues detected\n`;
  }
  if (report.navigationIssues.length > 0) {
    markdown += `4. **Enhance Navigation:** ${report.navigationIssues.length} navigation improvements needed\n`;
  }
  markdown += `\n`;

  markdown += `### Screenshots\n\n`;
  markdown += `All screenshots have been saved to the \`screenshots/\` directory:\n`;
  markdown += `- Full page screenshot\n`;
  markdown += `- Mobile viewport (375x667)\n`;
  markdown += `- Tablet viewport (768x1024)\n`;
  markdown += `- Desktop viewport (1920x1080)\n`;
  markdown += `\n`;

  markdown += `---\n\n`;
  markdown += `*This report was generated automatically using Puppeteer*\n`;

  await fs.writeFile(reportPath, markdown);
  console.log(`✅ Report saved to: ${reportPath}`);

  return reportPath;
}

async function runAudit() {
  console.log(`🚀 Starting audit for ${TARGET_URL}\n`);

  await setupDirectories();

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    console.log(`📄 Navigating to ${TARGET_URL}...`);
    await page.goto(TARGET_URL, {
      waitUntil: "networkidle0",
      timeout: 30000,
    });
    console.log(`✅ Page loaded successfully\n`);

    // Run all checks
    const brokenLinks = await checkBrokenLinks(page);
    console.log(`\n`);

    const visualIssues = await checkVisualConsistency(page);
    console.log(`\n`);

    const navigationIssues = await checkNavigation(page, browser);
    console.log(`\n`);

    const seoIssues = await checkSEO(page);
    console.log(`\n`);

    // Generate summary
    const totalIssues =
      brokenLinks.length +
      visualIssues.length +
      navigationIssues.length +
      seoIssues.length;

    const summary =
      `This audit identified ${totalIssues} total issues across the website:\n\n` +
      `- **Broken Links:** ${brokenLinks.length} issues\n` +
      `- **Visual Design:** ${visualIssues.length} issues\n` +
      `- **Navigation:** ${navigationIssues.length} issues\n` +
      `- **SEO:** ${seoIssues.length} issues (${seoIssues.filter((i) => i.severity === "critical").length} critical)\n\n` +
      `The most critical areas requiring attention are:\n` +
      `${seoIssues.filter((i) => i.severity === "critical").length > 0 ? "1. Critical SEO issues that affect search engine visibility\n" : ""}` +
      `${brokenLinks.length > 0 ? `2. Broken links that harm user experience and SEO\n` : ""}` +
      `${visualIssues.length > 5 ? `3. Multiple visual consistency issues\n` : ""}` +
      `${navigationIssues.length > 0 ? `4. Navigation problems affecting usability\n` : ""}`;

    const report: AuditReport = {
      timestamp: new Date().toLocaleString(),
      url: TARGET_URL,
      brokenLinks,
      visualIssues,
      navigationIssues,
      seoIssues,
      summary,
    };

    const reportPath = await generateReport(report);

    console.log(`\n${"=".repeat(60)}`);
    console.log(`🎉 Audit Complete!`);
    console.log(`${"=".repeat(60)}\n`);
    console.log(`📊 Total Issues Found: ${totalIssues}`);
    console.log(`   - Broken Links: ${brokenLinks.length}`);
    console.log(`   - Visual Issues: ${visualIssues.length}`);
    console.log(`   - Navigation Issues: ${navigationIssues.length}`);
    console.log(`   - SEO Issues: ${seoIssues.length}\n`);
    console.log(`📁 Report saved to: ${reportPath}`);
    console.log(`📸 Screenshots saved to: ${SCREENSHOTS_DIR}\n`);
  } catch (error) {
    console.error("❌ Error during audit:", error);
    throw error;
  } finally {
    await browser.close();
  }
}

// Run the audit
runAudit().catch(console.error);
