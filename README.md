# Modern To-Do List 

A sleek, responsive, and fully client-side task management application built with React, Vite, Tailwind CSS, and `dnd-kit`. This project is designed to offer a premium, SaaS-like experience directly in your browser without requiring a backend, utilizing `localStorage` for complete data persistence.

## 🚀 Features Implemented

- **Modern Dashboard UI:** A beautiful, dark-themed dashboard greeting users with quick stats, recent workspaces, and dynamic gradients.
- **Workspaces & Boards:** Create infinite isolated workspaces. Each workspace contains a Kanban-style board where you can manage complex projects.
- **Drag-and-Drop (DnD):** Seamlessly reorder sections (columns) and drag task cards between different sections using `@dnd-kit`.
- **Task Management Engine:**
  - Create, rename, and delete task cards.
  - Add nested subtasks (checklists) with progress bars that track completion percentage.
  - Independent **"My Tasks"** view for standard, standalone to-dos that aren't tied to a specific workspace.
- **Customization & State:** 
  - Edit workspace names and column headers dynamically.
  - State is saved entirely locally in your browser so you never lose your data across sessions or reloads.
- **Fully Responsive:** Smooth collapse behaviors, dynamic sidebars, and fluid flexbox-based layouts.

## 🔮 Future Improvements

While this app serves as a robust standalone frontend, there are several exciting paths for future development:
1. **Backend Integration (Database + Auth):** Hook the application up to a backend (like Node.js/Express, Firebase, or Supabase) to allow cross-device syncing and user authentication.
2. **Collaborative Features:** Implement WebSockets (e.g., Socket.io) to allow multiple team members to edit the same board in real-time.
3. **Themes & Customization:** Add a light mode overlay and let users customize the gradient colors of their workspaces.
4. **Rich Text Descriptions:** Allow Markdown support inside task cards for rich-text descriptions, file attachments, and comment sections.
5. **Due Dates & Calendars:** Expand the "My Tasks" and "Board" views to integrate deeply with calendar deadlines and reminders.

---

## 💻 Getting Started (Local Development)

To clone and run this application on your local machine, ensure you have [Node.js](https://nodejs.org/) installed.

### 1. Clone the repository
```bash
git clone https://github.com/omhujband/To-Do-List.git
cd To-Do-List
```

### 2. Install dependencies
Using npm:
```bash
npm install
```

### 3. Run the development server
```bash
npm run dev
```

The app should now be running locally, typically at `http://localhost:5173`. Any changes you make in the code will hot-reload automatically.

