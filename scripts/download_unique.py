import sys
import os
import time
import requests
import hashlib

def get_file_md5(filepath):
    hash_md5 = hashlib.md5()
    with open(filepath, "rb") as f:
        for chunk in iter(lambda: f.read(4096), b""):
            hash_md5.update(chunk)
    return hash_md5.hexdigest()

def main():
    if len(sys.argv) < 4:
        print("Usage: python download_unique.py <theme_id> <comma_queries> <count>")
        sys.exit(1)

    theme_id = sys.argv[1]
    queries = [q.strip() for q in sys.argv[2].split(',')]
    count = int(sys.argv[3])

    target_dir = os.path.join("public", "backgrounds", theme_id)
    os.makedirs(target_dir, exist_ok=True)

    print(f"Downloading images for {theme_id} (Queries: {queries})...")

    existing_hashes = set()
    for root, dirs, files in os.walk(target_dir):
        for f in files:
            if f.endswith(('.jpg', '.jpeg', '.png', '.webp')):
                existing_hashes.add(get_file_md5(os.path.join(root, f)))

    downloaded = 0
    # count existing valid WebP/JPGs
    existing_files = [f for f in os.listdir(target_dir) if f.endswith(('.jpg', '.jpeg', '.png', '.webp'))]
    idx = len(existing_files) + 1

    attempts = 0
    while downloaded < count and attempts < count * 5:
        attempts += 1
        query = queries[(attempts - 1) % len(queries)]
        lock_id = f"{theme_id}_{attempts}_{int(time.time())}"

        url = f"https://loremflickr.com/1200/900/{query}/all?lock={lock_id}"
        filepath = os.path.join(target_dir, f"{idx:02d}.jpg")

        try:
            resp = requests.get(url, timeout=10, headers={'User-Agent': 'Mozilla/5.0'})
            if resp.status_code == 200 and len(resp.content) > 10000:
                content_hash = hashlib.md5(resp.content).hexdigest()
                if content_hash not in existing_hashes:
                    with open(filepath, 'wb') as f:
                        f.write(resp.content)
                    existing_hashes.add(content_hash)
                    print(f"  [+] Saved {filepath} (Hash: {content_hash[:8]})")
                    downloaded += 1
                    idx += 1
                else:
                    print(f"  [-] Duplicate image received for query '{query}', retrying...")
            else:
                print(f"  [-] Bad response or small file size for query '{query}'")
        except Exception as e:
            print(f"  [-] Error downloading: {e}")

        time.sleep(0.3)

    print(f"Finished {theme_id}: downloaded {downloaded} new images.")

if __name__ == "__main__":
    main()
