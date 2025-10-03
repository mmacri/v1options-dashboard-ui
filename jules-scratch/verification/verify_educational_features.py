import asyncio
from playwright.async_api import async_playwright
import subprocess
import os
import signal

async def main():
    # Start a simple HTTP server in the 'docs' directory
    server_process = subprocess.Popen(
        ['python', '-m', 'http.server', '9001'],
        cwd='docs',
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        preexec_fn=os.setsid
    )

    # Give the server a moment to start
    await asyncio.sleep(2)

    try:
        async with async_playwright() as p:
            browser = await p.chromium.launch()
            page = await browser.new_page()

            # Go to the page and wait for it to be fully loaded
            await page.goto("http://localhost:9001", wait_until="networkidle")

            # Take a full page screenshot for diagnostics
            await page.screenshot(path="jules-scratch/verification/diagnostic_screenshot.png", full_page=True)

            await browser.close()
    finally:
        # Stop the server
        os.killpg(os.getpgid(server_process.pid), signal.SIGTERM)
        server_process.wait()

if __name__ == "__main__":
    asyncio.run(main())