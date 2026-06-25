from playwright.sync_api import sync_playwright
import os

def run_cuj(page):
    # Navigate to the app
    page.goto("http://localhost:8080")
    page.wait_for_timeout(2000)

    # Scroll down to find one of the new themes, e.g., Mazu
    # Themes are in a grid, so we might need to scroll
    page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
    page.wait_for_timeout(1000)

    # Select Mazu's Birthday theme
    mazu_button = page.get_by_text("媽祖聖誕")
    if mazu_button.is_visible():
        mazu_button.click()
    else:
        # Fallback search if not in view
        page.get_by_role("button", name="媽祖聖誕").click()

    page.wait_for_timeout(1000)

    # Select a background photo
    # The first image should be "媽祖慈悲" or similar
    page.get_by_text("媽祖慈悲").click()
    page.wait_for_timeout(1000)

    # Go to next step (Text Editor)
    page.get_by_role("button", name="下一步").click()
    page.wait_for_timeout(1000)

    # Take screenshot of the editor with the new background
    page.screenshot(path="/home/jules/verification/screenshots/mazu_theme.png")
    page.wait_for_timeout(1000)

    # Navigate to the secret page
    page.goto("http://localhost:8080/lastest.html")
    page.wait_for_timeout(2000)
    page.screenshot(path="/home/jules/verification/screenshots/lastest_page.png")
    page.wait_for_timeout(1000)

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            record_video_dir="/home/jules/verification/videos"
        )
        page = context.new_page()
        try:
            run_cuj(page)
        finally:
            context.close()
            browser.close()
