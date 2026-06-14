# PaperPilot

PaperPilot is an intelligent workspace platform designed to help research teams collaborate efficiently. It allows teams to organize their work into organizations and sub-teams, seamlessly invite collaborators, and collectively review, track, and manage research articles (such as literature reviews) at scale.

## Core Features

- **Robust Authentication & Teams**: Built on Better Auth, users can create Organizations and Teams. Role-based access ensures only Admins can invite team members, while members can securely collaborate.
- **Email Invitations**: Integrated NodeMailer service allows admins to send direct email invites with secure, tokenized acceptance links.
- **Bulk Article Upload**: A seamless drag-and-drop Excel/CSV parser (`xlsx`) that instantly extracts article metadata (PMID, Title, Authors, Citations, DOI, etc.) directly into your database.
- **Interactive Review Workspace**: Filter, sort, and navigate through hundreds of uploaded articles. Real-time aggregate statistics display how many team members have voted to "Include" or "Exclude" an article.
- **Dedicated Editor & To-Do Lists**: Each article features a split-screen "Editor" view. Reviewers are assigned personalized To-Do checklists (e.g., "Read Abstract", "Verify Methodology"). Team progress is tracked natively via JSON states to visualize exactly what percentage of the review task each member has completed.

---

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Vanilla CSS & Tailwind CSS for utility wrappers
- **Database**: PostgreSQL (Hosted on Supabase)
- **ORM**: Drizzle ORM
- **Authentication**: Better Auth
- **File Parsing**: SheetJS (`xlsx`)

---

## Local Setup

### 1. Clone the repository and install dependencies
Use `pnpm` (recommended) to install the project dependencies.
```bash
pnpm install
```

### 2. Set up Environment Variables
Copy the provided `.env.example` file to create your own local `.env`.
```bash
cp .env.example .env
```
Ensure you fill out:
- `DATABASE_URL`: Your PostgreSQL connection string. (If using Supabase, append `?pgbouncer=true` if using the pooler port 6543).
- `BETTER_AUTH_SECRET`: Generate a random base64 string for secure session signing.
- `MAIL_USERNAME` / `MAIL_PASSWORD`: Used for sending out team invitations.

### 3. Push the Database Schema
PaperPilot uses Drizzle to manage schemas. You must push the schemas to your fresh database before running the app.
```bash
npx drizzle-kit push
```

### 4. Run the Development Server
```bash
pnpm run dev
```
Navigate to `http://localhost:3000` to see the application!

---

## Database Structure

The project separates database schemas into logical domains inside `app/core/db/schema/`:

### 1. Auth & Organization Schema (`auth-schema.ts`)
Powered primarily by Better Auth's core and organization plugins.
- **`user`**, **`session`**, **`account`**: Standard authentication entities.
- **`organization`**: The highest-level entity a user can create.
- **`member`**, **`invitation`**: Tracks who belongs to the organization and pending email invites.
- **`team`**: Sub-groups inside an organization.
- **`team_member`**: Maps users to specific teams with assigned roles (e.g., `admin`, `member`).

### 2. Workspace Schema (`workspace-schema.ts`)
Manages the actual data assets of the platform.
- **`article`**: Stores the raw parsed data from Excel uploads. It belongs to a specific `team_id` and tracks the `uploaded_by_user_id`. Columns include `pmid`, `title`, `authors`, `citation`, `journal`, etc.
- **`article_review`**: The mapping between a `user_id` and an `article_id`. 
  - `decision`: Tracks "Include", "Exclude", or "Maybe".
  - `notes`: Custom text notes written by the reviewer.
  - `checklist`: A robust `JSON` column storing an array of tasks (`[{ id, text, completed }]`) to individually track the user's progress for this specific article.

---

## Project Flow

1. **Authentication:** 
   - A new user lands on the homepage and signs up at `/ui/signup`.
   - Better Auth creates the user session.
2. **Organization Management:**
   - The user creates a new Organization (`/ui/dashboard/organization`).
   - They create a Team inside that Organization.
3. **Collaboration:**
   - The user goes to the Team Dashboard and clicks **Add Member**.
   - An email is fired off using NodeMailer. The invitee clicks the link, accepts the token, and is securely mapped into the `team_member` table.
4. **Data Import:**
   - Inside the Team Dashboard, the user clicks **Upload Articles**.
   - They drag an Excel sheet. The client parses the file and securely POSTs a clean JSON payload to `importArticlesServer`.
   - The server validates the user is a team member and bulk-inserts the records into the `article` table.
5. **Reviewing:**
   - The Team Dashboard displays the `ArticleReviewWorkspace` table.
   - Clicking an article row routes the user to the dedicated `/article/[articleId]` editor page.
   - The user completes their checklist and sets a decision. 
   - `submitArticleReviewServer` saves their checklist state to the database, instantly updating the global Team Progress tracker visible to all members.
