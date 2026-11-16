import os
import shutil
import pptx
from pptx.util import Inches, Pt
from pptx.enum.text import PP_ALIGN
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE

def create_deck():
    prs = pptx.Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6]

    # Color Palette
    BG_COLOR = RGBColor(11, 17, 32)        # #0B1120 Deep Navy
    CARD_BG = RGBColor(24, 34, 53)         # Slate Navy Card
    CARD_BORDER = RGBColor(51, 65, 85)     # #334155
    CYAN = RGBColor(6, 182, 212)           # #06B6D4 Neon Cyan
    EMERALD = RGBColor(16, 185, 129)       # #10B981 Emerald Green
    PURPLE = RGBColor(139, 92, 246)        # #8B5CF6 Violet
    AMBER = RGBColor(245, 158, 11)         # #F59E0B Amber
    TEXT_WHITE = RGBColor(248, 250, 252)   # #F8FAFC
    TEXT_MUTED = RGBColor(148, 163, 184)   # #94A3B8

    def set_slide_bg(slide):
        bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, prs.slide_height)
        bg.fill.solid()
        bg.fill.fore_color.rgb = BG_COLOR
        bg.line.fill.background()
        return bg

    def add_header(slide, title_text, category_text, slide_num):
        set_slide_bg(slide)
        
        # Category pill
        pill = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(0.4), Inches(3.2), Inches(0.35))
        pill.fill.solid()
        pill.fill.fore_color.rgb = RGBColor(15, 23, 42)
        pill.line.color.rgb = CYAN
        pill.line.width = Pt(1)
        tf_pill = pill.text_frame
        tf_pill.word_wrap = True
        p_pill = tf_pill.paragraphs[0]
        p_pill.text = category_text.upper()
        p_pill.font.size = Pt(10)
        p_pill.font.bold = True
        p_pill.font.color.rgb = CYAN
        p_pill.alignment = PP_ALIGN.CENTER

        # Slide Number
        num_box = slide.shapes.add_textbox(Inches(11.8), Inches(0.35), Inches(0.8), Inches(0.4))
        tf_num = num_box.text_frame
        p_num = tf_num.paragraphs[0]
        p_num.text = f"{slide_num:02d} / 15"
        p_num.font.size = Pt(11)
        p_num.font.bold = True
        p_num.font.color.rgb = TEXT_MUTED
        p_num.alignment = PP_ALIGN.RIGHT

        # Main Title
        title_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.78), Inches(11.0), Inches(0.65))
        tf_title = title_box.text_frame
        tf_title.word_wrap = True
        p_title = tf_title.paragraphs[0]
        p_title.text = title_text
        p_title.font.size = Pt(22)
        p_title.font.bold = True
        p_title.font.color.rgb = TEXT_WHITE

    def add_card(slide, left, top, width, height, title, subtitle="", bullets=None, border_color=CARD_BORDER, bg_color=CARD_BG):
        card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(left), Inches(top), Inches(width), Inches(height))
        card.fill.solid()
        card.fill.fore_color.rgb = bg_color
        card.line.color.rgb = border_color
        card.line.width = Pt(1.5)

        tx = slide.shapes.add_textbox(Inches(left + 0.15), Inches(top + 0.15), Inches(width - 0.3), Inches(height - 0.3))
        tf = tx.text_frame
        tf.word_wrap = True

        p0 = tf.paragraphs[0]
        p0.text = title
        p0.font.size = Pt(14)
        p0.font.bold = True
        p0.font.color.rgb = TEXT_WHITE

        if subtitle:
            p_sub = tf.add_paragraph()
            p_sub.text = subtitle
            p_sub.font.size = Pt(11)
            p_sub.font.color.rgb = CYAN
            p_sub.space_before = Pt(3)

        if bullets:
            for b in bullets:
                p_b = tf.add_paragraph()
                p_b.text = "• " + b
                p_b.font.size = Pt(10.5)
                p_b.font.color.rgb = TEXT_MUTED
                p_b.space_before = Pt(4)
        return card

    def add_image_card(slide, img_path, left, top, width, height, label=""):
        if not os.path.exists(img_path):
            return None
        # Border frame behind image
        frame = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(left - 0.05), Inches(top - 0.05), Inches(width + 0.1), Inches(height + (0.35 if label else 0.1)))
        frame.fill.solid()
        frame.fill.fore_color.rgb = RGBColor(15, 23, 42)
        frame.line.color.rgb = CYAN
        frame.line.width = Pt(1.5)

        pic = slide.shapes.add_picture(img_path, Inches(left), Inches(top), Inches(width), Inches(height))

        if label:
            lbl_box = slide.shapes.add_textbox(Inches(left), Inches(top + height), Inches(width), Inches(0.35))
            tf_lbl = lbl_box.text_frame
            p_lbl = tf_lbl.paragraphs[0]
            p_lbl.text = label
            p_lbl.font.size = Pt(9.5)
            p_lbl.font.bold = True
            p_lbl.font.color.rgb = CYAN
            p_lbl.alignment = PP_ALIGN.CENTER
        return pic

    # Base paths
    desktop_dir = r"screenshots\desktop"
    mobile_dir = r"screenshots\mobile"

    # ==========================================
    # SLIDE 1: COVER SLIDE
    # ==========================================
    s1 = prs.slides.add_slide(blank_layout)
    set_slide_bg(s1)

    # Gradient-like top decorative bar
    bar = s1.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, Inches(0.12))
    bar.fill.solid()
    bar.fill.fore_color.rgb = CYAN
    bar.line.fill.background()

    # Team pill
    tp = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(1.0), Inches(1.2), Inches(3.5), Inches(0.45))
    tp.fill.solid()
    tp.fill.fore_color.rgb = RGBColor(15, 23, 42)
    tp.line.color.rgb = CYAN
    tp.line.width = Pt(1.5)
    tf_tp = tp.text_frame
    p_tp = tf_tp.paragraphs[0]
    p_tp.text = "⚡ PRESENTED BY TEAM THE HUSTLERS"
    p_tp.font.size = Pt(11)
    p_tp.font.bold = True
    p_tp.font.color.rgb = CYAN
    p_tp.alignment = PP_ALIGN.CENTER

    # Hero Title
    t_box = s1.shapes.add_textbox(Inches(1.0), Inches(1.85), Inches(11.3), Inches(1.5))
    tf_t = t_box.text_frame
    tf_t.word_wrap = True
    p_t = tf_t.paragraphs[0]
    p_t.text = "Career Navigation AI"
    p_t.font.size = Pt(44)
    p_t.font.bold = True
    p_t.font.color.rgb = TEXT_WHITE

    p_sub = tf_t.add_paragraph()
    p_sub.text = "Next-Generation Autonomous Career Transition Copilot & ATS Intelligence Engine"
    p_sub.font.size = Pt(18)
    p_sub.font.color.rgb = CYAN
    p_sub.space_before = Pt(8)

    # Team & Credits Card
    c_team = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(1.0), Inches(3.6), Inches(6.0), Inches(2.9))
    c_team.fill.solid()
    c_team.fill.fore_color.rgb = CARD_BG
    c_team.line.color.rgb = CYAN
    c_team.line.width = Pt(1.5)
    tf_c = c_team.text_frame
    tf_c.word_wrap = True

    p_c0 = tf_c.paragraphs[0]
    p_c0.text = "👥 Team Members & Project Creators"
    p_c0.font.size = Pt(16)
    p_c0.font.bold = True
    p_c0.font.color.rgb = TEXT_WHITE

    p_m1 = tf_c.add_paragraph()
    p_m1.text = "• Kamaljit — Lead Full-Stack Architect & AI Engineer"
    p_m1.font.size = Pt(13)
    p_m1.font.bold = True
    p_m1.font.color.rgb = EMERALD
    p_m1.space_before = Pt(12)

    p_m1_sub = tf_c.add_paragraph()
    p_m1_sub.text = "   BCA, Lovely Professional University (2026)"
    p_m1_sub.font.size = Pt(11)
    p_m1_sub.font.color.rgb = TEXT_MUTED

    p_m2 = tf_c.add_paragraph()
    p_m2.text = "• Mantaj — Co-Developer & UI/UX Specialist"
    p_m2.font.size = Pt(13)
    p_m2.font.bold = True
    p_m2.font.color.rgb = PURPLE
    p_m2.space_before = Pt(10)

    p_m2_sub = tf_c.add_paragraph()
    p_m2_sub.text = "   Team The Hustlers"
    p_m2_sub.font.size = Pt(11)
    p_m2_sub.font.color.rgb = TEXT_MUTED

    # Live Deployment & Repo Card
    c_links = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(7.3), Inches(3.6), Inches(5.0), Inches(2.9))
    c_links.fill.solid()
    c_links.fill.fore_color.rgb = CARD_BG
    c_links.line.color.rgb = EMERALD
    c_links.line.width = Pt(1.5)
    tf_l = c_links.text_frame
    tf_l.word_wrap = True

    p_l0 = tf_l.paragraphs[0]
    p_l0.text = "🌐 Production Deliverables"
    p_l0.font.size = Pt(16)
    p_l0.font.bold = True
    p_l0.font.color.rgb = TEXT_WHITE

    p_l1 = tf_l.add_paragraph()
    p_l1.text = "🚀 Live Web Application:"
    p_l1.font.size = Pt(12)
    p_l1.font.bold = True
    p_l1.font.color.rgb = CYAN
    p_l1.space_before = Pt(10)

    p_l1_url = tf_l.add_paragraph()
    p_l1_url.text = "https://carrer-nav-ai.vercel.app"
    p_l1_url.font.size = Pt(12)
    p_l1_url.font.color.rgb = TEXT_WHITE

    p_l2 = tf_l.add_paragraph()
    p_l2.text = "💻 GitHub Repository:"
    p_l2.font.size = Pt(12)
    p_l2.font.bold = True
    p_l2.font.color.rgb = EMERALD
    p_l2.space_before = Pt(12)

    p_l2_url = tf_l.add_paragraph()
    p_l2_url.text = "github.com/raj40870-pixel/Ai-skill-"
    p_l2_url.font.size = Pt(12)
    p_l2_url.font.color.rgb = TEXT_WHITE

    # ==========================================
    # SLIDE 2: THE PROBLEM STATEMENT
    # ==========================================
    s2 = prs.slides.add_slide(blank_layout)
    add_header(s2, "The Hiring Dilemma: The 75% ATS Rejection Black Hole", "Industry Problem & Motivation", 2)

    add_card(s2, 0.8, 1.6, 3.6, 5.2, "🚫 The ATS Black Hole", "Over 75% resumes never seen by human eyes", [
        "Modern Enterprise ATS systems automatically discard candidate resumes based on arbitrary keyword parsing and formatting quirks.",
        "Talented candidates with real skills get rejected instantly due to unoptimized bullet structures.",
        "Zero feedback loop leaves job seekers blind to why their applications failed."
    ], border_color=AMBER)

    add_card(s2, 4.8, 1.6, 3.6, 5.2, "🧭 Directionless Upskilling", "Tutorial hell & missing targeted roadmaps", [
        "Generic online roadmaps don't adapt to individual strengths and missing role requirements.",
        "Job seekers spend months learning redundant libraries rather than high-leverage production skills.",
        "No objective verification of proficiency levels or industry alignment."
    ], border_color=PURPLE)

    add_card(s2, 8.8, 1.6, 3.7, 5.2, "💰 Opaque Market Intelligence", "Uncertainty in compensation & interview rounds", [
        "Salary numbers are scattered across biased review sites without real city/country benchmarks.",
        "Candidates fail interviews due to lack of real-time STAR scenario practice.",
        "Access to senior engineering mentors is expensive, inaccessible, and fragmented."
    ], border_color=CYAN)

    # ==========================================
    # SLIDE 3: EXECUTIVE SOLUTION OVERVIEW
    # ==========================================
    s3 = prs.slides.add_slide(blank_layout)
    add_header(s3, "Our Solution: Career Navigation AI All-in-One Platform", "Platform Overview", 3)

    add_card(s3, 0.8, 1.6, 5.2, 5.2, "⚡ 10 Autonomous Modules in One Copilot", "Unified career intelligence ecosystem", [
        "1. Instant Guest & Auth Resume Scanner",
        "2. 8-Factor Quantified ATS Scorecard",
        "3. Live 1-Click Bullet Rewriter (Google XYZ)",
        "4. Competency & Skill Gap Audit Matrix",
        "5. 30-60-90 Day Career Acceleration Roadmap",
        "6. Global Country & Role Salary Telemetry",
        "7. AI Technical & Behavioral Interview Practice",
        "8. 24/7 Contextual Career & System Design Mentor",
        "9. Verified Open-Source & Official Resource Hub",
        "10. Founder Admin Telemetry & Security Engine"
    ], border_color=CYAN)

    add_image_card(s3, os.path.join(desktop_dir, "01_Landing_Page_Hero_and_Scanner.png"), 6.3, 1.6, 6.2, 4.8, "Live Web Platform Hero & Interactive Scanner")

    # ==========================================
    # SLIDE 4: INSTANT RESUME SCANNER (DESKTOP + MOBILE)
    # ==========================================
    s4 = prs.slides.add_slide(blank_layout)
    add_header(s4, "Module 1: Zero-Friction Instant Resume Scanner", "Core Capabilities", 4)

    add_card(s4, 0.8, 1.6, 4.8, 5.2, "🎯 Dropzone & Intelligent Ingestion", "Engineered for speed, privacy & accessibility", [
        "Instant Sample Analysis: 1-click test scan with preloaded industry resumes for zero-friction evaluation.",
        "Multi-Format Extraction: High-fidelity PDF, DOCX, and text extraction with OCR fallback.",
        "Gemini Vision Neural Parser: Extracts roles, timelines, bullet metrics, and core tech stacks.",
        "Zero-Loss Auth Transition: Guest users can scan first, inspect results, and authenticate seamlessly without losing their analysis."
    ], border_color=CYAN)

    add_image_card(s4, os.path.join(desktop_dir, "01_Landing_Page_Hero_and_Scanner.png"), 5.9, 1.6, 4.5, 4.8, "Desktop Scanner Dropzone")
    add_image_card(s4, os.path.join(mobile_dir, "WhatsApp Image 2026-11-16 at 11.24.26 AM.jpeg"), 10.7, 1.6, 1.8, 4.8, "Mobile Dashboard")

    # ==========================================
    # SLIDE 5: 8-FACTOR ATS SCORECARD & LIFT
    # ==========================================
    s5 = prs.slides.add_slide(blank_layout)
    add_header(s5, "Module 2: 8-Factor ATS Scorecard & Live Bullet Optimization", "ATS Intelligence", 5)

    add_card(s5, 0.8, 1.6, 4.8, 5.2, "📈 Quantified ATS Scoring & Fixes", "Proven Score Lift from 62% to 80%+", [
        "Comprehensive 8-Factor Evaluation: Evaluates Keyword Match, Action Verbs, Quantifiable Metrics, Formatting, Brevity, Section Clarity, Technical Fit, and Industry Standards.",
        "Google XYZ Formula Engine: Automatically rewrites weak resume lines into 'Accomplished [X] as measured by [Y] by doing [Z]'.",
        "Interactive Before/After Diff: Candidates can view exact changes and copy improved bullets directly to their clipboard."
    ], border_color=EMERALD)

    add_image_card(s5, os.path.join(desktop_dir, "02_ATS_Score_Lift_and_AutoFix.png"), 5.9, 1.6, 6.6, 4.8, "ATS Score Breakdown & 1-Click Bullet Fix Engine")

    # ==========================================
    # SLIDE 6: SKILL GAP MATRIX & VERIFIED STRENGTHS
    # ==========================================
    s6 = prs.slides.add_slide(blank_layout)
    add_header(s6, "Module 3: Competency Audit & Skill Gap Analysis Matrix", "Skill Gap Intelligence", 6)

    add_card(s6, 0.8, 1.6, 4.8, 5.2, "🔍 Deep Role-Based Competency Audit", "Identifies exact technical blindspots", [
        "Verified Profile Strengths: Automatically highlights candidate's mastered technologies (React, Node, TypeScript, Docker).",
        "Missing Core vs. Advanced Skills: Segregates missing skills by priority to prevent cognitive overload.",
        "Actionable Recommendations: Each missing skill connects directly to targeted sprint tasks in the roadmap.",
        "Responsive Visual Badges: Real-time interactive chips that sync across desktop and mobile views."
    ], border_color=PURPLE)

    add_image_card(s6, os.path.join(desktop_dir, "03_Skill_Gap_Competency_Audit_Report.png"), 5.9, 1.6, 4.8, 4.8, "Skill Gap Competency Matrix")
    add_image_card(s6, os.path.join(mobile_dir, "WhatsApp Image 2026-11-16 at 11.27.50 AM.jpeg"), 11.0, 1.6, 1.5, 4.8, "Mobile Matrix Badges")

    # ==========================================
    # SLIDE 7: 30-60-90 DAY CAREER ACCELERATION ROADMAP
    # ==========================================
    s7 = prs.slides.add_slide(blank_layout)
    add_header(s7, "Module 4: 30-60-90 Day Career Acceleration Roadmap", "Career Acceleration", 7)

    add_card(s7, 0.8, 1.6, 4.8, 5.2, "🗺️ Personalized Sprint-Based Execution", "Transform gaps into verified production competencies", [
        "Structured Sprint Timelines: Sprint 1 (Foundations), Sprint 2 (Production Patterns), Sprint 3 (System Architecture).",
        "Concrete Practical Tasks: Hands-on challenges with estimated hours and objective completion criteria.",
        "Live Progress Tracking: Mark tasks 'To Do', 'In Progress', and 'Completed' with persistent cloud storage.",
        "Project-Driven Milestones: Guides building real-world enterprise applications for portfolio proof."
    ], border_color=CYAN)

    add_image_card(s7, os.path.join(desktop_dir, "04_Career_Acceleration_Roadmap_Report.png"), 5.9, 1.6, 4.8, 4.8, "Full Desktop Sprint Roadmap")
    add_image_card(s7, os.path.join(mobile_dir, "WhatsApp Image 2026-11-16 at 11.27.56 AM.jpeg"), 11.0, 1.6, 1.5, 4.8, "Mobile Roadmap Sprints")

    # ==========================================
    # SLIDE 8: GLOBAL SALARY BENCHMARKS & MARKET INTELLIGENCE
    # ==========================================
    s8 = prs.slides.add_slide(blank_layout)
    add_header(s8, "Module 5: Global Salary Benchmarks & Market Intelligence", "Compensation Intelligence", 8)

    add_card(s8, 0.8, 1.6, 4.8, 5.2, "📊 Real-Time Market Compensation Telemetry", "Country-wise insights across 6 global hubs", [
        "Global Geographical Coverage: Accurate benchmarks for India (₹), US ($), UK (£), Germany (€), Singapore (S$), and UAE (AED).",
        "Monthly (LPM) & Annual Ranges: Junior, Mid, Senior, and Staff engineering compensation brackets.",
        "High-Interest Production Roles: Identifies surging demand in Full Stack, Cloud/DevOps, AI Systems, and Distributed Backend.",
        "Empowers Negotiation: Backs candidates with hard data for performance reviews and job offer negotiations."
    ], border_color=EMERALD)

    add_image_card(s8, os.path.join(mobile_dir, "WhatsApp Image 2026-11-16 at 11.24.18 AM.jpeg"), 5.9, 1.6, 3.2, 4.8, "Country-Wise Salary Breakdown")
    add_image_card(s8, os.path.join(mobile_dir, "WhatsApp Image 2026-11-16 at 11.24.15 AM.jpeg"), 9.5, 1.6, 3.0, 4.8, "High-Interest Target Roles")

    # ==========================================
    # SLIDE 9: AI TECHNICAL & BEHAVIORAL INTERVIEW PRACTICE
    # ==========================================
    s9 = prs.slides.add_slide(blank_layout)
    add_header(s9, "Module 6: Interactive AI Technical & Behavioral Interview Practice", "Interview Preparation", 9)

    add_card(s9, 0.8, 1.6, 5.2, 5.2, "🎙️ Scenario-Based Interview Simulator", "Real-time STAR method feedback", [
        "Tailored Simulator Challenges: Dynamically generates behavioral and technical questions based on the candidate's scanned resume.",
        "STAR Coach Methodology: Real-time analysis of Situation, Task, Action, and Result structure in responses.",
        "Scoring & Constructive Critique: Identifies conversational gaps, technical inaccuracies, and clarity improvements.",
        "Unlimited Practice Rounds: Eliminates interview anxiety through realistic simulated pressure."
    ], border_color=PURPLE)

    add_image_card(s9, os.path.join(mobile_dir, "WhatsApp Image 2026-11-16 at 11.24.14 AM.jpeg"), 6.4, 1.6, 6.1, 4.8, "Live Interview Simulator & STAR Coaching")

    # ==========================================
    # SLIDE 10: 24/7 AI CAREER & ARCHITECTURE MENTORSHIP
    # ==========================================
    s10 = prs.slides.add_slide(blank_layout)
    add_header(s10, "Module 7: 24/7 AI Career & Architecture Mentorship", "AI Mentorship", 10)

    add_card(s10, 0.8, 1.6, 5.2, 5.2, "🤖 Context-Aware Engineering Mentor", "On-demand architectural & career guidance", [
        "Deep Contextual Memory: Remembers resume strengths, target job roles, and existing roadmap progress.",
        "System Design & Code Advice: Explains microservices, caching strategies, Docker deployment, and database indexing.",
        "Career Negotiation Strategies: Provides step-by-step guidance on counter-offers, promotion cycles, and resume tailoring.",
        "Immediate Latency: Fast streaming neural responses powered by Google Gemini AI."
    ], border_color=CYAN)

    add_image_card(s10, os.path.join(mobile_dir, "WhatsApp Image 2026-11-16 at 11.24.13 AM.jpeg"), 6.4, 1.6, 6.1, 4.8, "Conversational AI Mentor Interface")

    # ==========================================
    # SLIDE 11: CURATED LEARNING RESOURCES & REPOS
    # ==========================================
    s11 = prs.slides.add_slide(blank_layout)
    add_header(s11, "Module 8: Curated Learning Resources & Open Source Ecosystem", "Learning Ecosystem", 11)

    add_card(s11, 0.8, 1.6, 5.2, 5.2, "📚 Zero-Fluff Engineering Knowledge Base", "Curated official docs & top-tier repositories", [
        "Direct Official Documentation: Official links for React 18, TypeScript, Docker, Node.js, and Kubernetes.",
        "Production-Grade GitHub Repos: Direct links to open-source starter kits, architecture patterns, and cheat-sheets.",
        "Structured Categorization: Categorized by Frontend, Backend, Cloud/DevOps, and System Architecture.",
        "Verified Relevance: Handpicked resources ensure candidates never waste hours on deprecated tutorials."
    ], border_color=AMBER)

    add_image_card(s11, os.path.join(mobile_dir, "WhatsApp Image 2026-11-16 at 11.24.20 AM.jpeg"), 6.4, 1.6, 6.1, 4.8, "Curated Learning Resources & Repositories")

    # ==========================================
    # SLIDE 12: ADMIN CONSOLE & SECURITY
    # ==========================================
    s12 = prs.slides.add_slide(blank_layout)
    add_header(s12, "Module 9 & 10: Admin Management Console & Enterprise Security", "Platform Governance", 12)

    add_card(s12, 0.8, 1.6, 4.8, 5.2, "🛡️ Enterprise Architecture & Governance", "Robust security and real-time telemetry", [
        "Founder Admin Console: Protected dashboard for user management, system activity tracking, and platform health.",
        "Role-Based Access Control: Granular permissions separating guests, authenticated users, and system administrators.",
        "Secure Authentication: Zero-leak credential storage, session tokens, and optional 2FA verification.",
        "Data Privacy by Design: Uploaded resumes are analyzed with strict sandboxing and zero persistent third-party data leaks."
    ], border_color=EMERALD)

    add_image_card(s12, os.path.join(desktop_dir, "05_Admin_Console_and_Navigation.png"), 5.9, 1.6, 6.6, 2.5, "Admin Console Navigation & Management")
    add_image_card(s12, os.path.join(desktop_dir, "06_Login_and_Authentication.png"), 5.9, 4.4, 6.6, 2.0, "Secure Authentication Portal")

    # ==========================================
    # SLIDE 13: FULL-STACK TECHNICAL ARCHITECTURE
    # ==========================================
    s13 = prs.slides.add_slide(blank_layout)
    add_header(s13, "Under the Hood: High-Performance Full-Stack Architecture", "Technical Architecture", 13)

    add_card(s13, 0.8, 1.6, 3.6, 5.2, "🎨 Modern Frontend", "Engineered for speed & elegance", [
        "React 18 & TypeScript for robust component hierarchy.",
        "Tailwind CSS for sleek modern dark-mode responsive design.",
        "Lucide React Icons & Framer Motion for micro-interactions.",
        "Vite Build Pipeline: Sub-second HMR and instant page loads."
    ], border_color=CYAN)

    add_card(s13, 4.8, 1.6, 3.6, 5.2, "⚙️ Scalable Backend", "Enterprise REST API engine", [
        "Node.js & Express server with TypeScript architecture.",
        "MongoDB Atlas cloud cluster with Mongoose ORM.",
        "Multi-Part Stream Parser for instant PDF/DOCX ingestion.",
        "Resilient Fallbacks: In-memory store fallback if cloud DB sleeps."
    ], border_color=EMERALD)

    add_card(s13, 8.8, 1.6, 3.7, 5.2, "🧠 AI Engine & Cloud", "Google Gemini Intelligence", [
        "Google Gemini 3.1 / 3.7 Vision models for deep document parsing.",
        "Structured JSON schema outputs for 100% reliable UI hydration.",
        "Vercel Edge Global CDN for rapid multi-region distribution.",
        "Zero-cold-start architecture with sub-second response times."
    ], border_color=PURPLE)

    # ==========================================
    # SLIDE 14: KEY COMPETITIVE ADVANTAGES
    # ==========================================
    s14 = prs.slides.add_slide(blank_layout)
    add_header(s14, "Why Career Navigation AI Wins: Competitive Advantage", "Platform Impact", 14)

    add_card(s14, 0.8, 1.6, 5.6, 2.5, "🚀 Zero-Friction Onboarding", "No credit card, no forced signup", [
        "Candidates can drop a resume or click sample analysis immediately.",
        "Allows users to see real value in under 5 seconds before creating an account.",
        "Full guest-to-auth state preservation prevents repeating work."
    ], border_color=CYAN)

    add_card(s14, 6.8, 1.6, 5.7, 2.5, "📱 100% Mobile & Desktop Responsive", "Native app-like feel in any browser", [
        "Seamless slide-over navigation drawer on mobile smartphones.",
        "Full widescreen layout on laptops and desktop 4K monitors.",
        "Optimized touch targets, card padding, and font scaling."
    ], border_color=EMERALD)

    add_card(s14, 0.8, 4.4, 5.6, 2.5, "🎯 End-to-End Career Lifecycle", "Not just a resume builder", [
        "Covers the complete journey: Resume Optimization → Skill Gap Audit → 90-Day Roadmap → Interview Coaching → Salary Negotiation.",
        "Integrated feedback loop: learning tasks directly close ATS gaps."
    ], border_color=PURPLE)

    add_card(s14, 6.8, 4.4, 5.7, 2.5, "⚡ Proven Score Lift Results", "Measurable outcomes for candidates", [
        "Candidates consistently achieve 15-25 point score increases.",
        "Automated Google XYZ formula conversion produces recruiter-ready bullets.",
        "Direct export and 1-click clipboard copying simplifies application workflow."
    ], border_color=AMBER)

    # ==========================================
    # SLIDE 15: CONCLUSION & TEAM CREDITS
    # ==========================================
    s15 = prs.slides.add_slide(blank_layout)
    set_slide_bg(s15)

    # Top accent bar
    tbar = s15.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, Inches(0.12))
    tbar.fill.solid()
    tbar.fill.fore_color.rgb = CYAN
    tbar.line.fill.background()

    # Title box
    t15_box = s15.shapes.add_textbox(Inches(1.0), Inches(0.8), Inches(11.3), Inches(1.3))
    tf15 = t15_box.text_frame
    p15_t = tf15.paragraphs[0]
    p15_t.text = "Thank You! Ready for Questions & Live Demo."
    p15_t.font.size = Pt(38)
    p15_t.font.bold = True
    p15_t.font.color.rgb = TEXT_WHITE

    p15_sub = tf15.add_paragraph()
    p15_sub.text = "Career Navigation AI — Autonomous Career Copilot by Team The Hustlers"
    p15_sub.font.size = Pt(17)
    p15_sub.font.color.rgb = CYAN
    p15_sub.space_before = Pt(6)

    # Left Card: Live links
    c_live = s15.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(1.0), Inches(2.4), Inches(5.3), Inches(4.2))
    c_live.fill.solid()
    c_live.fill.fore_color.rgb = CARD_BG
    c_live.line.color.rgb = CYAN
    c_live.line.width = Pt(1.5)
    tf_live = c_live.text_frame
    tf_live.word_wrap = True

    p_lhead = tf_live.paragraphs[0]
    p_lhead.text = "🌐 Explore the Live Platform"
    p_lhead.font.size = Pt(18)
    p_lhead.font.bold = True
    p_lhead.font.color.rgb = TEXT_WHITE

    p_lu = tf_live.add_paragraph()
    p_lu.text = "🚀 Production Deployment:"
    p_lu.font.size = Pt(13)
    p_lu.font.bold = True
    p_lu.font.color.rgb = EMERALD
    p_lu.space_before = Pt(14)

    p_lurl = tf_live.add_paragraph()
    p_lurl.text = "https://carrer-nav-ai.vercel.app"
    p_lurl.font.size = Pt(14)
    p_lurl.font.color.rgb = TEXT_WHITE
    p_lurl.space_before = Pt(4)

    p_gh = tf_live.add_paragraph()
    p_gh.text = "💻 GitHub Source Code:"
    p_gh.font.size = Pt(13)
    p_gh.font.bold = True
    p_gh.font.color.rgb = PURPLE
    p_gh.space_before = Pt(14)

    p_ghurl = tf_live.add_paragraph()
    p_ghurl.text = "github.com/raj40870-pixel/Ai-skill-"
    p_ghurl.font.size = Pt(14)
    p_ghurl.font.color.rgb = TEXT_WHITE
    p_ghurl.space_before = Pt(4)

    p_foot = tf_live.add_paragraph()
    p_foot.text = "Built with React 18, TypeScript, Tailwind CSS, Node.js & Google Gemini"
    p_foot.font.size = Pt(11)
    p_foot.font.color.rgb = TEXT_MUTED
    p_foot.space_before = Pt(18)

    # Right Card: Team Credits
    c_credits = s15.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.8), Inches(2.4), Inches(5.5), Inches(4.2))
    c_credits.fill.solid()
    c_credits.fill.fore_color.rgb = CARD_BG
    c_credits.line.color.rgb = EMERALD
    c_credits.line.width = Pt(1.5)
    tf_cred = c_credits.text_frame
    tf_cred.word_wrap = True

    p_chead = tf_cred.paragraphs[0]
    p_chead.text = "👥 Project Team: The Hustlers"
    p_chead.font.size = Pt(18)
    p_chead.font.bold = True
    p_chead.font.color.rgb = TEXT_WHITE

    p_k = tf_cred.add_paragraph()
    p_k.text = "• Kamaljit"
    p_k.font.size = Pt(16)
    p_k.font.bold = True
    p_k.font.color.rgb = CYAN
    p_k.space_before = Pt(14)

    p_ksub = tf_cred.add_paragraph()
    p_ksub.text = "   Lead Developer & Architect\n   BCA, Lovely Professional University (2026)"
    p_ksub.font.size = Pt(12)
    p_ksub.font.color.rgb = TEXT_MUTED
    p_ksub.space_before = Pt(2)

    p_m = tf_cred.add_paragraph()
    p_m.text = "• Mantaj"
    p_m.font.size = Pt(16)
    p_m.font.bold = True
    p_m.font.color.rgb = PURPLE
    p_m.space_before = Pt(14)

    p_msub = tf_cred.add_paragraph()
    p_msub.text = "   Co-Developer & Presentation Lead\n   Team The Hustlers"
    p_msub.font.size = Pt(12)
    p_msub.font.color.rgb = TEXT_MUTED
    p_msub.space_before = Pt(2)

    # Save output to root and Downloads
    out_root = "The_Hustlers_Career_Nav_AI_Presentation.pptx"
    prs.save(out_root)
    print(f"Presentation saved to: {os.path.abspath(out_root)}")

    # Also save to Downloads
    dl_paths = [
        r"C:\Users\Kamaljit\Downloads\The_Hustlers_Career_Nav_AI_Presentation.pptx",
        r"C:\Users\Kamaljit\Downloads\The_Hustlers_Career_Nav_AI_Deck.pptx"
    ]
    for dl in dl_paths:
        try:
            shutil.copy2(out_root, dl)
            print(f"Copied to: {dl}")
        except Exception as e:
            print(f"Could not overwrite {dl} (likely open in PowerPoint): {e}")

if __name__ == "__main__":
    create_deck()
