from playwright.sync_api import sync_playwright
import os

def run_cuj(page):
    # Navigate to the secret page directly as it's easier to verify existence of images
    page.goto("http://localhost:8080/lastest.html")
    page.wait_for_timeout(3000)

    # Scroll down a bit to show more images
    page.mouse.wheel(0, 1000)
    page.wait_for_timeout(2000)

    page.screenshot(path="/home/jules/verification/screenshots/lastest_page_v2.png")
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
