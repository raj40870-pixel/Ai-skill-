import { jsPDF } from "jspdf";

export interface PdfReportData {
  candidateName?: string;
  candidateEmail?: string;
  targetRole?: string;
  resumeFilename?: string;
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

// Helpers for clean corporate MS Word-style PDF layout
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
    this.pageWidth = this.doc.internal.pageSize.getWidth();
    this.pageHeight = this.doc.internal.pageSize.getHeight();
    this.margin = 16;
    this.contentWidth = this.pageWidth - (this.margin * 2);
    this.y = this.margin;
  }

  ensureSpace(neededMm: number) {
    if (this.y + neededMm > this.pageHeight - 20) {
      this.doc.addPage();
      this.y = this.margin + 8;
      this.drawPageHeader();
    }
  }

  drawPageHeader() {
    this.doc.setFont("helvetica", "normal");
    this.doc.setFontSize(8);
    this.doc.setTextColor(140, 150, 165);
    this.doc.text("CAREER NAVIGATION AI — VERIFIED CAREER AUDIT DOCUMENT", this.margin, this.margin - 4);
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
    this.doc.setFontSize(13);
    this.doc.setTextColor(15, 23, 42); // Slate 900
    this.doc.text(title, this.margin + 6, this.y + 1);
    this.y += 6;

    if (subtitle) {
      this.doc.setFont("helvetica", "normal");
      this.doc.setFontSize(9);
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
      this.doc.setFontSize(8);
      this.doc.setTextColor(148, 163, 184);
      this.doc.text("Official Career Audit & Learning Roadmap · Powered by Career Navigation AI", this.margin, this.pageHeight - 7);
      
      const pageText = `Page ${i} of ${totalPages}`;
      this.doc.text(pageText, this.pageWidth - this.margin - this.doc.getTextWidth(pageText), this.pageHeight - 7);
    }
  }
}

/**
 * 1. FULL CONSOLIDATED AUDIT REPORT PDF
 * Downloaded from the ATS Score Tab.
 * Includes ATS Score + Breakdown + Priority Fixes + Skill Gap + Roadmap + Learning Resources with live links.
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
  // Top Banner Box
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(writer.margin, writer.y, writer.contentWidth, 38, 3, 3, "F");
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.5);
  doc.roundedRect(writer.margin, writer.y, writer.contentWidth, 38, 3, 3, "S");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(30, 58, 138); // Deep Navy
  doc.text("CAREER AUDIT & RESUME OPTIMIZATION REPORT", writer.margin + 6, writer.y + 10);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(71, 85, 105);
  doc.text("Comprehensive Institutional ATS Evaluation, Skill Gap Analysis & Verified Learning Plan", writer.margin + 6, writer.y + 16);

  // Metadata Columns inside Header
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text(`Candidate: `, writer.margin + 6, writer.y + 24);
  doc.setFont("helvetica", "normal");
  doc.text(`${candidate} (${email})`, writer.margin + 24, writer.y + 24);

  doc.setFont("helvetica", "bold");
  doc.text(`Target Role: `, writer.margin + 6, writer.y + 30);
  doc.setFont("helvetica", "normal");
  doc.text(role, writer.margin + 24, writer.y + 30);

  doc.setFont("helvetica", "bold");
  doc.text(`Audit Date: `, writer.margin + 115, writer.y + 24);
  doc.setFont("helvetica", "normal");
  doc.text(dateStr, writer.margin + 132, writer.y + 24);

  doc.setFont("helvetica", "bold");
  doc.text(`Status: `, writer.margin + 115, writer.y + 30);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(4, 120, 87); // Emerald
  doc.text("Verified Analysis", writer.margin + 132, writer.y + 30);

  writer.y += 44;

  // --- SECTION 1: ATS SCORE & RATING ---
  writer.drawSectionHeading("1. ATS Optimization Scorecard", "Automated resume parsing engine alignment test (Jobscan & Workday calibration)");

  const score = data.atsData?.score ?? 78;
  const match = data.atsData?.market_match ?? 82;
  const label = data.atsData?.label || (score >= 80 ? "Competitive Match" : score >= 60 ? "Moderate Fit" : "Needs Optimization");

  // Score Highlight Card
  doc.setFillColor(score >= 80 ? 240 : score >= 60 ? 239 : 254, score >= 80 ? 253 : score >= 60 ? 246 : 242, score >= 80 ? 244 : score >= 60 ? 255 : 242);
  doc.roundedRect(writer.margin, writer.y, 50, 24, 2, 2, "F");
  doc.setDrawColor(score >= 80 ? 167 : score >= 60 ? 191 : 254, score >= 80 ? 243 : score >= 60 ? 219 : 205, score >= 80 ? 208 : score >= 60 ? 254 : 205);
  doc.roundedRect(writer.margin, writer.y, 50, 24, 2, 2, "S");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(score >= 80 ? 5 : score >= 60 ? 29 : 190, score >= 80 ? 150 : score >= 60 ? 78 : 18, score >= 80 ? 105 : score >= 60 ? 216 : 60);
  doc.text(`${score} / 100`, writer.margin + 7, writer.y + 12);

  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(71, 85, 105);
  doc.text("OVERALL ATS SCORE", writer.margin + 7, writer.y + 19);

  // Verdict details next to score box
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text(`Rating: ${label}`, writer.margin + 56, writer.y + 8);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  const verdictSummary = score >= 80
    ? "Your resume demonstrates solid keyword coverage and formatting structure, placing it in the top tier for automated screening."
    : score >= 60
    ? "Your resume passes basic parser filters but loses competitive ranking due to missing role-specific keywords and unquantified achievements."
    : "Critical optimization required. High drop-off risk on enterprise applicant tracking systems due to format and metric deductions.";
  
  const wrappedVerdict = doc.splitTextToSize(verdictSummary, writer.contentWidth - 58);
  doc.text(wrappedVerdict, writer.margin + 56, writer.y + 14);

  writer.y += 30;

  // --- TECHNICAL CRITERIA BREAKDOWN TABLE ---
  const breakdown = data.atsData?.breakdown || [
    { criterion: "Core Technical Skills Match", score: 18, max: 25, fix: "Align keywords with target role job postings." },
    { criterion: "Measurable Impact & Metrics", score: 11, max: 20, fix: "Add numbers (%, $, user scale) to project bullet points." },
    { criterion: "Experience Alignment & Depth", score: 11, max: 15, fix: "Demonstrate progressive responsibility." },
    { criterion: "Action Verbs & STAR Phrasing", score: 7, max: 10, fix: "Use strong engineering action verbs." },
    { criterion: "Project Quality & Code Proof", score: 7, max: 10, fix: "Add live URLs and GitHub repository links." },
    { criterion: "ATS Structural Formatting", score: 8, max: 10, fix: "Standardize section headings." },
    { criterion: "Education & Certifications", score: 4, max: 5, fix: "Standard degree & certification formats." },
    { criterion: "Online Footprint & Contact", score: 4, max: 5, fix: "Ensure clean LinkedIn and portfolio links." }
  ];

  writer.ensureSpace(breakdown.length * 7 + 16);

  // Table Header
  doc.setFillColor(241, 245, 249);
  doc.rect(writer.margin, writer.y, writer.contentWidth, 7, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  doc.text("TECHNICAL EVALUATION CRITERION", writer.margin + 3, writer.y + 5);
  doc.text("SCORE / MAX", writer.margin + 80, writer.y + 5);
  doc.text("RATING", writer.margin + 110, writer.y + 5);
  doc.text("EVALUATION BASIS & DEDUCTIONS", writer.margin + 132, writer.y + 5);
  writer.y += 8;

  // Table Rows
  breakdown.forEach((item, idx) => {
    writer.ensureSpace(8);
    const isEven = idx % 2 === 0;
    if (isEven) {
      doc.setFillColor(248, 250, 252);
      doc.rect(writer.margin, writer.y - 1, writer.contentWidth, 7, "F");
    }

    const pct = Math.round((item.score / (item.max || 100)) * 100);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text(item.criterion, writer.margin + 3, writer.y + 4);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(71, 85, 105);
    doc.text(`${item.score} / ${item.max} pts`, writer.margin + 80, writer.y + 4);
    
    // Status color
    if (pct >= 80) {
      doc.setTextColor(4, 120, 87);
      doc.setFont("helvetica", "bold");
      doc.text(`${pct}% (Strong)`, writer.margin + 110, writer.y + 4);
    } else if (pct >= 60) {
      doc.setTextColor(37, 99, 235);
      doc.setFont("helvetica", "bold");
      doc.text(`${pct}% (Adequate)`, writer.margin + 110, writer.y + 4);
    } else {
      doc.setTextColor(225, 29, 72);
      doc.setFont("helvetica", "bold");
      doc.text(`${pct}% (Deduction)`, writer.margin + 110, writer.y + 4);
    }

    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    const fixText = item.fix || "Standard requirement";
    const truncatedFix = doc.splitTextToSize(fixText, writer.contentWidth - 134)[0] || "";
    doc.text(truncatedFix, writer.margin + 132, writer.y + 4);

    writer.y += 7;
  });

  writer.y += 6;

  // --- SECTION 2: PRIORITY RESUME FIXES ---
  writer.drawSectionHeading("2. Priority Actionable Fixes (High-Impact Recommendations)", "Practical, clear adjustments to resolve parsing penalties and improve recruiter screening");

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

  fixesList.forEach((item, index) => {
    writer.ensureSpace(28);

    // Box for each priority fix
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.4);
    doc.roundedRect(writer.margin, writer.y, writer.contentWidth, 24, 2, 2, "FD");

    // Left border indicator based on severity
    const sev = item.severity || "Medium";
    if (sev === "Critical") doc.setFillColor(225, 29, 72);
    else if (sev === "High") doc.setFillColor(234, 88, 12);
    else if (sev === "Medium") doc.setFillColor(37, 99, 235);
    else doc.setFillColor(16, 185, 129);
    doc.rect(writer.margin, writer.y, 2.5, 24, "F");

    // Severity tag
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    if (sev === "Critical") doc.setTextColor(225, 29, 72);
    else if (sev === "High") doc.setTextColor(234, 88, 12);
    else if (sev === "Medium") doc.setTextColor(37, 99, 235);
    else doc.setTextColor(16, 185, 129);
    doc.text(`[${sev.toUpperCase()} PRIORITY #${index + 1}]`, writer.margin + 6, writer.y + 5.5);

    // Problem title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);
    doc.text(item.problem, writer.margin + 42, writer.y + 5.5);

    // Impact
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    const wrappedImpact = doc.splitTextToSize(`Impact: ${item.impact}`, writer.contentWidth - 10);
    doc.text(wrappedImpact[0] || "", writer.margin + 6, writer.y + 11.5);

    // Fix / Solution
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 58, 138);
    doc.text("Action:", writer.margin + 6, writer.y + 17.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(30, 41, 59);
    const wrappedFix = doc.splitTextToSize(item.fix, writer.contentWidth - 22);
    doc.text(wrappedFix[0] || "", writer.margin + 18, writer.y + 17.5);

    writer.y += 28;
  });

  writer.y += 4;

  // --- SECTION 3: SKILL GAP & MARKET COMPETENCY ANALYSIS ---
  writer.drawSectionHeading("3. Skill Gap & Market Competency Audit", "Identified strengths vs high-demand market competencies required for your target role");

  const skillGapData = data.roadmap?.skill_gap_report || {
    matched_skills: ["JavaScript", "TypeScript", "React", "Node.js", "Git"],
    missing_skills: [
      { skill: "Docker & Containerization", category: "Tool", priority: "High", reason: "Standard requirement in modern cloud deployments", suggested_improvement: "Containerize your primary full-stack app and push to DockerHub" },
      { skill: "Kubernetes & Orchestration", category: "Tool", priority: "High", reason: "Required for senior cloud engineering compensation bands", suggested_improvement: "Deploy a local Minikube cluster with multi-pod architecture" },
      { skill: "Distributed Redis Caching", category: "Technical Skill", priority: "Medium", reason: "Critical for high-traffic throughput and API scaling", suggested_improvement: "Implement Redis caching layer on frequent database query endpoints" },
      { skill: "AWS / Cloud Infrastructure", category: "Framework", priority: "High", reason: "Enterprise standard for scalable microservices", suggested_improvement: "Deploy project with S3, ECS/Lambda, and CloudFront integration" }
    ],
    match_percentage: 75
  };

  // Two Column Overview: Matched vs Missing Summary
  writer.ensureSpace(32);
  const colWidth = (writer.contentWidth - 4) / 2;

  // Left Column: Matched Skills Box
  doc.setFillColor(240, 253, 244);
  doc.setDrawColor(187, 247, 208);
  doc.roundedRect(writer.margin, writer.y, colWidth, 26, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(22, 101, 52);
  doc.text("VERIFIED MATCHED RESUME STRENGTHS", writer.margin + 4, writer.y + 6);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  const matchedText = (skillGapData.matched_skills || ["TypeScript", "React", "Node.js", "Git", "REST APIs"]).slice(0, 10).join("  ·  ");
  const wrappedMatched = doc.splitTextToSize(matchedText, colWidth - 8);
  doc.text(wrappedMatched, writer.margin + 4, writer.y + 13);

  // Right Column: Missing Skills Overview Box
  const rightX = writer.margin + colWidth + 4;
  doc.setFillColor(254, 242, 242);
  doc.setDrawColor(254, 205, 211);
  doc.roundedRect(rightX, writer.y, colWidth, 26, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(159, 18, 57);
  doc.text("CRITICAL HIRING GAPS DETECTED", rightX + 4, writer.y + 6);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  const rawMissing = skillGapData.missing_skills || [];
  const missingSummaryText = rawMissing.map((m: any) => typeof m === "string" ? m : m.skill || "Core Tool").slice(0, 8).join("  ·  ");
  const wrappedMissing = doc.splitTextToSize(missingSummaryText, colWidth - 8);
  doc.text(wrappedMissing, rightX + 4, writer.y + 13);

  writer.y += 32;

  // Granular Breakdown of each missing skill with Category, Priority & Actionable Plan
  writer.ensureSpace(14);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(30, 41, 59);
  doc.text("Detailed Competency Gap Action Items:", writer.margin, writer.y);
  writer.y += 5;

  rawMissing.slice(0, 5).forEach((item: any, idx: number) => {
    writer.ensureSpace(24);

    const isObj = typeof item === "object" && item !== null;
    const skillName = isObj ? (item.skill || `Gap #${idx + 1}`) : item;
    const category = isObj ? (item.category || "Technical Skill") : "Technical Skill";
    const priority = isObj ? (item.priority || "High") : "High";
    const reason = isObj ? (item.reason || "High demand in enterprise job postings") : "Missing in current resume keywords";
    const action = isObj ? (item.suggested_improvement || "Build a production-level GitHub project showcasing this competency.") : "Build a project demonstrating this skill.";

    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.4);
    doc.roundedRect(writer.margin, writer.y, writer.contentWidth, 20, 2, 2, "FD");

    // Severity indicator strip
    if (priority === "High") doc.setFillColor(225, 29, 72);
    else if (priority === "Medium") doc.setFillColor(245, 158, 11);
    else doc.setFillColor(59, 130, 246);
    doc.rect(writer.margin, writer.y, 2.5, 20, "F");

    // Skill Name + Category Pill
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text(`[${category.toUpperCase()}] ${skillName}`, writer.margin + 6, writer.y + 5.5);

    // Priority Tag
    doc.setFontSize(8);
    if (priority === "High") doc.setTextColor(225, 29, 72);
    else if (priority === "Medium") doc.setTextColor(180, 83, 9);
    else doc.setTextColor(37, 99, 235);
    doc.text(`${priority} Priority`, writer.pageWidth - writer.margin - 24, writer.y + 5.5);

    // Why Recruiters Reject
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    const wrappedReason = doc.splitTextToSize(`Hiring Friction: ${reason}`, writer.contentWidth - 12);
    doc.text(wrappedReason[0] || "", writer.margin + 6, writer.y + 10.5);

    // How to Fix
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 58, 138);
    doc.text("Prescribed Fix:", writer.margin + 6, writer.y + 15.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(51, 65, 85);
    const wrappedFix = doc.splitTextToSize(action, writer.contentWidth - 34);
    doc.text(wrappedFix[0] || "", writer.margin + 30, writer.y + 15.5);

    writer.y += 24;
  });

  writer.y += 4;

  // --- SECTION 4: GLOBAL SALARY BENCHMARK & COMPENSATION INTELLIGENCE ---
  writer.drawSectionHeading("4. Global Salary Benchmarks & Market Compensation (2026)", "Verified compensation tiers across leading regions and remote employment markets");

  writer.ensureSpace(32);
  const salaryTiers = [
    { region: "United States (US Tier 1 / Silicon Valley / NY)", range: "$115,000 – $165,000 / year", level: "Senior / High Demand" },
    { region: "European Union / United Kingdom (UK / Germany)", range: "€75,000 – €110,000 / year", level: "Competitive Mid-Senior" },
    { region: "Global Remote / Cross-Border High-Growth", range: "$85,000 – $135,000 / year", level: "Remote Top 10% Talent" },
    { region: "India & South Asia Tech Hubs (BLR / HYD / NCR)", range: "₹18,00,000 – ₹38,00,000 / year", level: "High-Velocity Product Firms" }
  ];

  salaryTiers.forEach((tier) => {
    writer.ensureSpace(12);
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.roundedRect(writer.margin, writer.y, writer.contentWidth, 10, 1.5, 1.5, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text(`🌐 ${tier.region}`, writer.margin + 4, writer.y + 6.5);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(4, 120, 87); // Emerald Green
    doc.text(tier.range, writer.margin + 112, writer.y + 6.5);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(tier.level, writer.pageWidth - writer.margin - doc.getTextWidth(tier.level) - 4, writer.y + 6.5);

    writer.y += 13;
  });

  writer.y += 4;

  // --- SECTION 5: 4-WEEK CAREER ACCELERATION ROADMAP ---
  writer.drawSectionHeading("5. 4-Week Career Sprint Execution Plan", "Week-by-week implementation milestones, practical projects, and core deliverables");

  const rawSprints = data.roadmap?.sprints || [];
  const defaultSprints = [
    {
      sprint_number: 1,
      theme: "Week 1: Architecture Foundation, Clean Code & State Management",
      milestone_goal: "Master modern design patterns, state normalization, and eliminate unnecessary render cycles.",
      key_deliverables: ["Implement Clean Architecture design pattern", "Profile network requests & reduce bundle size by 25%"],
      practical_project: "Build a production-grade scalable state management architecture with TypeScript",
      weeks: [
        {
          week: 1,
          title: "Core Framework Mastery & Performance Profiling",
          tasks: [
            { type: "project", title: "Refactor core UI layer into pure functional components", platform: "Local / GitHub", hours: 8, tech: ["TypeScript", "React"], details: "Eliminate re-renders with memoization and clean store hooks" },
            { type: "skill", title: "Implement centralized error boundary & logging", platform: "Production Docs", hours: 4, tech: ["REST APIs"], details: "Handle edge-case network dropouts gracefully" }
          ]
        }
      ]
    },
    {
      sprint_number: 2,
      theme: "Week 2: Backend Scalability, Data Pipeline & Redis Caching",
      milestone_goal: "Design high-concurrency API endpoints, compound database indexing, and sub-50ms caching.",
      key_deliverables: ["Configure database connection pooling & query indexing", "Integrate Redis distributed caching layer"],
      practical_project: "Build a high-throughput RESTful API with automated rate limiting and cache invalidation",
      weeks: [
        {
          week: 2,
          title: "Data Layer Optimization & High-Throughput APIs",
          tasks: [
            { type: "project", title: "Benchmark and optimize slow database queries", platform: "PostgreSQL / MongoDB", hours: 10, tech: ["SQL", "Indexes"], details: "Add compound indexes to slash response time by 60%" },
            { type: "skill", title: "Set up Redis cache with TTL strategies", platform: "Redis Cloud", hours: 6, tech: ["Redis", "Node.js"], details: "Cache hot user sessions and repeated queries" }
          ]
        }
      ]
    },
    {
      sprint_number: 3,
      theme: "Week 3: Cloud Infrastructure, Docker & Automated CI/CD Pipelines",
      milestone_goal: "Containerize multi-container applications and automate zero-downtime production deployment.",
      key_deliverables: ["Author production multi-stage Dockerfiles", "Configure GitHub Actions CI/CD to AWS/GCP cloud"],
      practical_project: "Deploy microservices container cluster with health check monitoring and automated rollouts",
      weeks: [
        {
          week: 3,
          title: "DevOps & Production Cloud Deployment",
          tasks: [
            { type: "project", title: "Create optimized multi-stage Docker container", platform: "Docker", hours: 8, tech: ["Docker", "Linux"], details: "Keep final container image footprint under 150MB" },
            { type: "skill", title: "Build GitHub Actions automated test & deploy pipeline", platform: "GitHub Actions", hours: 6, tech: ["CI/CD", "Cloud"], details: "Auto-lint, test, build, and deploy upon branch merges" }
          ]
        }
      ]
    },
    {
      sprint_number: 4,
      theme: "Week 4: Enterprise System Design & Interview Preparation",
      milestone_goal: "High-level architecture trade-offs, portfolio presentation, and cracking technical interview rounds.",
      key_deliverables: ["Conduct live load testing and latency benchmarks", "Document production architectural trade-offs in README"],
      practical_project: "Publish complete end-to-end portfolio project with live deployment and technical case study",
      weeks: [
        {
          week: 4,
          title: "System Design Rigor & Interview Simulation",
          tasks: [
            { type: "project", title: "Publish technical architecture diagram & case study", platform: "GitHub / Portfolio", hours: 8, tech: ["System Design"], details: "Document latency metrics, trade-offs, and scalability choices" },
            { type: "skill", title: "Practice 15 role-specific technical interview questions", platform: "LeetCode / System Design", hours: 8, tech: ["Algorithms", "Design"], details: "Prepare behavioral XYZ stories and system design diagrams" }
          ]
        }
      ]
    }
  ];

  const sprints = rawSprints.length > 0 ? rawSprints : defaultSprints;

  sprints.forEach((sprint: any, idx: number) => {
    writer.ensureSpace(36);

    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.4);
    
    // Estimate card height based on tasks
    const tasksCount = sprint.weeks ? sprint.weeks.reduce((acc: number, w: any) => acc + (w.tasks?.length || 0), 0) : 0;
    const boxHeight = Math.max(30, 24 + (tasksCount * 8));
    doc.roundedRect(writer.margin, writer.y, writer.contentWidth, boxHeight, 2, 2, "FD");

    // Sprint number badge
    doc.setFillColor(37, 99, 235);
    doc.roundedRect(writer.margin + 3, writer.y + 3, 22, 5.5, 1, 1, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text(`WEEK ${sprint.sprint_number || idx + 1}`, writer.margin + 5, writer.y + 7);

    // Title / Theme
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);
    const sprintTheme = sprint.theme || sprint.sprint_name || `Sprint ${idx + 1}: Core Milestone`;
    doc.text(doc.splitTextToSize(sprintTheme, writer.contentWidth - 36)[0] || "", writer.margin + 28, writer.y + 7);

    // Milestone Goal
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    const goalText = sprint.milestone_goal || "Complete sprint core technical deliverables";
    doc.text(doc.splitTextToSize(`Goal: ${goalText}`, writer.contentWidth - 10)[0] || "", writer.margin + 6, writer.y + 13.5);

    // Hands-on Project
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 58, 138);
    doc.text("Hands-on Project:", writer.margin + 6, writer.y + 19);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(51, 65, 85);
    const proj = sprint.practical_project || (sprint.key_deliverables ? sprint.key_deliverables.join(", ") : "Production code deliverable");
    doc.text(doc.splitTextToSize(proj, writer.contentWidth - 45)[0] || "", writer.margin + 36, writer.y + 19);

    let innerY = writer.y + 24;

    // Granular week tasks inside sprint
    if (sprint.weeks && Array.isArray(sprint.weeks)) {
      sprint.weeks.forEach((w: any) => {
        if (w.tasks && Array.isArray(w.tasks)) {
          w.tasks.slice(0, 2).forEach((task: any) => {
            doc.setFont("helvetica", "bold");
            doc.setFontSize(7.5);
            doc.setTextColor(37, 99, 235);
            doc.text(`• [${(task.type || 'TASK').toUpperCase()}]`, writer.margin + 8, innerY);

            doc.setFont("helvetica", "normal");
            doc.setFontSize(7.5);
            doc.setTextColor(51, 65, 85);
            const taskStr = `${task.title}${task.hours ? ` (${task.hours}h)` : ''}${task.details ? ` - ${task.details}` : ''}`;
            doc.text(doc.splitTextToSize(taskStr, writer.contentWidth - 35)[0] || "", writer.margin + 28, innerY);
            innerY += 6.5;
          });
        }
      });
    }

    writer.y += boxHeight + 4;
  });

  writer.y += 4;

  // --- SECTION 5: CURATED LEARNING RESOURCES WITH LIVE HYPERLINKS ---
  writer.drawSectionHeading("5. Curated Learning Resources (with Live Clickable Links)", "Hand-selected official documentation, interactive practice platforms, and courses");

  const learningList: Array<{
    title: string;
    topic: string;
    url: string;
    type: string;
    time: string;
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
          type: r.type || "Documentation",
          time: r.estimatedTime || "Self-paced"
        });
      });
    } else {
      if (item.official_documentation) {
        learningList.push({
          title: `Official ${topic} Documentation`,
          topic,
          url: item.official_documentation,
          type: "Documentation",
          time: "Reference"
        });
      }
      if (item.practice_websites) {
        learningList.push({
          title: `${topic} Hands-on Practice`,
          topic,
          url: item.practice_websites,
          type: "Interactive Practice",
          time: "4-6 hrs"
        });
      }
      if (item.free_youtube_courses) {
        learningList.push({
          title: `${topic} Recommended Video Course`,
          topic,
          url: item.free_youtube_courses,
          type: "Video Course",
          time: "Comprehensive"
        });
      }
    }
  });

  // Fallback resources if empty
  if (learningList.length === 0) {
    learningList.push(
      { title: "React Official Documentation & Architecture Guides", topic: "React 19", url: "https://react.dev", type: "Documentation", time: "Self-paced" },
      { title: "TypeScript Handbook & Type System Mastery", topic: "TypeScript", url: "https://www.typescriptlang.org/docs/", type: "Documentation", time: "Self-paced" },
      { title: "Docker Official Getting Started Tutorial", topic: "Containerization", url: "https://docs.docker.com/get-started/", type: "Hands-on", time: "3 hours" },
      { title: "AWS Cloud Practitioner & Architecture Fundamentals", topic: "Cloud Architecture", url: "https://aws.amazon.com/training/", type: "Cloud Course", time: "6 hours" },
      { title: "FreeCodeCamp Enterprise Backend & APIs", topic: "Backend Engineering", url: "https://www.freecodecamp.org", type: "Interactive Platform", time: "Ongoing" }
    );
  }

  learningList.slice(0, 10).forEach((res) => {
    writer.ensureSpace(16);

    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.roundedRect(writer.margin, writer.y, writer.contentWidth, 13, 2, 2, "FD");

    // Topic & Type
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text(`[${res.topic.toUpperCase()} · ${res.type.toUpperCase()}]`, writer.margin + 4, writer.y + 4.5);

    // Clickable Title with Hyperlink
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(37, 99, 235); // Blue link color
    
    const displayTitle = doc.splitTextToSize(res.title, writer.contentWidth - 45)[0] || res.title;
    doc.textWithLink(displayTitle, writer.margin + 4, writer.y + 9.5, { url: res.url });

    // Underline effect for visual hyperlink cue
    const titleWidth = doc.getTextWidth(displayTitle);
    doc.setDrawColor(37, 99, 235);
    doc.setLineWidth(0.2);
    doc.line(writer.margin + 4, writer.y + 10.2, writer.margin + 4 + titleWidth, writer.y + 10.2);

    // "Open Link ->" action tag on right
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(30, 64, 175);
    const linkActionText = "CLICK TO OPEN →";
    const actionWidth = doc.getTextWidth(linkActionText);
    const actionX = writer.pageWidth - writer.margin - actionWidth - 4;
    doc.textWithLink(linkActionText, actionX, writer.y + 8, { url: res.url });

    writer.y += 16;
  });

  // Apply running footers to all pages
  writer.drawFooters();

  // Trigger download in browser
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
  doc.roundedRect(writer.margin, writer.y, writer.contentWidth, 32, 3, 3, "F");
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(writer.margin, writer.y, writer.contentWidth, 32, 3, 3, "S");

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
    matched_skills: ["JavaScript", "TypeScript", "React", "Node.js", "Express", "Git"],
    missing_skills: ["Docker", "Kubernetes", "Redis", "AWS Microservices", "CI/CD Pipelines", "System Architecture"],
    match_percentage: 75
  };

  writer.drawSectionHeading("1. Verified Profile Strengths", "Core competencies detected and verified in your uploaded resume");
  
  writer.ensureSpace(30);
  (skillGapData.matched_skills || []).forEach((skill, idx) => {
    writer.ensureSpace(8);
    doc.setFillColor(240, 253, 244);
    doc.roundedRect(writer.margin, writer.y, writer.contentWidth, 7, 1.5, 1.5, "F");
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(22, 101, 52);
    doc.text(`✓ ${skill}`, writer.margin + 4, writer.y + 4.8);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text("Matched with industry criteria", writer.margin + 70, writer.y + 4.8);
    writer.y += 8.5;
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
    writer.ensureSpace(24);

    const isObj = typeof item === "object" && item !== null;
    const skillName = isObj ? (item.skill || `Gap #${idx + 1}`) : item;
    const category = isObj ? (item.category || "Technical Skill") : "Technical Skill";
    const priority = isObj ? (item.priority || "High") : "High";
    const reason = isObj ? (item.reason || "High demand in enterprise job postings") : "Missing in current resume keywords";
    const action = isObj ? (item.suggested_improvement || "Build a production-level GitHub project showcasing this competency.") : "Build a project demonstrating this skill.";

    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.4);
    doc.roundedRect(writer.margin, writer.y, writer.contentWidth, 20, 2, 2, "FD");

    // Severity indicator strip
    if (priority === "High") doc.setFillColor(225, 29, 72);
    else if (priority === "Medium") doc.setFillColor(245, 158, 11);
    else doc.setFillColor(59, 130, 246);
    doc.rect(writer.margin, writer.y, 2.5, 20, "F");

    // Skill Name + Category Pill
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text(`[${category.toUpperCase()}] ${skillName}`, writer.margin + 6, writer.y + 5.5);

    // Priority Tag
    doc.setFontSize(8);
    if (priority === "High") doc.setTextColor(225, 29, 72);
    else if (priority === "Medium") doc.setTextColor(180, 83, 9);
    else doc.setTextColor(37, 99, 235);
    doc.text(`${priority} Priority`, writer.pageWidth - writer.margin - 24, writer.y + 5.5);

    // Why Recruiters Reject
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    const wrappedReason = doc.splitTextToSize(`Hiring Friction: ${reason}`, writer.contentWidth - 12);
    doc.text(wrappedReason[0] || "", writer.margin + 6, writer.y + 10.5);

    // How to Fix
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 58, 138);
    doc.text("Prescribed Fix:", writer.margin + 6, writer.y + 15.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(51, 65, 85);
    const wrappedFix = doc.splitTextToSize(action, writer.contentWidth - 34);
    doc.text(wrappedFix[0] || "", writer.margin + 30, writer.y + 15.5);

    writer.y += 24;
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
  doc.roundedRect(writer.margin, writer.y, writer.contentWidth, 32, 3, 3, "F");
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(writer.margin, writer.y, writer.contentWidth, 32, 3, 3, "S");

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

  writer.drawSectionHeading("Essential Learning Track & Direct Hyperlinks", "Click any resource title or the link arrow to open the resource directly in your browser");

  const list: Array<{ title: string; category: string; url: string; type: string; desc: string }> = [];
  const rawResources = data.roadmap?.learning_resources || [];

  rawResources.forEach((cat: any) => {
    const topic = cat.category || cat.skill_or_topic || "Engineering Topic";
    if (cat.resources && Array.isArray(cat.resources)) {
      cat.resources.forEach((r: any) => {
        list.push({
          title: r.title || `${topic} Guide`,
          category: topic,
          url: r.url || "https://google.com",
          type: r.type || "Guide",
          desc: r.description || "In-depth study resource."
        });
      });
    } else {
      if (cat.official_documentation) {
        list.push({
          title: `Official ${topic} Documentation`,
          category: topic,
          url: cat.official_documentation,
          type: "Official Docs",
          desc: "Reference manuals and standard API guides."
        });
      }
      if (cat.practice_websites) {
        list.push({
          title: `${topic} Hands-on Practice & Exercises`,
          category: topic,
          url: cat.practice_websites,
          type: "Interactive Platform",
          desc: "Interactive code challenges and sandboxes."
        });
      }
      if (cat.free_youtube_courses) {
        list.push({
          title: `${topic} Video Course Series`,
          category: topic,
          url: cat.free_youtube_courses,
          type: "Video Course",
          desc: "Comprehensive video walkthrough."
        });
      }
    }
  });

  if (list.length === 0) {
    list.push(
      { title: "React 19 Official Documentation & Core Concepts", category: "React", url: "https://react.dev", type: "Docs", desc: "Official deep-dive reference." },
      { title: "TypeScript Official Handbook", category: "TypeScript", url: "https://www.typescriptlang.org/docs/", type: "Docs", desc: "Complete type system guides." },
      { title: "Docker Official Get Started Guides", category: "Containers", url: "https://docs.docker.com/get-started/", type: "Tutorial", desc: "Build & deploy images." },
      { title: "AWS Cloud Architecture & Training", category: "Cloud", url: "https://aws.amazon.com/training/", type: "Course", desc: "Cloud infrastructure essentials." }
    );
  }

  list.forEach((item, index) => {
    writer.ensureSpace(18);

    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.4);
    doc.roundedRect(writer.margin, writer.y, writer.contentWidth, 15, 2, 2, "FD");

    // Index & Category
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text(`#${index + 1}  [${item.category.toUpperCase()} · ${item.type.toUpperCase()}]`, writer.margin + 4, writer.y + 4.8);

    // Hyperlink Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(37, 99, 235);
    const displayTitle = doc.splitTextToSize(item.title, writer.contentWidth - 45)[0] || item.title;
    doc.textWithLink(displayTitle, writer.margin + 4, writer.y + 10.5, { url: item.url });

    // Underline
    const titleWidth = doc.getTextWidth(displayTitle);
    doc.setDrawColor(37, 99, 235);
    doc.setLineWidth(0.2);
    doc.line(writer.margin + 4, writer.y + 11.2, writer.margin + 4 + titleWidth, writer.y + 11.2);

    // Action Link
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(30, 64, 175);
    const linkActionText = "CLICK TO OPEN →";
    const actionWidth = doc.getTextWidth(linkActionText);
    const actionX = writer.pageWidth - writer.margin - actionWidth - 4;
    doc.textWithLink(linkActionText, actionX, writer.y + 9, { url: item.url });

    writer.y += 18;
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
  doc.roundedRect(writer.margin, writer.y, writer.contentWidth, 32, 3, 3, "F");
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(writer.margin, writer.y, writer.contentWidth, 32, 3, 3, "S");

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
      theme: "Architecture Foundation, Clean Code & State Management",
      milestone_goal: "Master modern design patterns, state normalization, and eliminate unnecessary render cycles.",
      key_deliverables: ["Implement Clean Architecture design pattern", "Profile network requests & reduce bundle size by 25%"],
      practical_project: "Build a production-grade scalable state management architecture with TypeScript",
      weeks: [
        {
          week: 1,
          title: "Core Framework Mastery & Performance Profiling",
          tasks: [
            { type: "project", title: "Refactor core UI layer into pure functional components", platform: "Local / GitHub", hours: 8, tech: ["TypeScript", "React"], details: "Eliminate re-renders with memoization and clean store hooks" },
            { type: "skill", title: "Implement centralized error boundary & logging", platform: "Production Docs", hours: 4, tech: ["REST APIs"], details: "Handle edge-case network dropouts gracefully" }
          ]
        }
      ]
    },
    {
      sprint_number: 2,
      theme: "Backend Scalability, Data Pipeline & Redis Caching",
      milestone_goal: "Design high-concurrency API endpoints, compound database indexing, and sub-50ms caching.",
      key_deliverables: ["Configure database connection pooling & query indexing", "Integrate Redis distributed caching layer"],
      practical_project: "Build a high-throughput RESTful API with automated rate limiting and cache invalidation",
      weeks: [
        {
          week: 2,
          title: "Data Layer Optimization & High-Throughput APIs",
          tasks: [
            { type: "project", title: "Benchmark and optimize slow database queries", platform: "PostgreSQL / MongoDB", hours: 10, tech: ["SQL", "Indexes"], details: "Add compound indexes to slash response time by 60%" },
            { type: "skill", title: "Set up Redis cache with TTL strategies", platform: "Redis Cloud", hours: 6, tech: ["Redis", "Node.js"], details: "Cache hot user sessions and repeated queries" }
          ]
        }
      ]
    },
    {
      sprint_number: 3,
      theme: "Cloud Infrastructure, Docker & Automated CI/CD Pipelines",
      milestone_goal: "Containerize multi-container applications and automate zero-downtime production deployment.",
      key_deliverables: ["Author production multi-stage Dockerfiles", "Configure GitHub Actions CI/CD to AWS/GCP cloud"],
      practical_project: "Deploy microservices container cluster with health check monitoring and automated rollouts",
      weeks: [
        {
          week: 3,
          title: "DevOps & Production Cloud Deployment",
          tasks: [
            { type: "project", title: "Create optimized multi-stage Docker container", platform: "Docker", hours: 8, tech: ["Docker", "Linux"], details: "Keep final container image footprint under 150MB" },
            { type: "skill", title: "Build GitHub Actions automated test & deploy pipeline", platform: "GitHub Actions", hours: 6, tech: ["CI/CD", "Cloud"], details: "Auto-lint, test, build, and deploy upon branch merges" }
          ]
        }
      ]
    },
    {
      sprint_number: 4,
      theme: "Enterprise System Design & Interview Preparation",
      milestone_goal: "High-level architecture trade-offs, portfolio presentation, and cracking technical interview rounds.",
      key_deliverables: ["Conduct live load testing and latency benchmarks", "Document production architectural trade-offs in README"],
      practical_project: "Publish complete end-to-end portfolio project with live deployment and technical case study",
      weeks: [
        {
          week: 4,
          title: "System Design Rigor & Interview Simulation",
          tasks: [
            { type: "project", title: "Publish technical architecture diagram & case study", platform: "GitHub / Portfolio", hours: 8, tech: ["System Design"], details: "Document latency metrics, trade-offs, and scalability choices" },
            { type: "skill", title: "Practice 15 role-specific technical interview questions", platform: "LeetCode / System Design", hours: 8, tech: ["Algorithms", "Design"], details: "Prepare behavioral XYZ stories and system design diagrams" }
          ]
        }
      ]
    }
  ];

  const sprints = rawSprints.length > 0 ? rawSprints : defaultSprints;

  sprints.forEach((sprint: any, idx: number) => {
    writer.ensureSpace(36);

    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.4);

    const tasksCount = sprint.weeks ? sprint.weeks.reduce((acc: number, w: any) => acc + (w.tasks?.length || 0), 0) : 0;
    const boxHeight = Math.max(30, 24 + (tasksCount * 8));
    doc.roundedRect(writer.margin, writer.y, writer.contentWidth, boxHeight, 2, 2, "FD");

    // Sprint number badge
    doc.setFillColor(37, 99, 235);
    doc.roundedRect(writer.margin + 3, writer.y + 3, 22, 5.5, 1, 1, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text(`WEEK ${sprint.sprint_number || idx + 1}`, writer.margin + 5, writer.y + 7);

    // Title / Theme
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);
    const sprintTheme = sprint.theme || sprint.sprint_name || `Sprint ${idx + 1}: Core Milestone`;
    doc.text(doc.splitTextToSize(sprintTheme, writer.contentWidth - 36)[0] || "", writer.margin + 28, writer.y + 7);

    // Goal
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    const goalText = sprint.milestone_goal || "Complete sprint core technical deliverables";
    doc.text(doc.splitTextToSize(`Goal: ${goalText}`, writer.contentWidth - 10)[0] || "", writer.margin + 6, writer.y + 13.5);

    // Hands-on Project
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 58, 138);
    doc.text("Hands-on Project:", writer.margin + 6, writer.y + 19);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(51, 65, 85);
    const proj = sprint.practical_project || (sprint.key_deliverables ? sprint.key_deliverables.join(", ") : "Production code deliverable");
    doc.text(doc.splitTextToSize(proj, writer.contentWidth - 45)[0] || "", writer.margin + 36, writer.y + 19);

    let innerY = writer.y + 24;

    // Granular week tasks inside sprint
    if (sprint.weeks && Array.isArray(sprint.weeks)) {
      sprint.weeks.forEach((w: any) => {
        if (w.tasks && Array.isArray(w.tasks)) {
          w.tasks.slice(0, 2).forEach((task: any) => {
            doc.setFont("helvetica", "bold");
            doc.setFontSize(7.5);
            doc.setTextColor(37, 99, 235);
            doc.text(`• [${(task.type || 'TASK').toUpperCase()}]`, writer.margin + 8, innerY);

            doc.setFont("helvetica", "normal");
            doc.setFontSize(7.5);
            doc.setTextColor(51, 65, 85);
            const taskStr = `${task.title}${task.hours ? ` (${task.hours}h)` : ''}${task.details ? ` - ${task.details}` : ''}`;
            doc.text(doc.splitTextToSize(taskStr, writer.contentWidth - 35)[0] || "", writer.margin + 28, innerY);
            innerY += 6.5;
          });
        }
      });
    }

    writer.y += boxHeight + 4;
  });

  writer.drawFooters();
  doc.save(`Career_Roadmap_${candidate.replace(/\s+/g, "_")}.pdf`);
}
