import os
import shutil
import pptx
from pptx.util import Inches, Pt
from pptx.enum.text import PP_ALIGN
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE
from PIL import Image, ImageDraw

# ==============================================================================
# 1. GENERATE HIGH-DEFINITION DEVICE MOCKUPS USING PIL
# ==============================================================================
mockup_dir = os.path.join("screenshots", "mockups")
os.makedirs(mockup_dir, exist_ok=True)

def create_browser_mockup(input_path, out_path, url_text="carrer-nav-ai.vercel.app"):
    if not os.path.exists(input_path):
        return None
    im = Image.open(input_path)
    target_w = 1280
    target_h = int(im.size[1] * (target_w / im.size[0]))
    im = im.resize((target_w, target_h), Image.Resampling.LANCZOS)

    bar_h = 44
    border = 2
    canvas = Image.new("RGB", (target_w + border * 2, target_h + bar_h + border * 2), (30, 41, 59))
    draw = ImageDraw.Draw(canvas)

    # Top title bar background
    draw.rectangle((border, border, target_w + border, bar_h + border), fill=(15, 23, 42))

    # Mac 3 window buttons
    draw.ellipse((border + 16, border + 14, border + 28, border + 26), fill=(239, 68, 68))
    draw.ellipse((border + 36, border + 14, border + 48, border + 26), fill=(245, 158, 11))
    draw.ellipse((border + 56, border + 14, border + 68, border + 26), fill=(16, 185, 129))

    # Centered URL search bar pill
    pill_w = 480
    pill_x1 = (target_w - pill_w) // 2 + border
    pill_x2 = pill_x1 + pill_w
    draw.rounded_rectangle((pill_x1, border + 8, pill_x2, border + 34), radius=6, fill=(30, 41, 59), outline=(71, 85, 105))
    draw.text((pill_x1 + 16, border + 12), "🔒 https://" + url_text, fill=(148, 163, 184))

    # Paste screenshot
    canvas.paste(im, (border, bar_h + border))
    canvas.save(out_path, quality=95)
    return out_path

def create_phone_mockup(input_path, out_path):
    if not os.path.exists(input_path):
        return None
    im = Image.open(input_path)
    target_w = 540
    target_h = int(im.size[1] * (target_w / im.size[0]))
    im = im.resize((target_w, target_h), Image.Resampling.LANCZOS)

    pad = 14
    notch_h = 30
    bottom_h = 24
    frame_w = target_w + pad * 2
    frame_h = target_h + notch_h + bottom_h

    canvas = Image.new("RGB", (frame_w, frame_h), (11, 15, 25))
    draw = ImageDraw.Draw(canvas)

    # Phone outer chassis
    draw.rounded_rectangle((2, 2, frame_w - 3, frame_h - 3), radius=38, fill=(15, 23, 42), outline=(56, 189, 248), width=3)

    # Dynamic Island pill
    di_w, di_h = 100, 18
    di_x = (frame_w - di_w) // 2
    draw.rounded_rectangle((di_x, 7, di_x + di_w, 7 + di_h), radius=9, fill=(0, 0, 0))

    # Screen paste
    canvas.paste(im, (pad, notch_h))

    # Home indicator bar
    bar_w = 120
    bar_x = (frame_w - bar_w) // 2
    bar_y = frame_h - 13
    draw.rounded_rectangle((bar_x, bar_y, bar_x + bar_w, bar_y + 4), radius=2, fill=(148, 163, 184))

    canvas.save(out_path, quality=95)
    return out_path

print("Rendering high-definition device mockups...")
mb_hero = create_browser_mockup("screenshots/desktop/01_Landing_Page_Hero_and_Scanner.png", os.path.join(mockup_dir, "mb_hero.png"))
mb_ats = create_browser_mockup("screenshots/desktop/02_ATS_Score_Lift_and_AutoFix.png", os.path.join(mockup_dir, "mb_ats.png"))
mb_skill = create_browser_mockup("screenshots/desktop/03_Skill_Gap_Competency_Audit_Report.png", os.path.join(mockup_dir, "mb_skill.png"))
mb_road = create_browser_mockup("screenshots/desktop/04_Career_Acceleration_Roadmap_Report.png", os.path.join(mockup_dir, "mb_road.png"))
mb_admin = create_browser_mockup("screenshots/desktop/05_Admin_Console_and_Navigation.png", os.path.join(mockup_dir, "mb_admin.png"))
mb_login = create_browser_mockup("screenshots/desktop/06_Login_and_Authentication.png", os.path.join(mockup_dir, "mb_login.png"))

mp_interview = create_phone_mockup("screenshots/mobile/WhatsApp Image 2026-11-16 at 11.24.14 AM.jpeg", os.path.join(mockup_dir, "mp_interview.png"))
mp_mentor = create_phone_mockup("screenshots/mobile/WhatsApp Image 2026-11-16 at 11.24.13 AM.jpeg", os.path.join(mockup_dir, "mp_mentor.png"))
mp_salary = create_phone_mockup("screenshots/mobile/WhatsApp Image 2026-11-16 at 11.24.18 AM.jpeg", os.path.join(mockup_dir, "mp_salary.png"))
mp_salary_roles = create_phone_mockup("screenshots/mobile/WhatsApp Image 2026-11-16 at 11.24.15 AM.jpeg", os.path.join(mockup_dir, "mp_salary_roles.png"))
mp_resources = create_phone_mockup("screenshots/mobile/WhatsApp Image 2026-11-16 at 11.24.20 AM.jpeg", os.path.join(mockup_dir, "mp_resources.png"))
mp_skill = create_phone_mockup("screenshots/mobile/WhatsApp Image 2026-11-16 at 11.27.50 AM.jpeg", os.path.join(mockup_dir, "mp_skill.png"))
mp_road = create_phone_mockup("screenshots/mobile/WhatsApp Image 2026-11-16 at 11.27.56 AM.jpeg", os.path.join(mockup_dir, "mp_road.png"))
mp_dash = create_phone_mockup("screenshots/mobile/WhatsApp Image 2026-11-16 at 11.24.26 AM.jpeg", os.path.join(mockup_dir, "mp_dash.png"))
print("All mockups created successfully!")

# ==============================================================================
# 2. BUILD THE PRESENTATION DECK WITH PYTHON-PPTX
# ==============================================================================
prs = pptx.Presentation()
prs.slide_width = Inches(13.333)
prs.slide_height = Inches(7.5)
blank_layout = prs.slide_layouts[6]

# Theme Colors
BG_COLOR = RGBColor(10, 15, 29)          # Deep Midnight
CARD_BG = RGBColor(18, 25, 43)           # Slate Card
BORDER_COLOR = RGBColor(38, 52, 78)      # Card Border
CYAN = RGBColor(56, 189, 248)            # Sky/Cyan
EMERALD = RGBColor(52, 211, 153)         # Emerald
PURPLE = RGBColor(167, 139, 250)         # Violet
AMBER = RGBColor(251, 191, 36)           # Amber
RED = RGBColor(248, 113, 113)            # Red
WHITE = RGBColor(248, 250, 252)          # Off White
GRAY_LIGHT = RGBColor(203, 213, 225)     # #CBD5E1
GRAY_MUTED = RGBColor(148, 163, 184)     # #94A3B8

def set_slide_background(slide):
    bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, prs.slide_height)
    bg.fill.solid()
    bg.fill.fore_color.rgb = BG_COLOR
    bg.line.fill.background()
    return bg

def add_slide_header(slide, title_text, category_text, slide_index):
    set_slide_background(slide)

    # Top accent line
    top_line = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, Inches(0.08))
    top_line.fill.solid()
    top_line.fill.fore_color.rgb = CYAN
    top_line.line.fill.background()

    # Category Pill
    pill = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(0.35), Inches(3.2), Inches(0.35))
    pill.fill.solid()
    pill.fill.fore_color.rgb = RGBColor(15, 23, 42)
    pill.line.color.rgb = CYAN
    pill.line.width = Pt(1)
    tf_p = pill.text_frame
    p_p = tf_p.paragraphs[0]
    p_p.text = category_text.upper()
    p_p.font.size = Pt(9.5)
    p_p.font.bold = True
    p_p.font.color.rgb = CYAN
    p_p.alignment = PP_ALIGN.CENTER

    # Slide Index
    s_box = slide.shapes.add_textbox(Inches(11.3), Inches(0.35), Inches(1.3), Inches(0.35))
    tf_s = s_box.text_frame
    p_s = tf_s.paragraphs[0]
    p_s.text = f"{slide_index:02d} / 15"
    p_s.font.size = Pt(11)
    p_s.font.bold = True
    p_s.font.color.rgb = GRAY_MUTED
    p_s.alignment = PP_ALIGN.RIGHT

    # Main Title
    t_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.72), Inches(11.5), Inches(0.65))
    tf_t = t_box.text_frame
    tf_t.word_wrap = True
    p_t = tf_t.paragraphs[0]
    p_t.text = title_text
    p_t.font.size = Pt(22)
    p_t.font.bold = True
    p_t.font.color.rgb = WHITE

def place_image_aspect_fit(slide, img_path, box_x, box_y, box_w, box_h):
    """Guarantees 100% distortion-free aspect ratio preservation."""
    if not os.path.exists(img_path):
        return None
    im = Image.open(img_path)
    w_px, h_px = im.size
    aspect = w_px / h_px

    # Calculate fitted size
    if box_w / box_h > aspect:
        h = box_h
        w = h * aspect
    else:
        w = box_w
        h = w / aspect

    x = box_x + (box_w - w) / 2.0
    y = box_y + (box_h - h) / 2.0

    return slide.shapes.add_picture(img_path, Inches(x), Inches(y), Inches(w), Inches(h))

def add_metric_badge(slide, x, y, w, h, stat_text, label_text, color=CYAN):
    card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(x), Inches(y), Inches(w), Inches(h))
    card.fill.solid()
    card.fill.fore_color.rgb = CARD_BG
    card.line.color.rgb = color
    card.line.width = Pt(1.5)

    tx = slide.shapes.add_textbox(Inches(x + 0.1), Inches(y + 0.1), Inches(w - 0.2), Inches(h - 0.2))
    tf = tx.text_frame
    tf.word_wrap = True
    
    p0 = tf.paragraphs[0]
    p0.text = stat_text
    p0.font.size = Pt(24)
    p0.font.bold = True
    p0.font.color.rgb = color
    p0.alignment = PP_ALIGN.CENTER

    p1 = tf.add_paragraph()
    p1.text = label_text
    p1.font.size = Pt(10)
    p1.font.color.rgb = GRAY_LIGHT
    p1.alignment = PP_ALIGN.CENTER
    p1.space_before = Pt(3)
    return card

def add_feature_card(slide, x, y, w, h, title, subtitle="", bullets=None, border_color=BORDER_COLOR):
    card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(x), Inches(y), Inches(w), Inches(h))
    card.fill.solid()
    card.fill.fore_color.rgb = CARD_BG
    card.line.color.rgb = border_color
    card.line.width = Pt(1.5)

    tx = slide.shapes.add_textbox(Inches(x + 0.2), Inches(y + 0.2), Inches(w - 0.4), Inches(h - 0.4))
    tf = tx.text_frame
    tf.word_wrap = True

    p0 = tf.paragraphs[0]
    p0.text = title
    p0.font.size = Pt(14)
    p0.font.bold = True
    p0.font.color.rgb = WHITE

    if subtitle:
        p_sub = tf.add_paragraph()
        p_sub.text = subtitle
        p_sub.font.size = Pt(11)
        p_sub.font.color.rgb = CYAN
        p_sub.space_before = Pt(4)

    if bullets:
        for b in bullets:
            p_b = tf.add_paragraph()
            p_b.text = "• " + b
            p_b.font.size = Pt(10)
            p_b.font.color.rgb = GRAY_LIGHT
            p_b.space_before = Pt(6)
    return card

# ==============================================================================
# SLIDE 1: COVER SLIDE (THE HUSTLERS)
# ==============================================================================
s1 = prs.slides.add_slide(blank_layout)
set_slide_background(s1)

top_bar = s1.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, Inches(0.12))
top_bar.fill.solid()
top_bar.fill.fore_color.rgb = CYAN
top_bar.line.fill.background()

# Tag Pill
tp = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.9), Inches(0.9), Inches(3.6), Inches(0.42))
tp.fill.solid()
tp.fill.fore_color.rgb = RGBColor(15, 23, 42)
tp.line.color.rgb = CYAN
tp.line.width = Pt(1.5)
tf_tp = tp.text_frame
p_tp = tf_tp.paragraphs[0]
p_tp.text = "⚡ AUTONOMOUS AI AGENT PLATFORM"
p_tp.font.size = Pt(10.5)
p_tp.font.bold = True
p_tp.font.color.rgb = CYAN
p_tp.alignment = PP_ALIGN.CENTER

# Main Title
t1_box = s1.shapes.add_textbox(Inches(0.9), Inches(1.5), Inches(11.5), Inches(1.6))
tf1 = t1_box.text_frame
tf1.word_wrap = True
p1_0 = tf1.paragraphs[0]
p1_0.text = "Career Navigation AI"
p1_0.font.size = Pt(44)
p1_0.font.bold = True
p1_0.font.color.rgb = WHITE

p1_1 = tf1.add_paragraph()
p1_1.text = "Next-Generation Multi-Agent Career Transition Copilot & ATS Intelligence Engine"
p1_1.font.size = Pt(17)
p1_1.font.color.rgb = CYAN
p1_1.space_before = Pt(6)

# Team Hustlers Card
c_team = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.9), Inches(3.4), Inches(5.6), Inches(3.3))
c_team.fill.solid()
c_team.fill.fore_color.rgb = CARD_BG
c_team.line.color.rgb = CYAN
c_team.line.width = Pt(1.5)
tf_ct = c_team.text_frame
tf_ct.word_wrap = True

p_c0 = tf_ct.paragraphs[0]
p_c0.text = "👥 Project Team: The Hustlers"
p_c0.font.size = Pt(16)
p_c0.font.bold = True
p_c0.font.color.rgb = WHITE

p_k = tf_ct.add_paragraph()
p_k.text = "• Kamaljit"
p_k.font.size = Pt(14)
p_k.font.bold = True
p_k.font.color.rgb = EMERALD
p_k.space_before = Pt(10)

p_k_desc = tf_ct.add_paragraph()
p_k_desc.text = "   Lead Full-Stack Architect & AI System Engineer\n   BCA, Lovely Professional University (2026)"
p_k_desc.font.size = Pt(11)
p_k_desc.font.color.rgb = GRAY_LIGHT
p_k_desc.space_before = Pt(2)

p_m = tf_ct.add_paragraph()
p_m.text = "• Mantaj"
p_m.font.size = Pt(14)
p_m.font.bold = True
p_m.font.color.rgb = PURPLE
p_m.space_before = Pt(10)

p_m_desc = tf_ct.add_paragraph()
p_m_desc.text = "   Co-Developer & UI/UX Specialist\n   Team The Hustlers"
p_m_desc.font.size = Pt(11)
p_m_desc.font.color.rgb = GRAY_LIGHT
p_m_desc.space_before = Pt(2)

# Production Links Card
c_links = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.8), Inches(3.4), Inches(5.6), Inches(3.3))
c_links.fill.solid()
c_links.fill.fore_color.rgb = CARD_BG
c_links.line.color.rgb = EMERALD
c_links.line.width = Pt(1.5)
tf_cl = c_links.text_frame
tf_cl.word_wrap = True

p_l0 = tf_cl.paragraphs[0]
p_l0.text = "🌐 Production Deployment & Artifacts"
p_l0.font.size = Pt(16)
p_l0.font.bold = True
p_l0.font.color.rgb = WHITE

p_l1 = tf_cl.add_paragraph()
p_l1.text = "🚀 Live Web Application:"
p_l1.font.size = Pt(12)
p_l1.font.bold = True
p_l1.font.color.rgb = CYAN
p_l1.space_before = Pt(12)

p_lurl = tf_cl.add_paragraph()
p_lurl.text = "https://carrer-nav-ai.vercel.app"
p_lurl.font.size = Pt(13)
p_lurl.font.color.rgb = WHITE

p_l2 = tf_cl.add_paragraph()
p_l2.text = "💻 GitHub Source Code:"
p_l2.font.size = Pt(12)
p_l2.font.bold = True
p_l2.font.color.rgb = PURPLE
p_l2.space_before = Pt(12)

p_ghurl = tf_cl.add_paragraph()
p_ghurl.text = "github.com/raj40870-pixel/Ai-skill-"
p_ghurl.font.size = Pt(13)
p_ghurl.font.color.rgb = WHITE

p_tech = tf_cl.add_paragraph()
p_tech.text = "Tech: React 18, Vite, TypeScript, Node.js, Express, MongoDB Atlas, Gemini Vision"
p_tech.font.size = Pt(10)
p_tech.font.color.rgb = GRAY_MUTED
p_tech.space_before = Pt(14)

# ==========================================
# SLIDE 2: THE PROBLEM STATEMENT
# ==========================================
s2 = prs.slides.add_slide(blank_layout)
add_slide_header(s2, "The Hiring Crisis: The 75% ATS Rejection Black Hole", "Industry Problem & Need", 2)

add_metric_badge(s2, 0.9, 1.5, 3.6, 1.3, "75%+", "Resumes Rejected by ATS Bots", color=RED)
add_metric_badge(s2, 4.9, 1.5, 3.6, 1.3, "0 Feedback", "No Explanations Given to Applicants", color=AMBER)
add_metric_badge(s2, 8.8, 1.5, 3.6, 1.3, "3-6 Mos", "Wasted in Directionless Learning Hell", color=PURPLE)

add_feature_card(s2, 0.9, 3.1, 3.6, 3.8, "🤖 The ATS Filter Wall", "Unforgiving Automated Screeners", [
    "Enterprise applicant tracking systems discard qualified applicants over missing keywords or unparsed formatting.",
    "Candidates have no visibility into how recruiters or parsers score their applications.",
    "High-potential candidates lose opportunities before a human ever reviews their resume."
], border_color=RED)

add_feature_card(s2, 4.9, 3.1, 3.6, 3.8, "🧭 Directionless Upskilling", "Tutorial Hell Without Purpose", [
    "Generic public roadmaps fail to address specific candidate weaknesses.",
    "Self-learners spend months studying low-demand technologies rather than verified production skills.",
    "Lack of structured milestones results in burnout and abandoned career transitions."
], border_color=AMBER)

add_feature_card(s2, 8.8, 3.1, 3.6, 3.8, "💰 Opaque Market Intelligence", "Blind In Salary & Interview Prep", [
    "Candidates enter compensation negotiations without objective country-wise benchmarks.",
    "Technical and behavioral interview practice with experienced mentors is costly and scarce.",
    "STAR-method scenario practice is rarely accessible for college students and career switchers."
], border_color=PURPLE)

# ==========================================
# SLIDE 3: EXECUTIVE SOLUTION OVERVIEW
# ==========================================
s3 = prs.slides.add_slide(blank_layout)
add_slide_header(s3, "Executive Solution: Unified 10-Module Career Copilot", "Platform Architecture", 3)

add_feature_card(s3, 0.9, 1.5, 4.6, 5.4, "⚡ End-to-End AI Copilot Pipeline", "From resume upload to offer letter", [
    "1. Instant Guest & Authenticated Scanner",
    "2. 8-Factor Quantified ATS Scorecard",
    "3. Live 1-Click Bullet Rewriter (Google XYZ)",
    "4. Competency Audit & Skill Gap Matrix",
    "5. 30-60-90 Day Acceleration Roadmap",
    "6. Global Country & Role Salary Telemetry",
    "7. Interactive STAR Mock Interview Practice",
    "8. 24/7 Contextual Architecture AI Mentor",
    "9. Curated Learning Hub & Open-Source Repos",
    "10. Founder Admin Console & User Telemetry"
], border_color=CYAN)

place_image_aspect_fit(s3, mb_hero, 5.8, 1.5, 6.7, 5.4)

# ==========================================
# SLIDE 4: MODULE 1 - INSTANT RESUME SCANNER
# ==========================================
s4 = prs.slides.add_slide(blank_layout)
add_slide_header(s4, "Module 1: Instant Resume Scanner & Guest Dropzone", "Core Features", 4)

add_feature_card(s4, 0.9, 1.5, 4.4, 5.4, "🎯 Zero-Friction Onboarding", "Engineered for speed and trust", [
    "Zero Forced Signup: Test instantly with pre-loaded sample resumes or upload personal PDF/DOCX files.",
    "Gemini Multi-Modal Vision: Neural document parsing extracts structural experience, dates, tech stacks, and bullet metrics.",
    "Seamless Auth Retention: Guest scans transition into registered profiles without re-uploading or losing state.",
    "Cross-Device Dropzone: Drag-and-drop on desktop, 1-tap document picker on mobile devices."
], border_color=CYAN)

place_image_aspect_fit(s4, mb_hero, 5.6, 1.5, 4.8, 5.4)
place_image_aspect_fit(s4, mp_dash, 10.7, 1.5, 1.8, 5.4)

# ==========================================
# SLIDE 5: MODULE 2 - ATS SCORECARD & SCORE LIFT
# ==========================================
s5 = prs.slides.add_slide(blank_layout)
add_slide_header(s5, "Module 2: 8-Factor ATS Scorecard & Live Bullet Rewriting", "ATS Intelligence", 5)

add_feature_card(s5, 0.9, 1.5, 4.4, 3.6, "📈 Proven Score Lift (62 → 80)", "Quantified 8-factor evaluation", [
    "Evaluates 8 Vectors: Keyword Density, Action Verbs, Measurable Impact, Formatting, Brevity, Section Clarity, Tech Alignment, and Industry Standards.",
    "Google XYZ Rewriting Engine: Instantly converts weak lines into 'Accomplished [X] as measured by [Y] by doing [Z]'.",
    "1-Click Clipboard Copying: Candidates copy optimized bullets directly into their master resume."
], border_color=EMERALD)

add_metric_badge(s5, 0.9, 5.3, 2.1, 1.6, "+29%", "Average ATS Score Lift", color=EMERALD)
add_metric_badge(s5, 3.2, 5.3, 2.1, 1.6, "8 Core", "Evaluation Vectors", color=CYAN)

place_image_aspect_fit(s5, mb_ats, 5.6, 1.5, 6.9, 5.4)

# ==========================================
# SLIDE 6: MODULE 3 - SKILL GAP ANALYSIS MATRIX
# ==========================================
s6 = prs.slides.add_slide(blank_layout)
add_slide_header(s6, "Module 3: Competency Audit & Verified Skill Gap Matrix", "Skill Gap Intelligence", 6)

add_feature_card(s6, 0.9, 1.5, 4.4, 5.4, "🔍 Automated Technical Audit", "Pinpoints missing requirements", [
    "Verified Profile Strengths: Automatically detects mastered technologies (React, Node, TypeScript, Docker).",
    "Missing Core vs. Advanced Skills: Segregates immediate missing requirements from advanced nice-to-haves.",
    "Interactive Chip Badges: Synced visual badges across desktop matrix and mobile responsive drawer.",
    "Roadmap Integration: Every missing competency automatically populates matching action sprints."
], border_color=PURPLE)

place_image_aspect_fit(s6, mb_skill, 5.6, 1.5, 5.0, 5.4)
place_image_aspect_fit(s6, mp_skill, 10.9, 1.5, 1.6, 5.4)

# ==========================================
# SLIDE 7: MODULE 4 - 30-60-90 DAY ROADMAP
# ==========================================
s7 = prs.slides.add_slide(blank_layout)
add_slide_header(s7, "Module 4: 30-60-90 Day Career Acceleration Roadmap", "Career Acceleration", 7)

add_feature_card(s7, 0.9, 1.5, 4.4, 5.4, "🗺️ Sprint-Based Execution Plan", "Convert gaps into production proofs", [
    "Structured 3-Sprint Milestones: Sprint 1 (Foundations), Sprint 2 (Production Patterns), Sprint 3 (System Architecture).",
    "Practical Hands-On Tasks: Hours estimation, clear completion checklists, and project deliverables.",
    "Live Interactive Statuses: Real-time toggling between 'To Do', 'In Progress', and 'Completed'.",
    "Cloud State Persistence: Progress is synced to MongoDB Atlas across all devices."
], border_color=CYAN)

place_image_aspect_fit(s7, mb_road, 5.6, 1.5, 5.0, 5.4)
place_image_aspect_fit(s7, mp_road, 10.9, 1.5, 1.6, 5.4)

# ==========================================
# SLIDE 8: MODULE 5 - GLOBAL SALARY BENCHMARKS
# ==========================================
s8 = prs.slides.add_slide(blank_layout)
add_slide_header(s8, "Module 5: Global Salary Benchmarks & Market Intelligence", "Market Telemetry", 8)

add_feature_card(s8, 0.9, 1.5, 4.4, 5.4, "📊 Real-Time Compensation Data", "Country benchmarks across 6 tech hubs", [
    "Multi-Country Coverage: Real market compensation for India (₹), United States ($), United Kingdom (£), Germany (€), Singapore (S$), and UAE (AED).",
    "LPM & Annual Breakdowns: Accurate salary brackets for Junior, Mid-Level, Senior, and Staff roles.",
    "High-Interest Tech Fields: Tracks surging market demand in Full-Stack, Cloud/DevOps, and Distributed Systems.",
    "Offer Negotiation Leverage: Backs candidates with hard market percentiles during recruitment rounds."
], border_color=EMERALD)

place_image_aspect_fit(s8, mp_salary, 5.7, 1.5, 3.2, 5.4)
place_image_aspect_fit(s8, mp_salary_roles, 9.3, 1.5, 3.2, 5.4)

# ==========================================
# SLIDE 9: MODULE 6 - AI MOCK INTERVIEW SIMULATOR
# ==========================================
s9 = prs.slides.add_slide(blank_layout)
add_slide_header(s9, "Module 6: Interactive AI Technical & Behavioral Interview Practice", "Interview Preparation", 9)

add_feature_card(s9, 0.9, 1.5, 5.0, 5.4, "🎙️ Real-Time Simulator & STAR Coach", "Role-specific practice scenarios", [
    "Resume-Driven Challenge Generation: Dynamically generates behavioral and technical questions based on the candidate's actual experience.",
    "Live STAR Methodology Coaching: Real-time feedback evaluating Situation, Task, Action, and Result framing.",
    "Constructive Score Breakdown: Highlights clarity gaps, technical depth, and actionable response improvements.",
    "Unlimited Realistic Practice: Builds conversational fluency and removes high-stakes interview anxiety."
], border_color=PURPLE)

place_image_aspect_fit(s9, mp_interview, 6.4, 1.5, 6.0, 5.4)

# ==========================================
# SLIDE 10: MODULE 7 - 24/7 AI CAREER & ARCHITECTURE MENTOR
# ==========================================
s10 = prs.slides.add_slide(blank_layout)
add_slide_header(s10, "Module 7: 24/7 AI Career & Architecture Mentor", "AI Mentorship", 10)

add_feature_card(s10, 0.9, 1.5, 5.0, 5.4, "🤖 Dedicated Senior Engineering Mentor", "Contextual career & architecture guidance", [
    "Continuous Context Retention: Mentorship agent retains scanned profile data, roadmap sprint progress, and target roles.",
    "Architecture & System Design: Guidance on microservices, database sharding, caching, and cloud deployments.",
    "Career Strategy & Promotions: Tailored advice on corporate navigation, counter-offers, and technical leadership.",
    "Instant Neural Streaming: Fast streaming responses powered by Gemini 3.1 & 3.7 models."
], border_color=CYAN)

place_image_aspect_fit(s10, mp_mentor, 6.4, 1.5, 6.0, 5.4)

# ==========================================
# SLIDE 11: MODULE 8 - CURATED LEARNING RESOURCES
# ==========================================
s11 = prs.slides.add_slide(blank_layout)
add_slide_header(s11, "Module 8: Curated Learning Resources & Open-Source Hub", "Learning Ecosystem", 11)

add_feature_card(s11, 0.9, 1.5, 5.0, 5.4, "📚 Zero-Noise Technical Documentation", "Handpicked official resources & repos", [
    "Direct Official Documentation: Official docs for React 18, TypeScript, Docker, Node.js, and Kubernetes.",
    "Production-Grade GitHub Repos: Direct links to vetted open-source boilerplates, architectural patterns, and codebases.",
    "Zero Deprecated Tutorials: Handpicked modern references eliminate wasted hours on obsolete libraries.",
    "Role-Aligned Modules: Categorized by Frontend, Backend, Cloud/DevOps, and System Architecture."
], border_color=AMBER)

place_image_aspect_fit(s11, mp_resources, 6.4, 1.5, 6.0, 5.4)

# ==========================================
# SLIDE 12: MODULE 9 & 10 - ADMIN CONSOLE & SECURITY
# ==========================================
s12 = prs.slides.add_slide(blank_layout)
add_slide_header(s12, "Module 9 & 10: Founder Admin Console & Enterprise Security", "Platform Governance", 12)

add_feature_card(s12, 0.9, 1.5, 4.4, 5.4, "🛡️ Enterprise Governance & Analytics", "Built for security and scale", [
    "Founder Administration Console: Secure dashboard for user tracking, active scans, and platform usage telemetry.",
    "Role-Based Access Control: Hardened distinction between anonymous guests, authenticated users, and system administrators.",
    "Zero-Leak Privacy Architecture: Sandboxed resume processing ensures candidate documents are never leaked.",
    "Multi-Device Session Management: Secure JWT tokens with 2FA protection and automatic session timeout."
], border_color=EMERALD)

place_image_aspect_fit(s12, mb_admin, 5.6, 1.5, 6.9, 2.6)
place_image_aspect_fit(s12, mb_login, 5.6, 4.3, 6.9, 2.6)

# ==========================================
# SLIDE 13: FULL-STACK TECHNICAL ARCHITECTURE
# ==========================================
s13 = prs.slides.add_slide(blank_layout)
add_slide_header(s13, "Under the Hood: High-Performance Full-Stack Architecture", "Engineering Architecture", 13)

add_feature_card(s13, 0.9, 1.5, 3.6, 5.4, "🎨 Frontend Stack", "Vite + React 18 SPA", [
    "React 18 & TypeScript for type-safe components.",
    "Tailwind CSS for sleek dark-mode interface.",
    "Lucide React Icons & Framer Motion animations.",
    "Vite Build Pipeline: Instant sub-second HMR.",
    "100% Mobile & Desktop Responsive Drawer."
], border_color=CYAN)

add_feature_card(s13, 4.9, 1.5, 3.6, 5.4, "⚙️ Backend Engine", "Node.js + Express API", [
    "Modular REST API controllers in TypeScript.",
    "MongoDB Atlas cloud database cluster.",
    "Resilient multi-tier database fallback.",
    "Multer multipart stream document ingestion.",
    "Sub-200ms API endpoint execution."
], border_color=EMERALD)

add_feature_card(s13, 8.8, 1.5, 3.6, 5.4, "🧠 AI & Infrastructure", "Gemini Multi-Modal Cloud", [
    "Google Gemini 3.1 & 3.7 Vision models.",
    "Strict JSON Schema outputs for zero UI errors.",
    "Global Vercel Edge CDN distribution.",
    "Zero-cold-start cloud architecture.",
    "Automated CI/CD GitHub deployments."
], border_color=PURPLE)

# ==========================================
# SLIDE 14: KEY COMPETITIVE ADVANTAGES
# ==========================================
s14 = prs.slides.add_slide(blank_layout)
add_slide_header(s14, "Why Career Navigation AI Wins: Competitive Advantage", "Product Advantages", 14)

add_metric_badge(s14, 0.9, 1.5, 2.6, 1.3, "< 5s", "Instant Scan Speed", color=CYAN)
add_metric_badge(s14, 3.9, 1.5, 2.6, 1.3, "100%", "Mobile & Desktop Ready", color=EMERALD)
add_metric_badge(s14, 6.9, 1.5, 2.6, 1.3, "8 Vectors", "Quantified ATS Audit", color=PURPLE)
add_metric_badge(s14, 9.9, 1.5, 2.6, 1.3, "0 Friction", "Guest Test Dropzone", color=AMBER)

add_feature_card(s14, 0.9, 3.1, 5.6, 3.8, "🚀 Frictionless Growth Loop", "Instant Value Before Signup", [
    "Users test resumes with 1-click sample analysis before entering any credentials.",
    "Proven value generates high conversion without aggressive paywalls.",
    "Seamless guest-to-account migration keeps all scan data intact."
], border_color=CYAN)

add_feature_card(s14, 6.9, 3.1, 5.6, 3.8, "🔄 Complete Career Lifecycle", "Not just another resume generator", [
    "Uniquely connects Resume Optimization $\\rightarrow$ Skill Gap Audit $\\rightarrow$ 90-Day Roadmap $\\rightarrow$ Mock Interviews $\\rightarrow$ Salary Benchmarking.",
    "Every learning action directly closes a verified ATS deficiency.",
    "Delivers measurable career outcome improvements for candidates."
], border_color=EMERALD)

# ==========================================
# SLIDE 15: CONCLUSION & TEAM THE HUSTLERS
# ==========================================
s15 = prs.slides.add_slide(blank_layout)
set_slide_background(s15)

top_bar15 = s15.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, Inches(0.12))
top_bar15.fill.solid()
top_bar15.fill.fore_color.rgb = CYAN
top_bar15.line.fill.background()

t15_box = s15.shapes.add_textbox(Inches(0.9), Inches(0.8), Inches(11.5), Inches(1.3))
tf15 = t15_box.text_frame
p15_0 = tf15.paragraphs[0]
p15_0.text = "Thank You! Ready for Questions & Live Demo."
p15_0.font.size = Pt(36)
p15_0.font.bold = True
p15_0.font.color.rgb = WHITE

p15_1 = tf15.add_paragraph()
p15_1.text = "Career Navigation AI — Autonomous Career Copilot by Team The Hustlers"
p15_1.font.size = Pt(17)
p15_1.font.color.rgb = CYAN
p15_1.space_before = Pt(6)

# Left Card: Live links
c_live = s15.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.9), Inches(2.4), Inches(5.6), Inches(4.3))
c_live.fill.solid()
c_live.fill.fore_color.rgb = CARD_BG
c_live.line.color.rgb = CYAN
c_live.line.width = Pt(1.5)
tf_live = c_live.text_frame
tf_live.word_wrap = True

p_lhead = tf_live.paragraphs[0]
p_lhead.text = "🌐 Live Production Links"
p_lhead.font.size = Pt(17)
p_lhead.font.bold = True
p_lhead.font.color.rgb = WHITE

p_lu = tf_live.add_paragraph()
p_lu.text = "🚀 Live Web Application:"
p_lu.font.size = Pt(13)
p_lu.font.bold = True
p_lu.font.color.rgb = EMERALD
p_lu.space_before = Pt(14)

p_lurl = tf_live.add_paragraph()
p_lurl.text = "https://carrer-nav-ai.vercel.app"
p_lurl.font.size = Pt(14)
p_lurl.font.color.rgb = WHITE
p_lurl.space_before = Pt(3)

p_gh = tf_live.add_paragraph()
p_gh.text = "💻 GitHub Source Code Repository:"
p_gh.font.size = Pt(13)
p_gh.font.bold = True
p_gh.font.color.rgb = PURPLE
p_gh.space_before = Pt(14)

p_ghurl = tf_live.add_paragraph()
p_ghurl.text = "github.com/raj40870-pixel/Ai-skill-"
p_ghurl.font.size = Pt(14)
p_ghurl.font.color.rgb = WHITE
p_ghurl.space_before = Pt(3)

p_foot = tf_live.add_paragraph()
p_foot.text = "Built with React 18, TypeScript, Tailwind CSS, Node.js & Google Gemini"
p_foot.font.size = Pt(11)
p_foot.font.color.rgb = GRAY_MUTED
p_foot.space_before = Pt(20)

# Right Card: Team Credits
c_cred = s15.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.9), Inches(2.4), Inches(5.6), Inches(4.3))
c_cred.fill.solid()
c_cred.fill.fore_color.rgb = CARD_BG
c_cred.line.color.rgb = EMERALD
c_cred.line.width = Pt(1.5)
tf_cred = c_cred.text_frame
tf_cred.word_wrap = True

p_chead = tf_cred.paragraphs[0]
p_chead.text = "👥 Project Team: The Hustlers"
p_chead.font.size = Pt(17)
p_chead.font.bold = True
p_chead.font.color.rgb = WHITE

p_k15 = tf_cred.add_paragraph()
p_k15.text = "• Kamaljit"
p_k15.font.size = Pt(16)
p_k15.font.bold = True
p_k15.font.color.rgb = CYAN
p_k15.space_before = Pt(14)

p_ksub = tf_cred.add_paragraph()
p_ksub.text = "   Lead Architect & AI Engineer\n   BCA, Lovely Professional University (2026)"
p_ksub.font.size = Pt(12)
p_ksub.font.color.rgb = GRAY_LIGHT
p_ksub.space_before = Pt(2)

p_m15 = tf_cred.add_paragraph()
p_m15.text = "• Mantaj"
p_m15.font.size = Pt(16)
p_m15.font.bold = True
p_m15.font.color.rgb = PURPLE
p_m15.space_before = Pt(14)

p_msub = tf_cred.add_paragraph()
p_msub.text = "   Co-Developer & Presentation Lead\n   Team The Hustlers"
p_msub.font.size = Pt(12)
p_msub.font.color.rgb = GRAY_LIGHT
p_msub.space_before = Pt(2)

# ==============================================================================
# 3. SAVE PRESENTATION TO MULTIPLE LOCATIONS
# ==============================================================================
out_root = "The_Hustlers_Career_Nav_AI_Presentation.pptx"
prs.save(out_root)
print(f"Presentation saved to: {os.path.abspath(out_root)}")

# Save to Downloads with multiple fallback names
dl_paths = [
    r"C:\Users\Kamaljit\Downloads\The_Hustlers_Career_Nav_AI_Deck.pptx",
    r"C:\Users\Kamaljit\Downloads\Career_Navigation_AI_The_Hustlers.pptx",
    r"C:\Users\Kamaljit\Downloads\The_Hustlers_Career_Nav_AI_Presentation.pptx"
]

for dl in dl_paths:
    try:
        shutil.copy2(out_root, dl)
        print(f"Successfully copied to: {dl}")
    except Exception as e:
        print(f"Skipping {dl} ({e})")

print("Done building Pro Presentation Deck!")
