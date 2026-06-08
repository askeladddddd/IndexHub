# Topline IndexHub

**Topline IndexHub** is a robust, sleek internal web tool designed to batch extract PNG QR codes from Google Drive folders and export them into a spreadsheet-safe format. 

Built with a premium interface using `shadcn/ui` and Tailwind CSS, this application allows users to securely fetch links from a Google Drive folder, preview all PNG files inside that folder, and download a meticulously formatted Excel workbook—ensuring that text data (like Serial Numbers with leading zeros) is perfectly preserved without auto-formatting corruption.

---

## 🚀 How It Works

1. **Paste a Link**: Provide a standard link to a Google Drive folder containing PNG files (e.g., QR codes).
2. **Fetch via API Key**: The app utilizes a backend API route to securely query the Google Drive API (`v3`) using a Server-to-Server API Key. *Note: The folder must be publicly shared ("Anyone with the link can view").*
3. **Parse and Preview**: The app parses the file names (e.g., `00123.png` becomes Serial Number `00123`) and displays them in a modern, responsive preview table.
4. **Search & Filter**: Quickly search through hundreds of files instantly by typing in the search box.
5. **Export to Excel**: Using a custom backend export route, the app generates a properly formatted `.xlsx` workbook ready for data entry.
6. **Copy to Clipboard**: A built-in feature allows you to copy the table as Tab-Separated Values (TSV) directly to your clipboard for quick pasting into Google Sheets or Microsoft Excel.

## 💻 Tech Stack

- **Framework:** [Next.js 14](https://nextjs.org/) (App Router)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **UI Components:** [shadcn/ui](https://ui.shadcn.com/) (Cards, Inputs, Buttons)
- **Icons:** [lucide-react](https://lucide.dev/)
- **Toast Notifications:** [Sonner](https://sonner.emilkowal.ski/)
- **Google API:** `googleapis` (Drive v3)
- **Excel Export:** `xlsx` / `exceljs`

## 🛠️ Getting Started

### Prerequisites

You need a **Google Drive API Key** from the Google Cloud Console. Since this app does not use OAuth or require user login, the API key acts as an anonymous viewer.

### Installation

1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env.local` file in the root directory and add your Google API Key:
   ```env
   GOOGLE_API_KEY=your_google_api_key_here
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

> [!WARNING]  
> **Important Note on Google Drive Access**
> Because this application uses an **API Key** rather than an OAuth Login, it cannot access private files tied to your Google Account. 
> 
> **Any Google Drive folder you attempt to extract from must have its Share settings set to "Anyone with the link can view".** If the folder is private or restricted, the extraction will fail with a `404` or `403` error.
