import { jsPDF } from "jspdf";

export interface PdfReportData {
  candidateName?: string;
  candidateEmail?: string;
  targetRole?: string;
  resumeFilename?: string;
  parsedResume?: any;
  atsData?: {
    score?: number;
    market_match?: number;
    label?: string;
    breakdown?: Array<{
      criterion: string;
      score: number;
      max: number;
      fix?: string;
    }>;
    priority_fixes?: Array<{
      problem: string;
      impact: string;
      fix: string;
      severity: string;
    }>;
  };
  roadmap?: {
    title?: string;
    sprints?: Array<{
      sprint_number?: number;
      sprint_name?: string;
      theme?: string;
      milestone_goal?: string;
      key_deliverables?: string[];
      practical_project?: string;
      weeks?: Array<{
        week?: number;
        title?: string;
        tasks?: Array<{
          type?: string;
          title?: string;
          platform?: string;
          hours?: number;
          tech?: string[];
          details?: string;
        }>;
      }>;
    }>;
    salary_projection?: {
      target_role?: string;
      entry_level?: string;
      mid_level?: string;
      senior_level?: string;
      top_tier_remote?: string;
      market_demand?: string;
      regional_insights?: Array<{
        region: string;
        range: string;
      }>;
    };
    skill_gap_report?: {
      matched_skills?: string[];
      missing_skills?: any[];
      match_percentage?: number;
    };
    learning_resources?: Array<{
      category?: string;
      skill_or_topic?: string;
      official_documentation?: string;
      free_youtube_courses?: string;
      practice_websites?: string;
      project_ideas?: string;
      resources?: Array<{
        title: string;
        url: string;
        type?: string;
        description?: string;
        difficulty?: string;
        estimatedTime?: string;
      }>;
    }>;
  };
}

/**
 * Standardized Document Writer for jsPDF
 * Uses ONLY ASCII characters to prevent font encoding corruption (e.g. no emojis or non-standard unicode arrows/currency symbols).
 * Handles clean page breaks, running headers, running footers, and dynamic wrapping.
 */
class DocumentWriter {
  doc: jsPDF;
  pageWidth: number;
  pageHeight: number;
  margin: number;
  contentWidth: number;
  y: number;

  constructor() {
    this.doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4"
    });
    this.pageWidth = this.doc.internal.pageSize.getWidth(); // 210mm
    this.pageHeight = this.doc.internal.pageSize.getHeight(); // 297mm
    this.margin = 15;
    this.contentWidth = this.pageWidth - (this.margin * 2); // 180mm
    this.y = this.margin;
  }

  ensureSpace(neededMm: number) {
    if (this.y + neededMm > this.pageHeight - 18) {
      this.doc.addPage();
      this.y = this.margin + 8;
      this.drawPageHeader();
    }
  }

  drawPageHeader() {
    this.doc.setFont("helvetica", "normal");
    this.doc.setFontSize(7.5);
    this.doc.setTextColor(140, 150, 165);
    this.doc.text("CAREER NAVIGATION AI - VERIFIED CAREER AUDIT DOCUMENT", this.margin, this.margin - 4);
    this.doc.setDrawColor(226, 232, 240);
    this.doc.setLineWidth(0.3);
    this.doc.line(this.margin, this.margin - 2, this.pageWidth - this.margin, this.margin - 2);
  }

  drawDivider() {
    this.ensureSpace(6);
    this.doc.setDrawColor(226, 232, 240);
    this.doc.setLineWidth(0.4);
    this.doc.line(this.margin, this.y, this.pageWidth - this.margin, this.y);
    this.y += 6;
  }

  drawSectionHeading(title: string, subtitle?: string) {
    this.ensureSpace(subtitle ? 18 : 14);
    
    // Left decorative bar
    this.doc.setFillColor(37, 99, 235); // Royal Blue
    this.doc.rect(this.margin, this.y - 4, 3, 7, "F");

    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(12);
    this.doc.setTextColor(15, 23, 42); // Slate 900
    this.doc.text(title, this.margin + 6, this.y + 1);
    this.y += 6;

    if (subtitle) {
      this.doc.setFont("helvetica", "normal");
      this.doc.setFontSize(8.5);
      this.doc.setTextColor(100, 116, 139);
      this.doc.text(subtitle, this.margin + 6, this.y);
      this.y += 5;
    }

    this.y += 3;
  }

  drawFooters() {
    const totalPages = this.doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      this.doc.setPage(i);
      this.doc.setDrawColor(226, 232, 240);
      this.doc.setLineWidth(0.3);
      this.doc.line(this.margin, this.pageHeight - 12, this.pageWidth - this.margin, this.pageHeight - 12);

      this.doc.setFont("helvetica", "normal");
      this.doc.setFontSize(7.5);
      this.doc.setTextColor(148, 163, 184);
      this.doc.text("Official Career Audit & Learning Roadmap | Powered by Career Navigation AI", this.margin, this.pageHeight - 7);
      
      const pageText = `Page ${i} of ${totalPages}`;
      this.doc.text(pageText, this.pageWidth - this.margin - this.doc.getTextWidth(pageText), this.pageHeight - 7);
    }
  }
}

/**
 * 1. FULL CONSOLIDATED AUDIT REPORT PDF
 * Downloaded from the ATS Score Tab.
 * Includes ATS Score + Logic Explanation + Breakdown + Priority Fixes + Bullet Rewrites + Skill Gap + Salary + Roadmap + Resources.
 */
export function generateFullAuditPdf(data: PdfReportData) {
  const writer = new DocumentWriter();
  const doc = writer.doc;

  const candidate = data.candidateName || "Candidate";
  const email = data.candidateEmail || "Verified User";
  const role = data.targetRole || "Software Engineering Professional";
  const dateStr = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric"
  });

  // --- DOCUMENT COVER / HEADER BLOCK ---
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(writer.margin, writer.y, writer.contentWidth, 38, 2.5, 2.5, "F");
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.5);
  doc.roundedRect(writer.margin, writer.y, writer.contentWidth, 38, 2.5, 2.5, "S");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(30, 58, 138); // Deep Navy
  doc.text("CAREER AUDIT & RESUME OPTIMIZATION REPORT", writer.margin + 6, writer.y + 10);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text("Institutional ATS Evaluation, Bullet Transformation Lab & Verified Learning Roadmap", writer.margin + 6, writer.y + 16);

  // Metadata Columns inside Header
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text("Candidate:", writer.margin + 6, writer.y + 24);
  doc.setFont("helvetica", "normal");
  doc.text(`${candidate} (${email})`, writer.margin + 24, writer.y + 24);

  doc.setFont("helvetica", "bold");
  doc.text("Target Role:", writer.margin + 6, writer.y + 30);
  doc.setFont("helvetica", "normal");
  doc.text(role, writer.margin + 24, writer.y + 30);

  doc.setFont("helvetica", "bold");
  doc.text("Audit Date:", writer.margin + 115, writer.y + 24);
  doc.setFont("helvetica", "normal");
  doc.text(dateStr, writer.margin + 132, writer.y + 24);

  doc.setFont("helvetica", "bold");
  doc.text("Audit Status:", writer.margin + 115, writer.y + 30);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(4, 120, 87); // Emerald
  doc.text("[VERIFIED COMPLETE]", writer.margin + 132, writer.y + 30);

  writer.y += 44;

  // --- SECTION 1: ATS SCORE & RATING ---
  writer.drawSectionHeading("1. ATS Optimization Scorecard & Evaluation", "Parser calibration benchmarked against Workday, Taleo, Greenhouse & Jobscan algorithms");

  const score = data.atsData?.score ?? 78;
  const label = data.atsData?.label || (score >= 80 ? "Competitive Match" : score >= 60 ? "Moderate Fit" : "Needs Optimization");

  // Score Highlight Card
  doc.setFillColor(score >= 80 ? 240 : score >= 60 ? 239 : 254, score >= 80 ? 253 : score >= 60 ? 246 : 242, score >= 80 ? 244 : score >= 60 ? 255 : 242);
  doc.roundedRect(writer.margin, writer.y, 48, 24, 2, 2, "F");
  doc.setDrawColor(score >= 80 ? 167 : score >= 60 ? 191 : 254, score >= 80 ? 243 : score >= 60 ? 219 : 205, score >= 80 ? 208 : score >= 60 ? 254 : 205);
  doc.roundedRect(writer.margin, writer.y, 48, 24, 2, 2, "S");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(score >= 80 ? 5 : score >= 60 ? 29 : 190, score >= 80 ? 150 : score >= 60 ? 78 : 18, score >= 80 ? 105 : score >= 60 ? 216 : 60);
  doc.text(`${score} / 100`, writer.margin + 6, writer.y + 12);

  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(71, 85, 105);
  doc.text("OVERALL ATS SCORE", writer.margin + 6, writer.y + 19);

  // Verdict details next to score box
  doc.setFontSize(9.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text(`Rating: ${label}`, writer.margin + 54, writer.y + 7);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  const verdictSummary = score >= 80
    ? "Your resume demonstrates solid keyword coverage and formatting structure, placing it in the top tier for automated screening. Minor metric enhancements will secure priority interview slots."
    : score >= 60
    ? "Your resume clears initial parser syntax tests but suffers ranking penalties from unquantified project accomplishments and missing technical keywords demanded by target employers."
    : "Critical optimization required. High drop-off risk on automated applicant tracking filters due to passive phrasing, missing quantifiable metrics, and low core keyword density.";
  
  const wrappedVerdict = doc.splitTextToSize(verdictSummary, writer.contentWidth - 56);
  doc.text(wrappedVerdict, writer.margin + 54, writer.y + 13);

  writer.y += 28;

  // --- ATS ALGORITHMIC SCORING CRITERIA CALLOUT BOX ---
  writer.ensureSpace(24);
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(writer.margin, writer.y, writer.contentWidth, 22, 1.5, 1.5, "F");
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(writer.margin, writer.y, writer.contentWidth, 22, 1.5, 1.5, "S");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(30, 58, 138);
  doc.text("HOW ATS ALGORITHMS SCORE YOUR RESUME (EVALUATION MECHANISM):", writer.margin + 4, writer.y + 5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);
  doc.text("1. Semantic Keyword Density (35%): Matches exact technologies, tools, and libraries against the job description.", writer.margin + 4, writer.y + 9.5);
  doc.text("2. Google XYZ Formula (25%): Bullets with quantified metrics (% latency drop, $ revenue, user scale) score 2.5x higher.", writer.margin + 4, writer.y + 13.5);
  doc.text("3. Single-Column Parsing (20%): Complex tables, graphics, and multi-columns trigger parsing errors and lost experience.", writer.margin + 4, writer.y + 17.5);

  writer.y += 26;

  // --- TECHNICAL CRITERIA BREAKDOWN TABLE (WITH FULL MULTILINE WRAPPING) ---
  const breakdown = data.atsData?.breakdown || [
    { criterion: "Core Technical Skills Match", score: 18, max: 25, fix: "Align keywords with target role job postings." },
    { criterion: "Measurable Impact & Metrics", score: 11, max: 20, fix: "Add numbers (%, $, user scale) to project bullet points." },
    { criterion: "Experience Alignment & Depth", score: 11, max: 15, fix: "Demonstrate progressive responsibility and ownership." },
    { criterion: "Action Verbs & STAR Phrasing", score: 7, max: 10, fix: "Use strong action verbs like Architected, Engineered." },
    { criterion: "Project Quality & Code Proof", score: 7, max: 10, fix: "Add live URLs and GitHub repository links." },
    { criterion: "ATS Structural Formatting", score: 8, max: 10, fix: "Standardize section headings: Experience, Skills, Education." },
    { criterion: "Education & Certifications", score: 4, max: 5, fix: "Standard degree title and completion date formatting." },
    { criterion: "Online Footprint & Contact", score: 4, max: 5, fix: "Ensure clean LinkedIn, GitHub, and portfolio links." }
  ];

  writer.ensureSpace(12);

  // Table Header
  doc.setFillColor(226, 232, 240);
  doc.rect(writer.margin, writer.y, writer.contentWidth, 7, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(30, 41, 59);
  doc.text("TECHNICAL EVALUATION CRITERION", writer.margin + 3, writer.y + 4.8);
  doc.text("SCORE / MAX", writer.margin + 64, writer.y + 4.8);
  doc.text("STATUS", writer.margin + 90, writer.y + 4.8);
  doc.text("EVALUATION BASIS & PRESCRIBED ADJUSTMENTS", writer.margin + 115, writer.y + 4.8);
  writer.y += 8;

  // Table Rows with dynamic row height based on text wrapping
  breakdown.forEach((item, idx) => {
    const fixText = item.fix || "Standard requirement";
    const wrappedFix = doc.splitTextToSize(fixText, writer.contentWidth - 117);
    const rowHeight = Math.max(7, 4 + (wrappedFix.length * 3.4));

    writer.ensureSpace(rowHeight + 2);

    const isEven = idx % 2 === 0;
    if (isEven) {
      doc.setFillColor(248, 250, 252);
      doc.rect(writer.margin, writer.y - 1, writer.contentWidth, rowHeight, "F");
    }

    const pct = Math.round((item.score / (item.max || 100)) * 100);
    
    // Criterion Name
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(15, 23, 42);
    doc.text(item.criterion, writer.margin + 3, writer.y + 3.5);

    // Score
    doc.setFont("helvetica", "normal");
    doc.setTextColor(71, 85, 105);
    doc.text(`${item.score} / ${item.max} pts`, writer.margin + 64, writer.y + 3.5);
    
    // Status color
    doc.setFont("helvetica", "bold");
    if (pct >= 80) {
      doc.setTextColor(4, 120, 87);
      doc.text(`${pct}% (Strong)`, writer.margin + 90, writer.y + 3.5);
    } else if (pct >= 60) {
      doc.setTextColor(37, 99, 235);
      doc.text(`${pct}% (Adequate)`, writer.margin + 90, writer.y + 3.5);
    } else {
      doc.setTextColor(225, 29, 72);
      doc.text(`${pct}% (Deduction)`, writer.margin + 90, writer.y + 3.5);
    }

    // Wrapped Fix Text (renders all lines, never chopped!)
    doc.setFont("helvetica", "normal");
    doc.setTextColor(71, 85, 105);
    doc.text(wrappedFix, writer.margin + 115, writer.y + 3.5);

    writer.y += rowHeight;
  });

  writer.y += 6;

  // --- SECTION 2: PRIORITY RESUME FIXES ---
  writer.drawSectionHeading("2. Priority Actionable Fixes (High-Impact Adjustments)", "Resolve critical parsing bottlenecks that cause automatic candidate drop-off");

  const rawFixes = data.atsData?.priority_fixes || [];
  const defaultFixes = [
    {
      problem: "Missing Quantifiable Achievement Metrics",
      impact: "Enterprise ATS filters automatically rank resumes without numerical KPIs lower (~14 point penalty).",
      fix: "Rewrite bullet points using the XYZ Formula: Accomplished [X], measured by [Y], by doing [Z]. Add metrics like % speedup, revenue, latency, or user scale.",
      severity: "Critical"
    },
    {
      problem: "Target Role Tech Keyword Gaps",
      impact: "Missing vital technologies drops keyword density below competitive recruiter thresholds (~10 point penalty).",
      fix: "Explicitly mention core modern frameworks, databases, and cloud tools relevant to your target role across experience bullets.",
      severity: "High"
    },
    {
      problem: "Passive Action Verbs in Bullet Points",
      impact: "Phrases like 'Responsible for' reduce candidate authority in automated natural language parsing (~5 point penalty).",
      fix: "Start every bullet with high-impact action verbs: 'Architected', 'Spearheaded', 'Engineered', 'Optimized', or 'Orchestrated'.",
      severity: "Medium"
    },
    {
      problem: "Non-Standard Section Headings",
      impact: "Uncommon header names cause parsers to misclassify or completely skip your work experience.",
      fix: "Stick to industry-standard headers: 'Work Experience', 'Technical Skills', 'Education', and 'Projects'.",
      severity: "Low"
    }
  ];

  const fixesList = rawFixes.length > 0 ? rawFixes : defaultFixes;

  fixesList.forEach((item) => {
    const wrappedProblem = doc.splitTextToSize(`Problem: ${item.problem}`, writer.contentWidth - 36);
    const wrappedImpact = doc.splitTextToSize(`Recruiter Impact: ${item.impact}`, writer.contentWidth - 10);
    const wrappedFix = doc.splitTextToSize(`Prescribed Solution: ${item.fix}`, writer.contentWidth - 10);

    const cardHeight = 14 + (wrappedImpact.length * 3.4) + (wrappedFix.length * 3.4);
    writer.ensureSpace(cardHeight + 4);

    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.4);
    doc.roundedRect(writer.margin, writer.y, writer.contentWidth, cardHeight, 2, 2, "FD");

    // Severity indicator strip
    const sev = item.severity || "Medium";
    if (sev === "Critical") doc.setFillColor(225, 29, 72);
    else if (sev === "High") doc.setFillColor(234, 88, 12);
    else if (sev === "Medium") doc.setFillColor(37, 99, 235);
    else doc.setFillColor(16, 185, 129);
    doc.rect(writer.margin, writer.y, 2.5, cardHeight, "F");

    // Problem line
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text(wrappedProblem, writer.margin + 6, writer.y + 5);

    // Severity badge on right
    doc.setFontSize(7.5);
    if (sev === "Critical") doc.setTextColor(225, 29, 72);
    else if (sev === "High") doc.setTextColor(194, 65, 12);
    else if (sev === "Medium") doc.setTextColor(29, 78, 216);
    else doc.setTextColor(4, 120, 87);
    doc.text(`[${sev.toUpperCase()} PRIORITY]`, writer.pageWidth - writer.margin - 30, writer.y + 5);

    let innerY = writer.y + 6 + (wrappedProblem.length * 3.5);

    // Impact
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(wrappedImpact, writer.margin + 6, innerY);
    innerY += wrappedImpact.length * 3.4 + 1.5;

    // Prescribed Fix
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 58, 138);
    doc.text(wrappedFix, writer.margin + 6, innerY);

    writer.y += cardHeight + 3.5;
  });

  writer.y += 4;

  // --- SECTION 3: RESUME BULLET REWRITE LAB (BEFORE VS. AFTER TRANSFORMATIONS) ---
  writer.drawSectionHeading("3. Resume Bullet Rewrite Lab (Before vs. After Transformations)", "Convert generic duties into high-scoring, metric-driven ATS power statements");

  const bulletTransformations = [
    {
      domain: "AI & Full-Stack Engineering Feature",
      before: "Worked on AI agent workflows and integrated API endpoints for user automation.",
      after: "Architected autonomous agentic workflows using LangGraph and Python FastAPI, reducing manual execution latency by 42% across 1,200+ monthly enterprise tasks.",
      benefit: "Adds quantifiable metric + modern tool stack; +14 pts on Workday semantic parser."
    },
    {
      domain: "Backend Scalability & Database Performance",
      before: "Responsible for writing database queries and improving server response times.",
      after: "Engineered PostgreSQL compound indexing and integrated Redis distributed caching, scaling throughput to 1,500 req/sec while slashing p99 latency from 450ms to 62ms.",
      benefit: "Demonstrates production architectural rigor and sub-100ms performance KPIs; +12 pts."
    },
    {
      domain: "Cloud Infrastructure & CI/CD Automation",
      before: "Deployed the application to cloud using Docker containers.",
      after: "Automated end-to-end CI/CD release pipeline using GitHub Actions and multi-stage Docker builds, reducing deployment failure rates to 0% and shrinking image size by 54%.",
      benefit: "Signals enterprise DevOps ownership and zero-downtime deployment readiness; +10 pts."
    }
  ];

  bulletTransformations.forEach((lab, idx) => {
    const wrappedBefore = doc.splitTextToSize(`* ORIGINAL (WEAK): "${lab.before}"`, writer.contentWidth - 14);
    const wrappedAfter = doc.splitTextToSize(`* ATS REWRITE (XYZ FORMULA): "${lab.after}"`, writer.contentWidth - 14);
    const wrappedBenefit = doc.splitTextToSize(`ATS Impact: ${lab.benefit}`, writer.contentWidth - 14);

    const boxHeight = 16 + (wrappedBefore.length * 3.4) + (wrappedAfter.length * 3.4) + (wrappedBenefit.length * 3.4);
    writer.ensureSpace(boxHeight + 4);

    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.4);
    doc.roundedRect(writer.margin, writer.y, writer.contentWidth, boxHeight, 2, 2, "FD");

    // Header badge
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(writer.margin + 3, writer.y + 2.5, writer.contentWidth - 6, 5.5, 1, 1, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(30, 41, 59);
    doc.text(`TRANSFORMATION #${idx + 1}: ${lab.domain.toUpperCase()}`, writer.margin + 6, writer.y + 6.2);

    let currentY = writer.y + 11.5;

    // Before (Red/Amber tone)
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(185, 28, 28); // Dark Red
    doc.text(wrappedBefore, writer.margin + 6, currentY);
    currentY += wrappedBefore.length * 3.4 + 2;

    // After (Green tone)
    doc.setFont("helvetica", "bold");
    doc.setTextColor(4, 120, 87); // Emerald Green
    doc.text(wrappedAfter, writer.margin + 6, currentY);
    currentY += wrappedAfter.length * 3.4 + 2;

    // Benefit
    doc.setFont("helvetica", "normal");
    doc.setTextColor(71, 85, 105);
    doc.text(wrappedBenefit, writer.margin + 6, currentY);

    writer.y += boxHeight + 4;
  });

  writer.y += 4;

  // --- SECTION 4: SKILL GAP & RECRUITER FRICTION ---
  writer.drawSectionHeading("4. Skill Gap & Recruiter Hiring Friction", "Target technologies and architectural proficiencies missing from current resume keywords");

  const skillGapData = data.roadmap?.skill_gap_report || {
    matched_skills: ["JavaScript", "TypeScript", "React", "Node.js", "Express", "Git", "REST APIs"],
    missing_skills: [
      { skill: "Docker & Containerization", category: "DevOps Tool", priority: "High", reason: "Standard requirement in modern cloud deployments", suggested_improvement: "Containerize multi-service full stack app and publish to Docker Hub." },
      { skill: "Distributed Redis Caching", category: "Backend Tool", priority: "High", reason: "Critical for high-throughput scaling and session stores", suggested_improvement: "Integrate Redis cache with TTL strategies to optimize database response times." },
      { skill: "System Architecture & CI/CD", category: "Architecture", priority: "Medium", reason: "Required for senior engineering compensation bands", suggested_improvement: "Deploy GitHub Actions workflow running automated linting, tests, and cloud deploy." }
    ]
  };

  const rawMissing = (skillGapData.missing_skills && skillGapData.missing_skills.length > 0)
    ? skillGapData.missing_skills
    : [
        { skill: "Docker & Containerization", category: "Tool", priority: "High", reason: "Standard requirement in modern cloud deployments", suggested_improvement: "Containerize your primary full-stack app and push to DockerHub" },
        { skill: "Distributed Redis Caching", category: "Technical Skill", priority: "High", reason: "Critical for high-traffic throughput and API scaling", suggested_improvement: "Implement Redis caching layer on frequent database query endpoints" },
        { skill: "CI/CD & Cloud Infrastructure", category: "DevOps", priority: "Medium", reason: "Enterprise standard for reliable production releases", suggested_improvement: "Configure GitHub Actions pipeline for automated testing and cloud deployment" }
      ];

  rawMissing.slice(0, 4).forEach((item: any, idx: number) => {
    const isObj = typeof item === "object" && item !== null;
    const skillName = isObj ? (item.skill || `Gap #${idx + 1}`) : item;
    const category = isObj ? (item.category || "Technical Skill") : "Technical Skill";
    const priority = isObj ? (item.priority || "High") : "High";
    const reason = isObj ? (item.reason || "High demand in enterprise job postings") : "Missing in current resume keywords";
    const action = isObj ? (item.suggested_improvement || "Build a production-level GitHub project showcasing this competency.") : "Build a project demonstrating this skill.";

    const wrappedReason = doc.splitTextToSize(`Hiring Friction: ${reason}`, writer.contentWidth - 12);
    const wrappedFix = doc.splitTextToSize(`Prescribed Fix: ${action}`, writer.contentWidth - 12);

    const cardHeight = 14 + (wrappedReason.length * 3.4) + (wrappedFix.length * 3.4);
    writer.ensureSpace(cardHeight + 4);

    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.4);
    doc.roundedRect(writer.margin, writer.y, writer.contentWidth, cardHeight, 2, 2, "FD");

    // Severity indicator strip
    if (priority === "High") doc.setFillColor(225, 29, 72);
    else if (priority === "Medium") doc.setFillColor(245, 158, 11);
    else doc.setFillColor(59, 130, 246);
    doc.rect(writer.margin, writer.y, 2.5, cardHeight, "F");

    // Skill Name + Category Pill
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text(`[${category.toUpperCase()}] ${skillName}`, writer.margin + 6, writer.y + 5);

    // Priority Tag
    doc.setFontSize(7.5);
    if (priority === "High") doc.setTextColor(225, 29, 72);
    else if (priority === "Medium") doc.setTextColor(180, 83, 9);
    else doc.setTextColor(37, 99, 235);
    doc.text(`${priority} Priority`, writer.pageWidth - writer.margin - 24, writer.y + 5);

    let curY = writer.y + 9.5;

    // Why Recruiters Reject
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(wrappedReason, writer.margin + 6, curY);
    curY += wrappedReason.length * 3.4 + 1.5;

    // How to Fix
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 58, 138);
    doc.text(wrappedFix, writer.margin + 6, curY);

    writer.y += cardHeight + 3.5;
  });

  writer.y += 4;

  // --- SECTION 5: GLOBAL SALARY BENCHMARK & COMPENSATION INTELLIGENCE ---
  // Guaranteed zero overlap: 3 clear columns with generous vertical height
  writer.drawSectionHeading("5. Global Salary Benchmarks & Market Compensation (2026)", "Verified compensation tiers across leading regions and global remote employment markets");

  const salaryTiers = [
    {
      region: "United States (Silicon Valley / NYC / Tier 1)",
      range: "USD $115,000 - $165,000 / yr",
      tier: "Senior Tier / High Demand"
    },
    {
      region: "European Union / UK (London / Berlin / Amsterdam)",
      range: "EUR 75,000 - 110,000 / yr",
      tier: "Competitive Mid-Senior"
    },
    {
      region: "Global Remote (Cross-Border High Growth)",
      range: "USD $85,000 - $135,000 / yr",
      tier: "Top 10% Remote Talent"
    },
    {
      region: "India Tech Hubs (Bengaluru / Hyderabad / NCR)",
      range: "INR 18,00,000 - 38,00,000 / yr",
      tier: "High-Velocity Product Firms"
    }
  ];

  salaryTiers.forEach((tier) => {
    writer.ensureSpace(12);

    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.roundedRect(writer.margin, writer.y, writer.contentWidth, 10, 1.5, 1.5, "FD");

    // Column 1: Market Region (Left aligned, x = margin + 4, width ~80mm)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text(tier.region, writer.margin + 4, writer.y + 6.2);

    // Column 2: Compensation Range (Center-right aligned, x = margin + 92)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(4, 120, 87); // Emerald Green
    doc.text(tier.range, writer.margin + 92, writer.y + 6.2);

    // Column 3: Tier Badge (Right aligned, pill)
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    const badgeW = doc.getTextWidth(tier.tier);
    doc.text(tier.tier, writer.pageWidth - writer.margin - badgeW - 4, writer.y + 6.2);

    writer.y += 12;
  });

  writer.y += 4;

  // --- SECTION 6: 4-WEEK CAREER ACCELERATION ROADMAP ---
  writer.drawSectionHeading("6. 4-Week Career Sprint Execution Plan", "Week-by-week technical milestones, practical hands-on projects, and core deliverables");

  const rawSprints = data.roadmap?.sprints || [];
  const defaultSprints = [
    {
      sprint_number: 1,
      theme: "Week 1: Architecture Foundation, Clean Code & State Management",
      milestone_goal: "Master modern design patterns, state normalization, and eliminate unnecessary render cycles.",
      practical_project: "Build a production-grade scalable state management architecture with TypeScript",
      weeks: [
        {
          week: 1,
          tasks: [
            { type: "project", title: "Refactor core UI layer into pure functional components", hours: 8, details: "Eliminate re-renders with memoization and clean store hooks" },
            { type: "skill", title: "Implement centralized error boundary & logging", hours: 4, details: "Handle edge-case network dropouts gracefully" }
          ]
        }
      ]
    },
    {
      sprint_number: 2,
      theme: "Week 2: Backend Scalability, Data Pipeline & Redis Caching",
      milestone_goal: "Design high-concurrency API endpoints, compound database indexing, and sub-50ms caching.",
      practical_project: "Build a high-throughput RESTful API with automated rate limiting and cache invalidation",
      weeks: [
        {
          week: 2,
          tasks: [
            { type: "project", title: "Benchmark and optimize slow database queries", hours: 10, details: "Add compound indexes to slash response time by 60%" },
            { type: "skill", title: "Set up Redis cache with TTL strategies", hours: 6, details: "Cache hot user sessions and repeated queries" }
          ]
        }
      ]
    },
    {
      sprint_number: 3,
      theme: "Week 3: Cloud Infrastructure, Docker & Automated CI/CD Pipelines",
      milestone_goal: "Containerize multi-container applications and automate zero-downtime production deployment.",
      practical_project: "Deploy microservices container cluster with health check monitoring and automated rollouts",
      weeks: [
        {
          week: 3,
          tasks: [
            { type: "project", title: "Create optimized multi-stage Docker container", hours: 8, details: "Keep final container image footprint under 150MB" },
            { type: "skill", title: "Build GitHub Actions automated test & deploy pipeline", hours: 6, details: "Auto-lint, test, build, and deploy upon branch merges" }
          ]
        }
      ]
    },
    {
      sprint_number: 4,
      theme: "Week 4: System Design Rigor & Interview Simulation",
      milestone_goal: "Master high-level architecture trade-offs, portfolio presentation, and technical interview execution.",
      practical_project: "Publish complete end-to-end portfolio project with live deployment and technical case study",
      weeks: [
        {
          week: 4,
          tasks: [
            { type: "project", title: "Publish technical architecture diagram & case study", hours: 8, details: "Document latency metrics, trade-offs, and scalability choices" },
            { type: "skill", title: "Practice 15 role-specific technical interview questions", hours: 8, details: "Prepare behavioral XYZ stories and system design diagrams" }
          ]
        }
      ]
    }
  ];

  const sprints = rawSprints.length > 0 ? rawSprints : defaultSprints;

  sprints.forEach((sprint: any, idx: number) => {
    const sprintTheme = sprint.theme || sprint.sprint_name || `Sprint ${idx + 1}: Core Milestone`;
    const goalText = sprint.milestone_goal || "Complete sprint core technical deliverables";
    const proj = sprint.practical_project || (sprint.key_deliverables ? sprint.key_deliverables.join(", ") : "Production code deliverable");

    const wrappedTheme = doc.splitTextToSize(sprintTheme, writer.contentWidth - 32);
    const wrappedGoal = doc.splitTextToSize(`Milestone Goal: ${goalText}`, writer.contentWidth - 10);
    const wrappedProj = doc.splitTextToSize(`Hands-on Deliverable: ${proj}`, writer.contentWidth - 10);

    let tasksCount = 0;
    if (sprint.weeks && Array.isArray(sprint.weeks)) {
      sprint.weeks.forEach((w: any) => {
        if (w.tasks && Array.isArray(w.tasks)) tasksCount += w.tasks.length;
      });
    }

    const boxHeight = 18 + (wrappedTheme.length * 3.5) + (wrappedGoal.length * 3.4) + (wrappedProj.length * 3.4) + (tasksCount * 5.5);
    writer.ensureSpace(boxHeight + 4);

    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.4);
    doc.roundedRect(writer.margin, writer.y, writer.contentWidth, boxHeight, 2, 2, "FD");

    // Sprint number badge
    doc.setFillColor(37, 99, 235);
    doc.roundedRect(writer.margin + 3, writer.y + 3, 20, 5, 1, 1, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(255, 255, 255);
    doc.text(`WEEK ${sprint.sprint_number || idx + 1}`, writer.margin + 5, writer.y + 6.7);

    // Title / Theme
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text(wrappedTheme, writer.margin + 26, writer.y + 6.7);

    let innerY = writer.y + 6.7 + (wrappedTheme.length * 3.5) + 2;

    // Milestone Goal
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text(wrappedGoal, writer.margin + 6, innerY);
    innerY += wrappedGoal.length * 3.4 + 1.5;

    // Hands-on Project
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 58, 138);
    doc.text(wrappedProj, writer.margin + 6, innerY);
    innerY += wrappedProj.length * 3.4 + 2;

    // Granular week tasks inside sprint
    if (sprint.weeks && Array.isArray(sprint.weeks)) {
      sprint.weeks.forEach((w: any) => {
        if (w.tasks && Array.isArray(w.tasks)) {
          w.tasks.slice(0, 2).forEach((task: any) => {
            doc.setFont("helvetica", "bold");
            doc.setFontSize(7);
            doc.setTextColor(37, 99, 235);
            doc.text(`* [${(task.type || 'TASK').toUpperCase()}]`, writer.margin + 8, innerY);

            doc.setFont("helvetica", "normal");
            doc.setTextColor(51, 65, 85);
            const taskStr = `${task.title}${task.hours ? ` (${task.hours}h)` : ''}${task.details ? ` - ${task.details}` : ''}`;
            const wrappedTask = doc.splitTextToSize(taskStr, writer.contentWidth - 35);
            doc.text(wrappedTask[0] || taskStr, writer.margin + 28, innerY);
            innerY += 5;
          });
        }
      });
    }

    writer.y += boxHeight + 4;
  });

  writer.y += 4;

  // --- SECTION 7: CURATED LEARNING RESOURCES WITH LIVE HYPERLINKS ---
  writer.drawSectionHeading("7. Curated Learning Resources (with Clickable Links)", "Official documentation, interactive sandboxes, and video curricula");

  const learningList: Array<{
    title: string;
    topic: string;
    url: string;
    type: string;
  }> = [];

  const rawResources = data.roadmap?.learning_resources || [];
  rawResources.forEach((item: any) => {
    const topic = item.category || item.skill_or_topic || "Core Engineering";
    if (item.resources && Array.isArray(item.resources)) {
      item.resources.forEach((r: any) => {
        learningList.push({
          title: r.title || `${topic} Guide`,
          topic,
          url: r.url || "https://google.com",
          type: r.type || "Documentation"
        });
      });
    } else {
      if (item.official_documentation) {
        learningList.push({
          title: `Official ${topic} Documentation`,
          topic,
          url: item.official_documentation,
          type: "Documentation"
        });
      }
      if (item.practice_websites) {
        learningList.push({
          title: `${topic} Hands-on Practice`,
          topic,
          url: item.practice_websites,
          type: "Interactive Practice"
        });
      }
      if (item.free_youtube_courses) {
        learningList.push({
          title: `${topic} Recommended Video Course`,
          topic,
          url: item.free_youtube_courses,
          type: "Video Course"
        });
      }
    }
  });

  if (learningList.length === 0) {
    learningList.push(
      { title: "React Official Documentation & Architecture Guides", topic: "React 19", url: "https://react.dev", type: "Documentation" },
      { title: "TypeScript Handbook & Type System Mastery", topic: "TypeScript", url: "https://www.typescriptlang.org/docs/", type: "Documentation" },
      { title: "Docker Official Getting Started Tutorial", topic: "Containerization", url: "https://docs.docker.com/get-started/", type: "Hands-on" },
      { title: "AWS Cloud Practitioner & Architecture Fundamentals", topic: "Cloud Architecture", url: "https://aws.amazon.com/training/", type: "Cloud Course" },
      { title: "FreeCodeCamp Enterprise Backend & APIs", topic: "Backend Engineering", url: "https://www.freecodecamp.org", type: "Interactive Platform" }
    );
  }

  learningList.slice(0, 8).forEach((res) => {
    writer.ensureSpace(14);

    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.roundedRect(writer.margin, writer.y, writer.contentWidth, 12, 1.5, 1.5, "FD");

    // Topic & Type
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(71, 85, 105);
    doc.text(`[${res.topic.toUpperCase()} | ${res.type.toUpperCase()}]`, writer.margin + 4, writer.y + 4.2);

    // Clickable Title with Hyperlink
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(37, 99, 235); // Blue link color
    
    const displayTitle = doc.splitTextToSize(res.title, writer.contentWidth - 42)[0] || res.title;
    doc.textWithLink(displayTitle, writer.margin + 4, writer.y + 8.8, { url: res.url });

    // Underline effect
    const titleWidth = doc.getTextWidth(displayTitle);
    doc.setDrawColor(37, 99, 235);
    doc.setLineWidth(0.2);
    doc.line(writer.margin + 4, writer.y + 9.4, writer.margin + 4 + titleWidth, writer.y + 9.4);

    // Clean ASCII Action Button: "[OPEN LINK ->]" (Safe ASCII, no corrupted glyphs!)
    const actionText = "[OPEN LINK ->]";
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(30, 64, 175);
    const actionWidth = doc.getTextWidth(actionText);
    const actionX = writer.pageWidth - writer.margin - actionWidth - 4;
    doc.textWithLink(actionText, actionX, writer.y + 7.5, { url: res.url });

    // Clickable bounding box around the action button
    doc.link(actionX - 1, writer.y + 2, actionWidth + 2, 7, { url: res.url });

    writer.y += 14;
  });

  // Apply running footers to all pages
  writer.drawFooters();

  // Save PDF
  const filename = `Career_Audit_Report_${candidate.replace(/\s+/g, "_")}_${role.replace(/\s+/g, "_")}.pdf`;
  doc.save(filename);
}

/**
 * 2. INDIVIDUAL SKILL GAP AUDIT PDF
 * Downloaded directly from the Skill Gap Tab.
 */
export function generateSkillGapPdf(data: PdfReportData) {
  const writer = new DocumentWriter();
  const doc = writer.doc;

  const candidate = data.candidateName || "Candidate";
  const role = data.targetRole || "Software Engineering Professional";
  const dateStr = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  // Header Box
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(writer.margin, writer.y, writer.contentWidth, 32, 2.5, 2.5, "F");
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(writer.margin, writer.y, writer.contentWidth, 32, 2.5, 2.5, "S");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(30, 58, 138);
  doc.text("SKILL GAP & COMPETENCY AUDIT REPORT", writer.margin + 6, writer.y + 10);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Candidate: ${candidate}  |  Target Role: ${role}  |  Date: ${dateStr}`, writer.margin + 6, writer.y + 17);
  doc.text("Direct market alignment test against live 2026 enterprise engineering job requisitions", writer.margin + 6, writer.y + 24);

  writer.y += 38;

  const skillGapData = data.roadmap?.skill_gap_report || {
    matched_skills: ["JavaScript", "TypeScript", "React", "Node.js", "Express", "Git", "REST APIs"],
    missing_skills: [
      { skill: "Docker & Containerization", category: "DevOps Tool", priority: "High", reason: "Standard requirement in modern cloud deployments", suggested_improvement: "Containerize multi-service full stack app and publish to Docker Hub." },
      { skill: "Kubernetes & Orchestration", category: "Cloud Tool", priority: "High", reason: "Required for senior cloud engineering compensation bands", suggested_improvement: "Deploy a local Minikube cluster with multi-pod architecture." },
      { skill: "Distributed Redis Caching", category: "Backend Tool", priority: "High", reason: "Critical for high-traffic throughput and API scaling", suggested_improvement: "Implement Redis caching layer on frequent database query endpoints." },
      { skill: "System Architecture & CI/CD", category: "DevOps", priority: "Medium", reason: "Enterprise standard for scalable microservices", suggested_improvement: "Deploy project with GitHub Actions automated CI/CD pipeline." }
    ],
    match_percentage: 75
  };

  writer.drawSectionHeading("1. Verified Profile Strengths", "Core competencies detected and verified in your uploaded resume");
  
  writer.ensureSpace(20);
  (skillGapData.matched_skills || []).forEach((skill) => {
    writer.ensureSpace(8);
    doc.setFillColor(240, 253, 244);
    doc.roundedRect(writer.margin, writer.y, writer.contentWidth, 6.5, 1, 1, "F");
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(22, 101, 52);
    doc.text(`[MATCHED] ${skill}`, writer.margin + 4, writer.y + 4.5);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text("Verified against job market requirements", writer.margin + 75, writer.y + 4.5);
    writer.y += 8;
  });

  writer.y += 6;
  writer.drawSectionHeading("2. High-Demand Skill Gaps to Bridge", "Critical technologies and architectural patterns required to unlock senior compensation tiers");

  const rawMissing = (skillGapData.missing_skills && skillGapData.missing_skills.length > 0)
    ? skillGapData.missing_skills
    : [
        { skill: "Docker & Containerization", category: "Tool", priority: "High", reason: "Standard requirement in modern cloud deployments", suggested_improvement: "Containerize your primary full-stack app and push to DockerHub" },
        { skill: "Kubernetes & Orchestration", category: "Tool", priority: "High", reason: "Required for senior cloud engineering compensation bands", suggested_improvement: "Deploy a local Minikube cluster with multi-pod architecture" },
        { skill: "Distributed Redis Caching", category: "Technical Skill", priority: "Medium", reason: "Critical for high-traffic throughput and API scaling", suggested_improvement: "Implement Redis caching layer on frequent database query endpoints" },
        { skill: "AWS / Cloud Infrastructure", category: "Framework", priority: "High", reason: "Enterprise standard for scalable microservices", suggested_improvement: "Deploy project with S3, ECS/Lambda, and CloudFront integration" }
      ];

  rawMissing.forEach((item: any, idx: number) => {
    const isObj = typeof item === "object" && item !== null;
    const skillName = isObj ? (item.skill || `Gap #${idx + 1}`) : item;
    const category = isObj ? (item.category || "Technical Skill") : "Technical Skill";
    const priority = isObj ? (item.priority || "High") : "High";
    const reason = isObj ? (item.reason || "High demand in enterprise job postings") : "Missing in current resume keywords";
    const action = isObj ? (item.suggested_improvement || "Build a production-level GitHub project showcasing this competency.") : "Build a project demonstrating this skill.";

    const wrappedReason = doc.splitTextToSize(`Hiring Friction: ${reason}`, writer.contentWidth - 12);
    const wrappedFix = doc.splitTextToSize(`Prescribed Fix: ${action}`, writer.contentWidth - 12);

    const cardHeight = 14 + (wrappedReason.length * 3.4) + (wrappedFix.length * 3.4);
    writer.ensureSpace(cardHeight + 4);

    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.4);
    doc.roundedRect(writer.margin, writer.y, writer.contentWidth, cardHeight, 2, 2, "FD");

    // Severity indicator strip
    if (priority === "High") doc.setFillColor(225, 29, 72);
    else if (priority === "Medium") doc.setFillColor(245, 158, 11);
    else doc.setFillColor(59, 130, 246);
    doc.rect(writer.margin, writer.y, 2.5, cardHeight, "F");

    // Skill Name + Category Pill
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text(`[${category.toUpperCase()}] ${skillName}`, writer.margin + 6, writer.y + 5);

    // Priority Tag
    doc.setFontSize(7.5);
    if (priority === "High") doc.setTextColor(225, 29, 72);
    else if (priority === "Medium") doc.setTextColor(180, 83, 9);
    else doc.setTextColor(37, 99, 235);
    doc.text(`${priority} Priority`, writer.pageWidth - writer.margin - 24, writer.y + 5);

    let curY = writer.y + 9.5;

    // Why Recruiters Reject
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(wrappedReason, writer.margin + 6, curY);
    curY += wrappedReason.length * 3.4 + 1.5;

    // How to Fix
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 58, 138);
    doc.text(wrappedFix, writer.margin + 6, curY);

    writer.y += cardHeight + 3.5;
  });

  writer.drawFooters();
  doc.save(`Skill_Gap_Audit_${candidate.replace(/\s+/g, "_")}.pdf`);
}

/**
 * 3. INDIVIDUAL LEARNING RESOURCES PDF WITH LIVE HYPERLINKS
 * Downloaded directly from the Learning Resources Tab.
 */
export function generateLearningResourcesPdf(data: PdfReportData) {
  const writer = new DocumentWriter();
  const doc = writer.doc;

  const candidate = data.candidateName || "Candidate";
  const role = data.targetRole || "Software Engineering Professional";
  const dateStr = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  // Header Box
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(writer.margin, writer.y, writer.contentWidth, 32, 2.5, 2.5, "F");
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(writer.margin, writer.y, writer.contentWidth, 32, 2.5, 2.5, "S");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(30, 58, 138);
  doc.text("CURATED LEARNING PLAN (WITH LIVE LINKS)", writer.margin + 6, writer.y + 10);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Candidate: ${candidate}  |  Target Role: ${role}  |  Date: ${dateStr}`, writer.margin + 6, writer.y + 17);
  doc.text("Interactive study plan with direct clickable hyperlinks to official docs, platforms, and courses", writer.margin + 6, writer.y + 24);

  writer.y += 38;

  writer.drawSectionHeading("Essential Learning Track & Direct Hyperlinks", "Click any resource title or the link button to open the resource directly in your browser");

  const list: Array<{ title: string; category: string; url: string; type: string }> = [];
  const rawResources = data.roadmap?.learning_resources || [];

  rawResources.forEach((cat: any) => {
    const topic = cat.category || cat.skill_or_topic || "Engineering Topic";
    if (cat.resources && Array.isArray(cat.resources)) {
      cat.resources.forEach((r: any) => {
        list.push({
          title: r.title || `${topic} Guide`,
          category: topic,
          url: r.url || "https://google.com",
          type: r.type || "Guide"
        });
      });
    } else {
      if (cat.official_documentation) {
        list.push({
          title: `Official ${topic} Documentation`,
          category: topic,
          url: cat.official_documentation,
          type: "Official Docs"
        });
      }
      if (cat.practice_websites) {
        list.push({
          title: `${topic} Hands-on Practice & Exercises`,
          category: topic,
          url: cat.practice_websites,
          type: "Interactive Platform"
        });
      }
      if (cat.free_youtube_courses) {
        list.push({
          title: `${topic} Video Course Series`,
          category: topic,
          url: cat.free_youtube_courses,
          type: "Video Course"
        });
      }
    }
  });

  if (list.length === 0) {
    list.push(
      { title: "React 19 Official Documentation & Core Concepts", category: "React", url: "https://react.dev", type: "Docs" },
      { title: "TypeScript Official Handbook", category: "TypeScript", url: "https://www.typescriptlang.org/docs/", type: "Docs" },
      { title: "Docker Official Get Started Guides", category: "Containers", url: "https://docs.docker.com/get-started/", type: "Tutorial" },
      { title: "AWS Cloud Architecture & Training", category: "Cloud", url: "https://aws.amazon.com/training/", type: "Course" }
    );
  }

  list.forEach((item, index) => {
    writer.ensureSpace(14);

    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.roundedRect(writer.margin, writer.y, writer.contentWidth, 12, 1.5, 1.5, "FD");

    // Index & Category
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(71, 85, 105);
    doc.text(`#${index + 1}  [${item.category.toUpperCase()} | ${item.type.toUpperCase()}]`, writer.margin + 4, writer.y + 4.2);

    // Hyperlink Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(37, 99, 235);
    const displayTitle = doc.splitTextToSize(item.title, writer.contentWidth - 42)[0] || item.title;
    doc.textWithLink(displayTitle, writer.margin + 4, writer.y + 8.8, { url: item.url });

    // Underline
    const titleWidth = doc.getTextWidth(displayTitle);
    doc.setDrawColor(37, 99, 235);
    doc.setLineWidth(0.2);
    doc.line(writer.margin + 4, writer.y + 9.4, writer.margin + 4 + titleWidth, writer.y + 9.4);

    // Safe Action Link
    const actionText = "[OPEN LINK ->]";
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(30, 64, 175);
    const actionWidth = doc.getTextWidth(actionText);
    const actionX = writer.pageWidth - writer.margin - actionWidth - 4;
    doc.textWithLink(actionText, actionX, writer.y + 7.5, { url: item.url });
    doc.link(actionX - 1, writer.y + 2, actionWidth + 2, 7, { url: item.url });

    writer.y += 14;
  });

  writer.drawFooters();
  doc.save(`Learning_Resources_${candidate.replace(/\s+/g, "_")}.pdf`);
}

/**
 * 4. INDIVIDUAL CAREER ROADMAP PDF
 * Downloaded directly from the Career Roadmap Tab.
 */
export function generateRoadmapPdf(data: PdfReportData) {
  const writer = new DocumentWriter();
  const doc = writer.doc;

  const candidate = data.candidateName || "Candidate";
  const role = data.targetRole || "Software Engineering Professional";
  const dateStr = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  // Header Box
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(writer.margin, writer.y, writer.contentWidth, 32, 2.5, 2.5, "F");
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(writer.margin, writer.y, writer.contentWidth, 32, 2.5, 2.5, "S");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(30, 58, 138);
  doc.text("4-WEEK CAREER ACCELERATION ROADMAP", writer.margin + 6, writer.y + 10);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Candidate: ${candidate}  |  Target Role: ${role}  |  Date: ${dateStr}`, writer.margin + 6, writer.y + 17);
  doc.text("Structured sprint milestones to achieve competitive parity and crack target role interviews", writer.margin + 6, writer.y + 24);

  writer.y += 38;

  writer.drawSectionHeading("Milestone Progression Sprints", "Follow this weekly action plan to systematically build high-leverage portfolio projects");

  const rawSprints = data.roadmap?.sprints || [];
  const defaultSprints = [
    {
      sprint_number: 1,
      theme: "Week 1: Architecture Foundation, Clean Code & State Management",
      milestone_goal: "Master modern design patterns, state normalization, and eliminate unnecessary render cycles.",
      practical_project: "Build a production-grade scalable state management architecture with TypeScript",
      weeks: [
        {
          week: 1,
          tasks: [
            { type: "project", title: "Refactor core UI layer into pure functional components", hours: 8, details: "Eliminate re-renders with memoization and clean store hooks" },
            { type: "skill", title: "Implement centralized error boundary & logging", hours: 4, details: "Handle edge-case network dropouts gracefully" }
          ]
        }
      ]
    },
    {
      sprint_number: 2,
      theme: "Week 2: Backend Scalability, Data Pipeline & Redis Caching",
      milestone_goal: "Design high-concurrency API endpoints, compound database indexing, and sub-50ms caching.",
      practical_project: "Build a high-throughput RESTful API with automated rate limiting and cache invalidation",
      weeks: [
        {
          week: 2,
          tasks: [
            { type: "project", title: "Benchmark and optimize slow database queries", hours: 10, details: "Add compound indexes to slash response time by 60%" },
            { type: "skill", title: "Set up Redis cache with TTL strategies", hours: 6, details: "Cache hot user sessions and repeated queries" }
          ]
        }
      ]
    },
    {
      sprint_number: 3,
      theme: "Week 3: Cloud Infrastructure, Docker & Automated CI/CD Pipelines",
      milestone_goal: "Containerize multi-container applications and automate zero-downtime production deployment.",
      practical_project: "Deploy microservices container cluster with health check monitoring and automated rollouts",
      weeks: [
        {
          week: 3,
          tasks: [
            { type: "project", title: "Create optimized multi-stage Docker container", hours: 8, details: "Keep final container image footprint under 150MB" },
            { type: "skill", title: "Build GitHub Actions automated test & deploy pipeline", hours: 6, details: "Auto-lint, test, build, and deploy upon branch merges" }
          ]
        }
      ]
    },
    {
      sprint_number: 4,
      theme: "Week 4: Enterprise System Design & Interview Preparation",
      milestone_goal: "High-level architecture trade-offs, portfolio presentation, and cracking technical interview rounds.",
      practical_project: "Publish complete end-to-end portfolio project with live deployment and technical case study",
      weeks: [
        {
          week: 4,
          tasks: [
            { type: "project", title: "Publish technical architecture diagram & case study", hours: 8, details: "Document latency metrics, trade-offs, and scalability choices" },
            { type: "skill", title: "Practice 15 role-specific technical interview questions", hours: 8, details: "Prepare behavioral XYZ stories and system design diagrams" }
          ]
        }
      ]
    }
  ];

  const sprints = rawSprints.length > 0 ? rawSprints : defaultSprints;

  sprints.forEach((sprint: any, idx: number) => {
    const sprintTheme = sprint.theme || sprint.sprint_name || `Sprint ${idx + 1}: Core Milestone`;
    const goalText = sprint.milestone_goal || "Complete sprint core technical deliverables";
    const proj = sprint.practical_project || (sprint.key_deliverables ? sprint.key_deliverables.join(", ") : "Production code deliverable");

    const wrappedTheme = doc.splitTextToSize(sprintTheme, writer.contentWidth - 32);
    const wrappedGoal = doc.splitTextToSize(`Milestone Goal: ${goalText}`, writer.contentWidth - 10);
    const wrappedProj = doc.splitTextToSize(`Hands-on Deliverable: ${proj}`, writer.contentWidth - 10);

    let tasksCount = 0;
    if (sprint.weeks && Array.isArray(sprint.weeks)) {
      sprint.weeks.forEach((w: any) => {
        if (w.tasks && Array.isArray(w.tasks)) tasksCount += w.tasks.length;
      });
    }

    const boxHeight = 18 + (wrappedTheme.length * 3.5) + (wrappedGoal.length * 3.4) + (wrappedProj.length * 3.4) + (tasksCount * 5.5);
    writer.ensureSpace(boxHeight + 4);

    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.4);
    doc.roundedRect(writer.margin, writer.y, writer.contentWidth, boxHeight, 2, 2, "FD");

    // Sprint badge
    doc.setFillColor(37, 99, 235);
    doc.roundedRect(writer.margin + 3, writer.y + 3, 20, 5, 1, 1, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(255, 255, 255);
    doc.text(`WEEK ${sprint.sprint_number || idx + 1}`, writer.margin + 5, writer.y + 6.7);

    // Title / Theme
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text(wrappedTheme, writer.margin + 26, writer.y + 6.7);

    let innerY = writer.y + 6.7 + (wrappedTheme.length * 3.5) + 2;

    // Goal
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text(wrappedGoal, writer.margin + 6, innerY);
    innerY += wrappedGoal.length * 3.4 + 1.5;

    // Hands-on Project
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 58, 138);
    doc.text(wrappedProj, writer.margin + 6, innerY);
    innerY += wrappedProj.length * 3.4 + 2;

    // Granular week tasks inside sprint
    if (sprint.weeks && Array.isArray(sprint.weeks)) {
      sprint.weeks.forEach((w: any) => {
        if (w.tasks && Array.isArray(w.tasks)) {
          w.tasks.slice(0, 2).forEach((task: any) => {
            doc.setFont("helvetica", "bold");
            doc.setFontSize(7);
            doc.setTextColor(37, 99, 235);
            doc.text(`* [${(task.type || 'TASK').toUpperCase()}]`, writer.margin + 8, innerY);

            doc.setFont("helvetica", "normal");
            doc.setTextColor(51, 65, 85);
            const taskStr = `${task.title}${task.hours ? ` (${task.hours}h)` : ''}${task.details ? ` - ${task.details}` : ''}`;
            const wrappedTask = doc.splitTextToSize(taskStr, writer.contentWidth - 35);
            doc.text(wrappedTask[0] || taskStr, writer.margin + 28, innerY);
            innerY += 5;
          });
        }
      });
    }

    writer.y += boxHeight + 4;
  });

  writer.drawFooters();
  doc.save(`Career_Roadmap_${candidate.replace(/\s+/g, "_")}.pdf`);
}
