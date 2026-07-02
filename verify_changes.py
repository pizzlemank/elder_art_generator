from playwright.sync_api import sync_playwright
import os

def run_verification(page):
    # Check lastest.html first
    page.goto("http://localhost:8080/lastest.html")
    page.wait_for_timeout(2000)
    page.screenshot(path="/home/jules/verification/screenshots/lastest_page.png")

    # Check index page and new themes
    page.goto("http://localhost:8080")
    page.wait_for_timeout(2000)

    # Scroll to see new themes if necessary
    page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
    page.wait_for_timeout(1000)
    page.screenshot(path="/home/jules/verification/screenshots/index_page_themes.png")

    # Select a new theme, e.g., Halloween
    # We need to find the theme card. They usually have the theme name.
    page.get_by_text("萬聖節").click()
    page.wait_for_timeout(1000)

    # Verify we are on background selection and see 4 images
    page.screenshot(path="/home/jules/verification/screenshots/halloween_backgrounds.py.png")

if __name__ == "__main__":
    os.makedirs("/home/jules/verification/videos", exist_ok=True)
    os.makedirs("/home/jules/verification/screenshots", exist_ok=True)
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            record_video_dir="/home/jules/verification/videos"
        )
        page = context.new_page()
        try:
            run_verification(page)
        finally:
            context.close()
            browser.close()
