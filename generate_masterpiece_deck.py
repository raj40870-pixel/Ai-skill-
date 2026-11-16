import os
import shutil
import pptx
from pptx.util import Inches, Pt
from pptx.enum.text import PP_ALIGN
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE
from PIL import Image, ImageDraw, ImageFont

# ==============================================================================
# 1. GENERATE ULTRA-SHARP PURE BLACK DEVICE MOCKUPS USING PIL & TRUETYPE FONTS
# ==============================================================================
mockup_dir = os.path.join("screenshots", "mockups_ultra")
os.makedirs(mockup_dir, exist_ok=True)

# Load system font
try:
    font_bold = ImageFont.truetype(r"C:\Windows\Fonts\segoeuib.ttf", 15)
    font_reg = ImageFont.truetype(r"C:\Windows\Fonts\segoeui.ttf", 14)
except Exception:
    try:
        font_bold = ImageFont.truetype(r"C:\Windows\Fonts\arialbd.ttf", 15)
        font_reg = ImageFont.truetype(r"C:\Windows\Fonts\arial.ttf", 14)
    except Exception:
        font_bold = ImageFont.load_default()
        font_reg = ImageFont.load_default()

def create_ultra_browser_mockup(input_path, out_path, url_text="carrer-nav-ai.vercel.app"):
    if not os.path.exists(input_path):
        return None
    im = Image.open(input_path)
    target_w = 1440
    target_h = int(im.size[1] * (target_w / im.size[0]))
    im = im.resize((target_w, target_h), Image.Resampling.LANCZOS)

    bar_h = 48
    border = 2
    total_w = target_w + border * 2
    total_h = target_h + bar_h + border * 2
    canvas = Image.new("RGB", (total_w, total_h), (35, 38, 48))
    draw = ImageDraw.Draw(canvas)

    # Browser top bar
    draw.rectangle((border, border, target_w + border, bar_h + border), fill=(16, 17, 22))

    # Mac 3 Window Buttons
    draw.ellipse((border + 18, border + 15, border + 32, border + 29), fill=(239, 68, 68))
    draw.ellipse((border + 40, border + 15, border + 54, border + 29), fill=(245, 158, 11))
    draw.ellipse((border + 62, border + 15, border + 76, border + 29), fill=(16, 185, 129))

    # Centered URL bar
    pill_w = 540
    pill_x1 = (target_w - pill_w) // 2 + border
    pill_x2 = pill_x1 + pill_w
    draw.rounded_rectangle((pill_x1, border + 8, pill_x2, border + 38), radius=8, fill=(26, 28, 36), outline=(55, 60, 75), width=1)
    
    # URL Text
    draw.text((pill_x1 + 22, border + 14), "🔒 https://" + url_text, fill=(180, 185, 200), font=font_reg)

    # Paste screenshot
    canvas.paste(im, (border, bar_h + border))
    canvas.save(out_path, quality=96)
    return out_path

def create_ultra_phone_mockup(input_path, out_path):
    if not os.path.exists(input_path):
        return None
    im = Image.open(input_path)
    target_w = 580
    target_h = int(im.size[1] * (target_w / im.size[0]))
    im = im.resize((target_w, target_h), Image.Resampling.LANCZOS)

    pad = 12
    notch_h = 30
    bottom_h = 24
    frame_w = target_w + pad * 2
    frame_h = target_h + notch_h + bottom_h

    canvas = Image.new("RGB", (frame_w, frame_h), (8, 9, 12))
    draw = ImageDraw.Draw(canvas)

    # Outer chassis with electric cyan rim
    draw.rounded_rectangle((2, 2, frame_w - 3, frame_h - 3), radius=40, fill=(18, 20, 26), outline=(0, 240, 255), width=2)

    # Dynamic Island pill
    di_w, di_h = 110, 20
    di_x = (frame_w - di_w) // 2
    draw.rounded_rectangle((di_x, 6, di_x + di_w, 6 + di_h), radius=10, fill=(0, 0, 0))

    # Screen paste
    canvas.paste(im, (pad, notch_h))

    # Home indicator bar
    bar_w = 130
    bar_x = (frame_w - bar_w) // 2
    bar_y = frame_h - 13
    draw.rounded_rectangle((bar_x, bar_y, bar_x + bar_w, bar_y + 4), radius=2, fill=(180, 185, 200))

    canvas.save(out_path, quality=96)
    return out_path

print("Rendering Ultra-Definition Mockups with TrueType fonts...")
mb_hero = create_ultra_browser_mockup("screenshots/desktop/01_Landing_Page_Hero_and_Scanner.png", os.path.join(mockup_dir, "mb_hero.png"))
mb_ats = create_ultra_browser_mockup("screenshots/desktop/02_ATS_Score_Lift_and_AutoFix.png", os.path.join(mockup_dir, "mb_ats.png"))
mb_skill = create_ultra_browser_mockup("screenshots/desktop/03_Skill_Gap_Competency_Audit_Report.png", os.path.join(mockup_dir, "mb_skill.png"))
mb_road = create_ultra_browser_mockup("screenshots/desktop/04_Career_Acceleration_Roadmap_Report.png", os.path.join(mockup_dir, "mb_road.png"))
mb_admin = create_ultra_browser_mockup("screenshots/desktop/05_Admin_Console_and_Navigation.png", os.path.join(mockup_dir, "mb_admin.png"))
mb_login = create_ultra_browser_mockup("screenshots/desktop/06_Login_and_Authentication.png", os.path.join(mockup_dir, "mb_login.png"))

mp_interview = create_ultra_phone_mockup("screenshots/mobile/WhatsApp Image 2026-11-16 at 11.24.14 AM.jpeg", os.path.join(mockup_dir, "mp_interview.png"))
mp_mentor = create_ultra_phone_mockup("screenshots/mobile/WhatsApp Image 2026-11-16 at 11.24.13 AM.jpeg", os.path.join(mockup_dir, "mp_mentor.png"))
mp_salary = create_ultra_phone_mockup("screenshots/mobile/WhatsApp Image 2026-11-16 at 11.24.18 AM.jpeg", os.path.join(mockup_dir, "mp_salary.png"))
mp_salary_roles = create_ultra_phone_mockup("screenshots/mobile/WhatsApp Image 2026-11-16 at 11.24.15 AM.jpeg", os.path.join(mockup_dir, "mp_salary_roles.png"))
mp_resources = create_ultra_phone_mockup("screenshots/mobile/WhatsApp Image 2026-11-16 at 11.24.20 AM.jpeg", os.path.join(mockup_dir, "mp_resources.png"))
mp_skill = create_ultra_phone_mockup("screenshots/mobile/WhatsApp Image 2026-11-16 at 11.27.50 AM.jpeg", os.path.join(mockup_dir, "mp_skill.png"))
mp_road = create_ultra_phone_mockup("screenshots/mobile/WhatsApp Image 2026-11-16 at 11.27.56 AM.jpeg", os.path.join(mockup_dir, "mp_road.png"))
mp_dash = create_ultra_phone_mockup("screenshots/mobile/WhatsApp Image 2026-11-16 at 11.24.26 AM.jpeg", os.path.join(mockup_dir, "mp_dash.png"))
print("All ultra-definition mockups generated successfully!")

# ==============================================================================
# 2. GENERATE MASTER PURE BLACK PRESENTATION DECK
# ==============================================================================
prs = pptx.Presentation()
prs.slide_width = Inches(13.333)
prs.slide_height = Inches(7.5)
blank_layout = prs.slide_layouts[6]

# PURE BLACK MASTER PALETTE
C_BG = RGBColor(0, 0, 0)                 # Pure Pitch Black #000000
C_CARD = RGBColor(14, 15, 20)            # Deep Onyx #0E0F14
C_BORDER = RGBColor(34, 38, 50)          # Subtle Rim #222632
C_CYAN = RGBColor(0, 240, 255)           # Electric Cyan #00F0FF
C_EMERALD = RGBColor(0, 255, 157)        # Vivid Emerald #00FF9D
C_PURPLE = RGBColor(168, 85, 247)        # Neon Violet #A855F7
C_AMBER = RGBColor(251, 191, 36)         # Vibrant Amber #FBBF24
C_RED = RGBColor(255, 80, 80)            # High-Impact Red #FF5050
C_WHITE = RGBColor(255, 255, 255)        # Crisp Pure White #FFFFFF
C_GRAY_LIGHT = RGBColor(220, 225, 235)   # Off-white Body #DCE1EB
C_GRAY_MUTED = RGBColor(130, 138, 155)   # Subtitle Gray #828A9B

def set_bg(slide):
    bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, prs.slide_height)
    bg.fill.solid()
    bg.fill.fore_color.rgb = C_BG
    bg.line.fill.background()
    return bg

def add_header(slide, title_text, category_text, subtitle_text, slide_index):
    set_bg(slide)

    # Top Cyan Glow Line
    top_bar = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, Inches(0.1))
    top_bar.fill.solid()
    top_bar.fill.fore_color.rgb = C_CYAN
    top_bar.line.fill.background()

    # Category Pill
    pill = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(0.35), Inches(3.4), Inches(0.36))
    pill.fill.solid()
    pill.fill.fore_color.rgb = RGBColor(14, 15, 20)
    pill.line.color.rgb = C_CYAN
    pill.line.width = Pt(1.2)
    tf_p = pill.text_frame
    p_p = tf_p.paragraphs[0]
    p_p.text = f"✦ {category_text.upper()}"
    p_p.font.size = Pt(10)
    p_p.font.bold = True
    p_p.font.color.rgb = C_CYAN
    p_p.alignment = PP_ALIGN.CENTER

    # Slide Index
    s_box = slide.shapes.add_textbox(Inches(11.2), Inches(0.35), Inches(1.4), Inches(0.35))
    tf_s = s_box.text_frame
    p_s = tf_s.paragraphs[0]
    p_s.text = f"{slide_index:02d} / 15"
    p_s.font.size = Pt(12)
    p_s.font.bold = True
    p_s.font.color.rgb = C_GRAY_MUTED
    p_s.alignment = PP_ALIGN.RIGHT

    # Main Title & Subtitle Box
    t_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.75), Inches(11.8), Inches(0.8))
    tf_t = t_box.text_frame
    tf_t.word_wrap = True
    
    p_t = tf_t.paragraphs[0]
    p_t.text = title_text
    p_t.font.size = Pt(24)
    p_t.font.bold = True
    p_t.font.color.rgb = C_WHITE

    if subtitle_text:
        p_sub = tf_t.add_paragraph()
        p_sub.text = subtitle_text
        p_sub.font.size = Pt(12)
        p_sub.font.color.rgb = C_CYAN
        p_sub.space_before = Pt(2)

def place_image_aspect_fit(slide, img_path, box_x, box_y, box_w, box_h, caption=""):
    if not os.path.exists(img_path):
        return None
    im = Image.open(img_path)
    w_px, h_px = im.size
    aspect = w_px / h_px

    if box_w / box_h > aspect:
        h = box_h
        w = h * aspect
    else:
        w = box_w
        h = w / aspect

    x = box_x + (box_w - w) / 2.0
    y = box_y + (box_h - h) / 2.0

    pic = slide.shapes.add_picture(img_path, Inches(x), Inches(y), Inches(w), Inches(h))

    if caption:
        cap_box = slide.shapes.add_textbox(Inches(x), Inches(y + h + 0.05), Inches(w), Inches(0.3))
        tf_c = cap_box.text_frame
        p_c = tf_c.paragraphs[0]
        p_c.text = caption
        p_c.font.size = Pt(10)
        p_c.font.bold = True
        p_c.font.color.rgb = C_GRAY_MUTED
        p_c.alignment = PP_ALIGN.CENTER
    return pic

def add_pro_card(slide, x, y, w, h, title, subtitle="", bullets=None, border_color=C_BORDER):
    card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(x), Inches(y), Inches(w), Inches(h))
    card.fill.solid()
    card.fill.fore_color.rgb = C_CARD
    card.line.color.rgb = border_color
    card.line.width = Pt(1.5)

    tx = slide.shapes.add_textbox(Inches(x + 0.22), Inches(y + 0.22), Inches(w - 0.44), Inches(h - 0.44))
    tf = tx.text_frame
    tf.word_wrap = True

    p0 = tf.paragraphs[0]
    p0.text = title
    p0.font.size = Pt(16)
    p0.font.bold = True
    p0.font.color.rgb = C_WHITE

    if subtitle:
        p_sub = tf.add_paragraph()
        p_sub.text = subtitle
        p_sub.font.size = Pt(12)
        p_sub.font.color.rgb = C_CYAN
        p_sub.space_before = Pt(4)

    if bullets:
        for b in bullets:
            p_b = tf.add_paragraph()
            p_b.text = "✦  " + b
            p_b.font.size = Pt(12)
            p_b.font.color.rgb = C_GRAY_LIGHT
            p_b.space_before = Pt(8)
    return card

def add_stat_pill(slide, x, y, w, h, big_number, label_text, color=C_CYAN):
    pill = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(x), Inches(y), Inches(w), Inches(h))
    pill.fill.solid()
    pill.fill.fore_color.rgb = C_CARD
    pill.line.color.rgb = color
    pill.line.width = Pt(1.5)

    tx = slide.shapes.add_textbox(Inches(x + 0.1), Inches(y + 0.1), Inches(w - 0.2), Inches(h - 0.2))
    tf = tx.text_frame
    tf.word_wrap = True

    p0 = tf.paragraphs[0]
    p0.text = big_number
    p0.font.size = Pt(26)
    p0.font.bold = True
    p0.font.color.rgb = color
    p0.alignment = PP_ALIGN.CENTER

    p1 = tf.add_paragraph()
    p1.text = label_text
    p1.font.size = Pt(10.5)
    p1.font.color.rgb = C_WHITE
    p1.alignment = PP_ALIGN.CENTER
    p1.space_before = Pt(2)
    return pill

# ==============================================================================
# SLIDE 1: ULTRA PURE BLACK COVER
# ==============================================================================
s1 = prs.slides.add_slide(blank_layout)
set_bg(s1)

top_glow = s1.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, Inches(0.12))
top_glow.fill.solid()
top_glow.fill.fore_color.rgb = C_CYAN
top_glow.line.fill.background()

# Tag pill
pill1 = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.9), Inches(0.85), Inches(4.2), Inches(0.42))
pill1.fill.solid()
pill1.fill.fore_color.rgb = RGBColor(14, 15, 20)
pill1.line.color.rgb = C_CYAN
pill1.line.width = Pt(1.5)
tf_p1 = pill1.text_frame
p_p1 = tf_p1.paragraphs[0]
p_p1.text = "⚡ AUTONOMOUS AI CAREER PLATFORM"
p_p1.font.size = Pt(11)
p_p1.font.bold = True
p_p1.font.color.rgb = C_CYAN
p_p1.alignment = PP_ALIGN.CENTER

# Big Hero Title
t1_box = s1.shapes.add_textbox(Inches(0.9), Inches(1.45), Inches(11.5), Inches(1.6))
tf1 = t1_box.text_frame
tf1.word_wrap = True
p1_0 = tf1.paragraphs[0]
p1_0.text = "Career Navigation AI"
p1_0.font.size = Pt(48)
p1_0.font.bold = True
p1_0.font.color.rgb = C_WHITE

p1_1 = tf1.add_paragraph()
p1_1.text = "Next-Generation Multi-Agent Career Transition Copilot & ATS Intelligence Engine"
p1_1.font.size = Pt(18)
p1_1.font.color.rgb = C_CYAN
p1_1.space_before = Pt(6)

# Left Card: Team The Hustlers
c_team = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.9), Inches(3.3), Inches(5.6), Inches(3.5))
c_team.fill.solid()
c_team.fill.fore_color.rgb = C_CARD
c_team.line.color.rgb = C_CYAN
c_team.line.width = Pt(1.8)
tf_ct = c_team.text_frame
tf_ct.word_wrap = True

p_c0 = tf_ct.paragraphs[0]
p_c0.text = "👥 Project Team: The Hustlers"
p_c0.font.size = Pt(18)
p_c0.font.bold = True
p_c0.font.color.rgb = C_WHITE

p_k = tf_ct.add_paragraph()
p_k.text = "✦ Kamaljit"
p_k.font.size = Pt(16)
p_k.font.bold = True
p_k.font.color.rgb = C_EMERALD
p_k.space_before = Pt(12)

p_k_desc = tf_ct.add_paragraph()
p_k_desc.text = "   Lead Full-Stack Architect & AI System Engineer\n   BCA, Lovely Professional University (Class of 2026)"
p_k_desc.font.size = Pt(12)
p_k_desc.font.color.rgb = C_GRAY_LIGHT
p_k_desc.space_before = Pt(2)

p_m = tf_ct.add_paragraph()
p_m.text = "✦ Mantaj"
p_m.font.size = Pt(16)
p_m.font.bold = True
p_m.font.color.rgb = C_PURPLE
p_m.space_before = Pt(12)

p_m_desc = tf_ct.add_paragraph()
p_m_desc.text = "   Co-Developer & UI/UX Presentation Lead\n   Team The Hustlers"
p_m_desc.font.size = Pt(12)
p_m_desc.font.color.rgb = C_GRAY_LIGHT
p_m_desc.space_before = Pt(2)

# Right Card: Live Production Deliverables
c_links = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.8), Inches(3.3), Inches(5.6), Inches(3.5))
c_links.fill.solid()
c_links.fill.fore_color.rgb = C_CARD
c_links.line.color.rgb = C_EMERALD
c_links.line.width = Pt(1.8)
tf_cl = c_links.text_frame
tf_cl.word_wrap = True

p_l0 = tf_cl.paragraphs[0]
p_l0.text = "🚀 Production Deliverables & Links"
p_l0.font.size = Pt(18)
p_l0.font.bold = True
p_l0.font.color.rgb = C_WHITE

p_l1 = tf_cl.add_paragraph()
p_l1.text = "🌐 Live Web Application:"
p_l1.font.size = Pt(13)
p_l1.font.bold = True
p_l1.font.color.rgb = C_CYAN
p_l1.space_before = Pt(12)

p_lurl = tf_cl.add_paragraph()
p_lurl.text = "https://carrer-nav-ai.vercel.app"
p_lurl.font.size = Pt(14)
p_lurl.font.color.rgb = C_WHITE
p_lurl.space_before = Pt(2)

p_l2 = tf_cl.add_paragraph()
p_l2.text = "💻 GitHub Source Code Repository:"
p_l2.font.size = Pt(13)
p_l2.font.bold = True
p_l2.font.color.rgb = C_PURPLE
p_l2.space_before = Pt(14)

p_ghurl = tf_cl.add_paragraph()
p_ghurl.text = "github.com/raj40870-pixel/Ai-skill-"
p_ghurl.font.size = Pt(14)
p_ghurl.font.color.rgb = C_WHITE
p_ghurl.space_before = Pt(2)

p_tech = tf_cl.add_paragraph()
p_tech.text = "Tech Stack: React 18, Vite, TypeScript, Node.js, Express, MongoDB Atlas, Gemini 3.7 Vision"
p_tech.font.size = Pt(11)
p_tech.font.color.rgb = C_GRAY_MUTED
p_tech.space_before = Pt(16)

# ==========================================
# SLIDE 2: THE PROBLEM STATEMENT
# ==========================================
s2 = prs.slides.add_slide(blank_layout)
add_header(s2, "The Hiring Dilemma: The 75% ATS Rejection Black Hole", "Industry Problem & Need", "Why qualified applicants fail automated screening before human review", 2)

add_stat_pill(s2, 0.9, 1.7, 3.6, 1.25, "75%+", "Resumes Rejected by ATS Bots", color=C_RED)
add_stat_pill(s2, 4.9, 1.7, 3.6, 1.25, "0 Feedback", "No Explanations Given to Applicants", color=C_AMBER)
add_stat_pill(s2, 8.8, 1.7, 3.6, 1.25, "3-6 Mos", "Wasted in Directionless Learning Hell", color=C_PURPLE)

add_pro_card(s2, 0.9, 3.2, 3.6, 3.7, "🤖 Automated Filter Wall", "Unforgiving ATS Algorithms", [
    "Enterprise applicant tracking systems filter out qualified candidates over minor formatting or keyword parsing mismatches.",
    "Candidates are left completely in the dark with zero actionable feedback on how to fix their resume.",
    "High-potential candidates lose job opportunities before a human recruiter ever sees their credentials."
], border_color=C_RED)

add_pro_card(s2, 4.9, 3.2, 3.6, 3.7, "🧭 Directionless Upskilling", "Tutorial Hell Without Progress", [
    "Generic public roadmaps fail to address specific individual skill gaps.",
    "Self-learners spend months studying low-demand technologies rather than verified production skills.",
    "Lack of structured milestones results in burnout and abandoned career transitions."
], border_color=C_AMBER)

add_pro_card(s2, 8.8, 3.2, 3.6, 3.7, "💰 Opaque Market Telemetry", "Blind In Salary & Interview Prep", [
    "Candidates enter compensation negotiations without objective country-wise benchmarks.",
    "Technical and behavioral interview practice with experienced senior mentors is costly and scarce.",
    "STAR-method scenario practice is rarely accessible for college students and career switchers."
], border_color=C_PURPLE)

# ==========================================
# SLIDE 3: EXECUTIVE SOLUTION OVERVIEW
# ==========================================
s3 = prs.slides.add_slide(blank_layout)
add_header(s3, "Executive Solution: Unified 10-Module Career Copilot", "Platform Architecture", "Autonomous multi-agent system guiding the complete career transition journey", 3)

add_pro_card(s3, 0.9, 1.7, 4.6, 5.2, "⚡ 10 Integrated Core Modules", "Complete candidate lifecycle coverage", [
    "Instant Guest Dropzone & Sample Scan",
    "8-Factor Quantified ATS Scorecard",
    "Live 1-Click Bullet Rewriter (Google XYZ)",
    "Competency Audit & Skill Gap Matrix",
    "30-60-90 Day Acceleration Roadmap",
    "Global Country & Role Salary Telemetry",
    "Interactive STAR Mock Interview Practice",
    "24/7 Contextual Architecture AI Mentor",
    "Curated Learning Hub & Open-Source Repos",
    "Founder Admin Console & User Telemetry"
], border_color=C_CYAN)

place_image_aspect_fit(s3, mb_hero, 5.8, 1.7, 6.7, 5.2, "LIVE WEB APPLICATION: HERO & RESUME SCANNER")

# ==========================================
# SLIDE 4: MODULE 1 - INSTANT RESUME SCANNER
# ==========================================
s4 = prs.slides.add_slide(blank_layout)
add_header(s4, "Module 1: Instant Resume Scanner & Guest Dropzone", "Core Capabilities", "Zero-friction onboarding with multi-modal neural document ingestion", 4)

add_pro_card(s4, 0.9, 1.7, 4.5, 3.6, "🎯 Zero-Friction Scan Engine", "Upload or test with 1 click", [
    "Instant Sample Scan: Candidates can evaluate platform capabilities in 5 seconds without registering.",
    "Gemini Multi-Modal Vision: Neural document parsing extracts structural experience, dates, tech stacks, and bullet metrics.",
    "Seamless Auth Retention: Guest scans transition into registered profiles without re-uploading or losing state.",
    "Multi-Format Extraction: Drag-and-drop support for PDF, DOCX, and raw text files."
], border_color=C_CYAN)

add_stat_pill(s4, 0.9, 5.5, 2.1, 1.4, "< 5s", "Instant Scan Speed", color=C_CYAN)
add_stat_pill(s4, 3.3, 5.5, 2.1, 1.4, "100%", "Mobile & Desktop Ready", color=C_EMERALD)

place_image_aspect_fit(s4, mb_hero, 5.7, 1.7, 4.8, 5.2, "Desktop Scanner Dropzone")
place_image_aspect_fit(s4, mp_dash, 10.8, 1.7, 1.8, 5.2, "Mobile App")

# ==========================================
# SLIDE 5: MODULE 2 - ATS SCORECARD & SCORE LIFT
# ==========================================
s5 = prs.slides.add_slide(blank_layout)
add_header(s5, "Module 2: 8-Factor ATS Scorecard & Live Bullet Optimization", "ATS Intelligence", "Proven score lift from 62% to 80%+ using the Google XYZ bullet formula", 5)

add_pro_card(s5, 0.9, 1.7, 4.5, 3.6, "📈 Quantified 8-Factor Audit", "Actionable recommendations that work", [
    "8 Evaluated Vectors: Keyword Density, Action Verbs, Measurable Impact, Formatting, Brevity, Section Clarity, Tech Alignment, and Industry Standards.",
    "Google XYZ Rewriting Engine: Instantly converts weak lines into 'Accomplished [X] as measured by [Y] by doing [Z]'.",
    "1-Click Clipboard Copying: Candidates copy optimized bullets directly into their master resume."
], border_color=C_EMERALD)

add_stat_pill(s5, 0.9, 5.5, 2.1, 1.4, "+29%", "Average ATS Score Lift", color=C_EMERALD)
add_stat_pill(s5, 3.3, 5.5, 2.1, 1.4, "8 Core", "Evaluation Vectors", color=C_CYAN)

place_image_aspect_fit(s5, mb_ats, 5.7, 1.7, 6.8, 5.2, "ATS SCORE BREAKDOWN & 1-CLICK BULLET REWRITE ENGINE")

# ==========================================
# SLIDE 6: MODULE 3 - SKILL GAP ANALYSIS MATRIX
# ==========================================
s6 = prs.slides.add_slide(blank_layout)
add_header(s6, "Module 3: Competency Audit & Verified Skill Gap Matrix", "Skill Gap Intelligence", "Automated gap detection between candidate profile and real market requirements", 6)

add_pro_card(s6, 0.9, 1.7, 4.5, 5.2, "🔍 Deep Role-Based Audit", "Pinpoint exact technical deficiencies", [
    "Verified Profile Strengths: Automatically detects mastered technologies (React, Node, TypeScript, Docker).",
    "Missing Core vs. Advanced Skills: Segregates immediate missing requirements from advanced nice-to-haves.",
    "Interactive Chip Badges: Synced visual badges across desktop matrix and mobile responsive drawer.",
    "Roadmap Integration: Every missing competency automatically populates matching action sprints."
], border_color=C_PURPLE)

place_image_aspect_fit(s6, mb_skill, 5.7, 1.7, 5.1, 5.2, "Skill Gap Competency Audit Matrix")
place_image_aspect_fit(s6, mp_skill, 11.0, 1.7, 1.6, 5.2, "Mobile Badges")

# ==========================================
# SLIDE 7: MODULE 4 - 30-60-90 DAY ROADMAP
# ==========================================
s7 = prs.slides.add_slide(blank_layout)
add_header(s7, "Module 4: 30-60-90 Day Career Acceleration Roadmap", "Career Acceleration", "Sprint-based learning milestones with live progress tracking and cloud persistence", 7)

add_pro_card(s7, 0.9, 1.7, 4.5, 5.2, "🗺️ Sprint-Based Execution Plan", "Transform gaps into verified proofs", [
    "Structured 3-Sprint Milestones: Sprint 1 (Foundations), Sprint 2 (Production Patterns), Sprint 3 (System Architecture).",
    "Practical Hands-On Tasks: Hours estimation, clear completion checklists, and project deliverables.",
    "Live Interactive Statuses: Real-time toggling between 'To Do', 'In Progress', and 'Completed'.",
    "Cloud State Persistence: Progress is synced to MongoDB Atlas across all devices."
], border_color=C_CYAN)

place_image_aspect_fit(s7, mb_road, 5.7, 1.7, 5.1, 5.2, "Sprint-Based Career Roadmap")
place_image_aspect_fit(s7, mp_road, 11.0, 1.7, 1.6, 5.2, "Mobile Sprints")

# ==========================================
# SLIDE 8: MODULE 5 - GLOBAL SALARY BENCHMARKS
# ==========================================
s8 = prs.slides.add_slide(blank_layout)
add_header(s8, "Module 5: Global Salary Benchmarks & Market Intelligence", "Market Telemetry", "Real-world tech compensation across 6 major global markets", 8)

add_pro_card(s8, 0.9, 1.7, 4.5, 5.2, "📊 Real-Time Compensation Data", "Country benchmarks across 6 tech hubs", [
    "Multi-Country Coverage: Real market compensation for India (₹), United States ($), United Kingdom (£), Germany (€), Singapore (S$), and UAE (AED).",
    "LPM & Annual Breakdowns: Accurate salary brackets for Junior, Mid-Level, Senior, and Staff roles.",
    "High-Interest Tech Fields: Tracks surging market demand in Full-Stack, Cloud/DevOps, and Distributed Systems.",
    "Offer Negotiation Leverage: Backs candidates with hard market percentiles during recruitment rounds."
], border_color=C_EMERALD)

place_image_aspect_fit(s8, mp_salary, 5.7, 1.7, 3.2, 5.2, "Country-Wise Salary Breakdown")
place_image_aspect_fit(s8, mp_salary_roles, 9.3, 1.7, 3.2, 5.2, "High-Interest Production Roles")

# ==========================================
# SLIDE 9: MODULE 6 - AI MOCK INTERVIEW SIMULATOR
# ==========================================
s9 = prs.slides.add_slide(blank_layout)
add_header(s9, "Module 6: Interactive AI Technical & Behavioral Interview Practice", "Interview Preparation", "Real-time scenario-based challenges with live STAR methodology coaching", 9)

add_pro_card(s9, 0.9, 1.7, 5.0, 5.2, "🎙️ Scenario-Based Interview Simulator", "Real-time STAR method feedback", [
    "Resume-Driven Challenge Generation: Dynamically generates behavioral and technical questions based on the candidate's actual experience.",
    "Live STAR Methodology Coaching: Real-time feedback evaluating Situation, Task, Action, and Result framing.",
    "Constructive Score Breakdown: Highlights clarity gaps, technical depth, and actionable response improvements.",
    "Unlimited Realistic Practice: Builds conversational fluency and removes high-stakes interview anxiety."
], border_color=C_PURPLE)

place_image_aspect_fit(s9, mp_interview, 6.4, 1.7, 6.0, 5.2, "LIVE INTERVIEW SIMULATOR & STAR COACHING TIP")

# ==========================================
# SLIDE 10: MODULE 7 - 24/7 AI CAREER & ARCHITECTURE MENTOR
# ==========================================
s10 = prs.slides.add_slide(blank_layout)
add_header(s10, "Module 7: 24/7 AI Career & Architecture Mentorship", "AI Mentorship", "Persistent conversational memory for system design and career progression", 10)

add_pro_card(s10, 0.9, 1.7, 5.0, 5.2, "🤖 Dedicated Senior Engineering Mentor", "Contextual career & architecture guidance", [
    "Continuous Context Retention: Mentorship agent retains scanned profile data, roadmap sprint progress, and target roles.",
    "Architecture & System Design: Guidance on microservices, database sharding, caching, and cloud deployments.",
    "Career Strategy & Promotions: Tailored advice on corporate navigation, counter-offers, and technical leadership.",
    "Instant Neural Streaming: Fast streaming responses powered by Gemini 3.7 models."
], border_color=C_CYAN)

place_image_aspect_fit(s10, mp_mentor, 6.4, 1.7, 6.0, 5.2, "24/7 CONVERSATIONAL ARCHITECTURE MENTOR")

# ==========================================
# SLIDE 11: MODULE 8 - CURATED LEARNING RESOURCES
# ==========================================
s11 = prs.slides.add_slide(blank_layout)
add_header(s11, "Module 8: Curated Learning Resources & Open-Source Hub", "Learning Ecosystem", "Zero-noise collection of official documentation and production repositories", 11)

add_pro_card(s11, 0.9, 1.7, 5.0, 5.2, "📚 Zero-Noise Technical Documentation", "Handpicked official resources & repos", [
    "Direct Official Documentation: Official docs for React 18, TypeScript, Docker, Node.js, and Kubernetes.",
    "Production-Grade GitHub Repos: Direct links to vetted open-source boilerplates, architectural patterns, and codebases.",
    "Zero Deprecated Tutorials: Handpicked modern references eliminate wasted hours on obsolete libraries.",
    "Role-Aligned Modules: Categorized by Frontend, Backend, Cloud/DevOps, and System Architecture."
], border_color=C_AMBER)

place_image_aspect_fit(s11, mp_resources, 6.4, 1.7, 6.0, 5.2, "CURATED REPOSITORIES & DOCUMENTATION")

# ==========================================
# SLIDE 12: MODULE 9 & 10 - ADMIN CONSOLE & SECURITY
# ==========================================
s12 = prs.slides.add_slide(blank_layout)
add_header(s12, "Module 9 & 10: Founder Admin Console & Enterprise Security", "Platform Governance", "Centralized administrative telemetry and zero-leak privacy controls", 12)

add_pro_card(s12, 0.9, 1.7, 4.5, 5.2, "🛡️ Enterprise Governance & Analytics", "Built for security and scale", [
    "Founder Administration Console: Secure dashboard for user tracking, active scans, and platform usage telemetry.",
    "Role-Based Access Control: Hardened distinction between anonymous guests, authenticated users, and system administrators.",
    "Zero-Leak Privacy Architecture: Sandboxed resume processing ensures candidate documents are never leaked.",
    "Multi-Device Session Management: Secure JWT tokens with 2FA protection and automatic session timeout."
], border_color=C_EMERALD)

place_image_aspect_fit(s12, mb_admin, 5.7, 1.7, 6.8, 2.5, "Founder Admin Console")
place_image_aspect_fit(s12, mb_login, 5.7, 4.4, 6.8, 2.5, "Authentication & 2FA Security")

# ==========================================
# SLIDE 13: FULL-STACK TECHNICAL ARCHITECTURE
# ==========================================
s13 = prs.slides.add_slide(blank_layout)
add_header(s13, "Under the Hood: High-Performance Full-Stack Architecture", "Engineering Architecture", "Built with React 18, Node.js, MongoDB Atlas, and Google Gemini Vision", 13)

add_pro_card(s13, 0.9, 1.7, 3.6, 5.2, "🎨 Frontend Stack", "Vite + React 18 SPA", [
    "React 18 & TypeScript for type-safe components.",
    "Tailwind CSS for sleek dark-mode interface.",
    "Lucide React Icons & Framer Motion animations.",
    "Vite Build Pipeline: Instant sub-second HMR.",
    "100% Mobile & Desktop Responsive Drawer."
], border_color=C_CYAN)

add_pro_card(s13, 4.9, 1.7, 3.6, 5.2, "⚙️ Backend Engine", "Node.js + Express API", [
    "Modular REST API controllers in TypeScript.",
    "MongoDB Atlas cloud database cluster.",
    "Resilient multi-tier database fallback.",
    "Multer multipart stream document ingestion.",
    "Sub-200ms API endpoint execution."
], border_color=C_EMERALD)

add_pro_card(s13, 8.8, 1.7, 3.6, 5.2, "🧠 AI & Infrastructure", "Gemini Multi-Modal Cloud", [
    "Google Gemini 3.1 & 3.7 Vision models.",
    "Strict JSON Schema outputs for zero UI errors.",
    "Global Vercel Edge CDN distribution.",
    "Zero-cold-start cloud architecture.",
    "Automated CI/CD GitHub deployments."
], border_color=C_PURPLE)

# ==========================================
# SLIDE 14: KEY COMPETITIVE ADVANTAGES
# ==========================================
s14 = prs.slides.add_slide(blank_layout)
add_header(s14, "Why Career Navigation AI Wins: Competitive Advantage", "Product Advantages", "Measurable outcomes that differentiate from generic LLM wrappers", 14)

add_stat_pill(s14, 0.9, 1.7, 2.6, 1.25, "< 5s", "Instant Scan Speed", color=C_CYAN)
add_stat_pill(s14, 3.9, 1.7, 2.6, 1.25, "100%", "Mobile & Desktop Ready", color=C_EMERALD)
add_stat_pill(s14, 6.9, 1.7, 2.6, 1.25, "8 Vectors", "Quantified ATS Audit", color=C_PURPLE)
add_stat_pill(s14, 9.9, 1.7, 2.6, 1.25, "0 Friction", "Guest Test Dropzone", color=C_AMBER)

add_pro_card(s14, 0.9, 3.2, 5.6, 3.7, "🚀 Frictionless Growth Loop", "Instant Value Before Signup", [
    "Users test resumes with 1-click sample analysis before entering any credentials.",
    "Proven value generates high conversion without aggressive paywalls.",
    "Seamless guest-to-account migration keeps all scan data intact."
], border_color=C_CYAN)

add_pro_card(s14, 6.9, 3.2, 5.6, 3.7, "🔄 Complete Career Lifecycle", "Not just another resume generator", [
    "Uniquely connects Resume Optimization → Skill Gap Audit → 90-Day Roadmap → Mock Interviews → Salary Benchmarking.",
    "Every learning action directly closes a verified ATS deficiency.",
    "Delivers measurable career outcome improvements for candidates."
], border_color=C_EMERALD)

# ==========================================
# SLIDE 15: CONCLUSION & TEAM THE HUSTLERS
# ==========================================
s15 = prs.slides.add_slide(blank_layout)
set_bg(s15)

top_glow15 = s15.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, Inches(0.12))
top_glow15.fill.solid()
top_glow15.fill.fore_color.rgb = C_CYAN
top_glow15.line.fill.background()

t15_box = s15.shapes.add_textbox(Inches(0.9), Inches(0.8), Inches(11.5), Inches(1.3))
tf15 = t15_box.text_frame
p15_0 = tf15.paragraphs[0]
p15_0.text = "Thank You! Ready for Questions & Live Demo."
p15_0.font.size = Pt(38)
p15_0.font.bold = True
p15_0.font.color.rgb = C_WHITE

p15_1 = tf15.add_paragraph()
p15_1.text = "Career Navigation AI — Autonomous Career Copilot by Team The Hustlers"
p15_1.font.size = Pt(18)
p15_1.font.color.rgb = C_CYAN
p15_1.space_before = Pt(6)

# Left Card: Live links
c_live = s15.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.9), Inches(2.4), Inches(5.6), Inches(4.3))
c_live.fill.solid()
c_live.fill.fore_color.rgb = C_CARD
c_live.line.color.rgb = C_CYAN
c_live.line.width = Pt(1.8)
tf_live = c_live.text_frame
tf_live.word_wrap = True

p_lhead = tf_live.paragraphs[0]
p_lhead.text = "🌐 Live Production Links"
p_lhead.font.size = Pt(18)
p_lhead.font.bold = True
p_lhead.font.color.rgb = C_WHITE

p_lu = tf_live.add_paragraph()
p_lu.text = "🚀 Live Web Application:"
p_lu.font.size = Pt(13)
p_lu.font.bold = True
p_lu.font.color.rgb = C_EMERALD
p_lu.space_before = Pt(14)

p_lurl = tf_live.add_paragraph()
p_lurl.text = "https://carrer-nav-ai.vercel.app"
p_lurl.font.size = Pt(14)
p_lurl.font.color.rgb = C_WHITE
p_lurl.space_before = Pt(3)

p_gh = tf_live.add_paragraph()
p_gh.text = "💻 GitHub Source Code Repository:"
p_gh.font.size = Pt(13)
p_gh.font.bold = True
p_gh.font.color.rgb = C_PURPLE
p_gh.space_before = Pt(14)

p_ghurl = tf_live.add_paragraph()
p_ghurl.text = "github.com/raj40870-pixel/Ai-skill-"
p_ghurl.font.size = Pt(14)
p_ghurl.font.color.rgb = C_WHITE
p_ghurl.space_before = Pt(3)

p_foot = tf_live.add_paragraph()
p_foot.text = "Built with React 18, TypeScript, Tailwind CSS, Node.js & Google Gemini"
p_foot.font.size = Pt(11)
p_foot.font.color.rgb = C_GRAY_MUTED
p_foot.space_before = Pt(20)

# Right Card: Team Credits
c_cred = s15.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.9), Inches(2.4), Inches(5.6), Inches(4.3))
c_cred.fill.solid()
c_cred.fill.fore_color.rgb = C_CARD
c_cred.line.color.rgb = C_EMERALD
c_cred.line.width = Pt(1.8)
tf_cred = c_cred.text_frame
tf_cred.word_wrap = True

p_chead = tf_cred.paragraphs[0]
p_chead.text = "👥 Project Team: The Hustlers"
p_chead.font.size = Pt(18)
p_chead.font.bold = True
p_chead.font.color.rgb = C_WHITE

p_k15 = tf_cred.add_paragraph()
p_k15.text = "✦ Kamaljit"
p_k15.font.size = Pt(16)
p_k15.font.bold = True
p_k15.font.color.rgb = C_CYAN
p_k15.space_before = Pt(14)

p_ksub = tf_cred.add_paragraph()
p_ksub.text = "   Lead Architect & AI Engineer\n   BCA, Lovely Professional University (Class of 2026)"
p_ksub.font.size = Pt(12)
p_ksub.font.color.rgb = C_GRAY_LIGHT
p_ksub.space_before = Pt(2)

p_m15 = tf_cred.add_paragraph()
p_m15.text = "✦ Mantaj"
p_m15.font.size = Pt(16)
p_m15.font.bold = True
p_m15.font.color.rgb = C_PURPLE
p_m15.space_before = Pt(14)

p_msub = tf_cred.add_paragraph()
p_msub.text = "   Co-Developer & Presentation Lead\n   Team The Hustlers"
p_msub.font.size = Pt(12)
p_msub.font.color.rgb = C_GRAY_LIGHT
p_msub.space_before = Pt(2)

# ==============================================================================
# 3. SAVE MASTERPIECE PRESENTATION
# ==============================================================================
out_root = "The_Hustlers_Career_Nav_AI_Presentation.pptx"
prs.save(out_root)
print(f"Master presentation saved to root: {os.path.abspath(out_root)}")

# Save to public directory for direct web download link
os.makedirs("public", exist_ok=True)
public_path = os.path.join("public", "The_Hustlers_Career_Nav_AI_Presentation.pptx")
shutil.copy2(out_root, public_path)
print(f"Copied to public folder for web download: {public_path}")

# Save to Downloads directory
dl_targets = [
    r"C:\Users\Kamaljit\Downloads\Career_Navigation_AI_Black_Edition.pptx",
    r"C:\Users\Kamaljit\Downloads\The_Hustlers_Career_Nav_AI_Master.pptx",
    r"C:\Users\Kamaljit\Downloads\Career_Navigation_AI_The_Hustlers.pptx",
    r"C:\Users\Kamaljit\Downloads\The_Hustlers_Career_Nav_AI_Presentation.pptx"
]

for dl in dl_targets:
    try:
        shutil.copy2(out_root, dl)
        print(f"Successfully copied to Downloads: {dl}")
    except Exception as e:
        print(f"Skipping {dl} ({e})")

print("All Masterpiece Presentations successfully updated!")
