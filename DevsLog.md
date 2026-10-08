## This is for the agent and developer to act as notes and todo list

## Dev Log Entry - Holiday Themes & Secret Latest Page
- Added 15 new themes to `public/data/themes.json` (bringing total to 48 themes), covering top Taiwan-relevant and global major holidays (e.g. White Day, Easter, Halloween, Earth Day, Qixi Festival, Mazu's Birthday, Buddha's Birthday, Earth God's Birthday, Single's Day, Arbor Day).
- Created automated download scripts `scripts/download_unique.py` and `scripts/download_all_themes.py` to acquire SFW, free-licensed stock photos under unique locks and queries for each theme.
- Updated `scripts/generate-latest-page.js` and synced content to create `public/lastest.html` displaying all uploaded stock photos in a masonry layout sorted from newest to earliest.
- Verified all unit tests (`npm test`) and visual rendering using Playwright.

## Ground Rules
- Agent shall not run CLI wihtout explaining, Id rather agent tell CLI and let user(me) run it myself.

- 

## Version Control is placed in
index.tsx

  <footer className="py-2 text-center">
        <span className="text-[10px] text-muted-foreground/30 font-mono">v1.1.0-ar</span>
      </footer>
