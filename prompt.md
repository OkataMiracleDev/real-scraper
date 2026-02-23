

"Act as a Senior Full-Stack Engineer and Web Scraping Expert. Help me build a **Real Estate Lead Generation Tool** focused on the Nigerian market using **Next.js 15 (App Router)**.

### **1. Core Objective**

Build a scraper that targets major Nigerian property portals (start with **Nigeria Property Centre** and **PropertyPro.ng**) to extract contact details of real estate agents who **do not** have their own websites (e.g., they only list their phone/WhatsApp and a generic profile).

### **2. Technical Stack**

* **Framework:** Next.js 15 with Tailwind CSS and Shadcn/UI for the frontend.
* **Scraping Engine:** Playwright (with `playwright-extra` and `stealth` plugin) to bypass Cloudflare/bot detection common on Nigerian sites.
* **Background Tasks:** Since scraping takes longer than the standard 10s Vercel timeout, use **Inngest** or **Upstash QStash** to handle the scraping process in the background.
* **Database:** Prisma ORM with MongoDB (to handle the flexible schema of various agent profiles).
* **Data Export:** `papaparse` for CSV generation and `xlsx` for Excel.

### **3. Deep-Think Features for Seamless UX**

* **Agent Profiling Logic:** The scraper must flag 'Independent Agents.' An agent is considered a 'lead' if their profile contains a phone number but the 'Website' field is empty or points back to the portal itself.
* **WhatsApp Direct Link:** Automatically format the Nigerian phone numbers into `wa.me` links in the UI.
* **Anti-Ban Strategy:** Implement random User-Agents, residential proxy rotation support, and human-like delays ( seconds) between page navigations.
* **Live Progress UI:** Use **Server-Sent Events (SSE)** or a polling mechanism so the frontend shows a progress bar (e.g., 'Scanned 45/200 agents...') while the background worker runs.

### **4. Frontend Requirements**

* **Dashboard:** A clean table using TanStack Table with filters for Location (Lekki, Ikeja, Abuja, etc.) and Property Type.
* **Visuals:** A small dashboard at the top using **Recharts** showing the distribution of agents by region.
* **Action Button:** A 'Start Scrape' button that triggers the background job and a 'Download Report' button that exports the current view to CSV/Excel.

### **5. Your Tasks**

1. Generate the `schema.prisma` for the Agent and Property models.
2. Write the Playwright scraping script specifically targeting the CSS selectors for **Nigeria Property Centre** listings.
3. Create the Next.js Server Action to trigger the scrape.
4. Build the responsive dashboard UI using Shadcn/UI components.

Please start by providing the project structure and the scraping logic for the first site."

---

### Why this works

* **Stealth Plugin:** Nigerian sites are increasingly using Cloudflare. Standard scrapers will get blocked immediately; "Stealth" mimics a real Chrome browser.
* **Background Processing:** If you try to scrape 50 pages in a standard Next.js API route, it will timeout and fail. Using a tool like Inngest ensures the job finishes even if you close the browser.
* **Shadcn/UI:** This gives you a professional, high-end "SaaS" look with almost zero effort, making the data easy to read on mobile.
