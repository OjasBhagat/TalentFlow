# TalentFlow - Mini Hiring Platform

## Overview

TalentFlow is a comprehensive hiring platform built with React and Vite that streamlines the recruitment process. It allows HR teams to manage job postings, track candidates through different stages, create and manage assessments, and visualize the hiring pipeline through an interactive Kanban board.

The application features a mock backend using MirageJS for development, with persistent storage using LocalForage. It includes authentication, drag-and-drop functionality, and a responsive design built with Tailwind CSS.

## Frameworks & Technologies Used

- **Frontend**: React 18, Vite
- **Routing**: React Router DOM v6.30.1
- **Styling**: Tailwind CSS with PostCSS and Autoprefixer
- **Mock Backend**: MirageJS v0.1.45
- **Storage**: LocalForage v1.10.0 for browser persistence
- **Drag & Drop**: @dnd-kit suite (core, sortable, modifiers, utilities)
- **Email Integration**: EmailJS Browser v4.4.1
- **Virtual Scrolling**: React Window with Infinite Loader
- **Development**: Vite with React plugin

## Setup Instructions

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd TalentFlow
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Access the application**
   - Open your browser and navigate to `http://localhost:5173`
   - **Master Password**: `password`

### Production Build

```bash
npm run build
npm run preview
```

## Deployed Version Access

If you're accessing the deployed version, use the master password: **`password`**

---

## Component Tree Structure

```
TalentFlow/
├── src/
│   ├── App.jsx                          # Main application component
│   ├── main.jsx                         # React entry point
│   ├── server.js                        # MirageJS mock server
│   │
│   ├── pages/                           # Page-level components
│   │   ├── login/
│   │   │   └── LoginPage.jsx           # Authentication page
│   │   ├── jobs/
│   │   │   ├── JobsPage.jsx            # Job management page
│   │   │   └── JobDetailsPage.jsx      # Individual job details
│   │   ├── candidates/
│   │   │   ├── CandidatesPage.jsx      # Candidate listing page
│   │   │   └── CandidateProfilePage.jsx # Individual candidate profile
│   │   ├── assessments/
│   │   │   ├── AssessmentsPage.jsx     # Assessment overview
│   │   │   ├── AssessmentBuilderPage.jsx # Assessment creation tool
│   │   │   └── AssessmentRunnerPage.jsx # Assessment taking interface
│   │   └── kanban/
│   │       └── KanbanPage.jsx          # Visual pipeline board
│   │
│   ├── components/                      # Reusable UI components
│   │   ├── auth/
│   │   │   └── HRGate.jsx              # Authentication guard
│   │   ├── jobs/
│   │   │   ├── JobList.jsx             # Job listing with drag & drop
│   │   │   ├── JobModal.jsx            # Job creation/edit modal
│   │   │   └── ArchivedList.jsx        # Archived jobs view
│   │   ├── candidate/
│   │   │   ├── CandidateList.jsx       # Candidate listing with filters
│   │   │   └── CandidateModal.jsx      # Candidate creation/edit modal
│   │   ├── kanban/
│   │   │   └── KanbanBoard.jsx         # Drag & drop board with stages
│   │   └── common/                     # Shared UI components
│   │       ├── Toast.jsx               # Notification system
│   │       ├── ConfirmDialog.jsx       # CoAnfirmation dialogs
│   │       └── buttons/
│   │           ├── PrimaryButton.jsx   # Primary action button
│   │           ├── SecondaryButton.jsx # Secondary action button
│   │           └── LinkButton.jsx      # Link-style button
│   │
│   └── lib/                            # Utility libraries
│       ├── storage.js                  # LocalForage data persistence
│       └── email.js                    # EmailJS integration
```

## Documentation

### 📋 [Mock Server & Storage](#mock-server--storage)
### 💼 [Jobs Management](#jobs-management)
### 👥 [Candidates Management](#candidates-management)
### 📝 [Assessments System](#assessments-system)
### 📊 [Kanban Board](#kanban-board)

---

## Mock Server & Storage

### Overview
The application uses **MirageJS** as a mock server with **LocalForage** for persistent browser storage. This provides a realistic backend experience during development with data that persists across browser sessions.

### Server Implementation (`server.js`)
- **Framework**: MirageJS with network latency simulation (200-1200ms)
- **Failure Simulation**: 8% random failure rate for realistic testing
- **Data Generation**: Automatically generates 25 jobs and 900 candidates on initialization

### API Routes

#### Authentication
- `POST /auth/login` - Master password authentication
- `POST /auth/invite` - Send invitation emails

#### Jobs Management
- `GET /jobs` - List jobs with filtering (search, status, type, tags, pagination)
- `POST /jobs` - Create new job
- `PUT /jobs/:id` - Update job details
- `PATCH /jobs/:id/archive` - Archive/unarchive job
- `POST /jobs/reorder` - Reorder jobs (drag & drop)
- `POST /jobs/bulk-unarchive` - Bulk unarchive operations

#### Candidates Management
- `GET /candidates` - List candidates with filtering and pagination
- `GET /candidates/:id` - Get candidate details
- `POST /candidates` - Create new candidate
- `PUT /candidates/:id` - Update candidate information
- `GET /candidates/:id/timeline` - Get candidate timeline/history
- `POST /candidates/:id/assign` - Assign candidate to job
- `GET /candidates/:id/assignments` - Get candidate assignments

#### Assessments
- `GET /assessments/:jobId` - Get assessment for specific job
- `PUT /assessments/:jobId` - Update assessment configuration
- `POST /assessments/:jobId/submit` - Submit assessment response
- `GET /assessments/:jobId/submissions` - Get assessment submissions

#### Development
- `GET /outbox` - Get email outbox for testing
- `POST /dev/reseed` - Reseed database with fresh data

### Storage System (`storage.js`)
- **Engine**: LocalForage with 'talentflow' database instance
- **Candidate Stages**: Applied, Phone Screen, Onsite, Offer, Hired, Rejected
- **Features**: 
  - Advanced filtering and search capabilities
  - Pagination support
  - Data persistence across browser sessions
  - Optimistic updates with rollback on failure

---

## Jobs Management

### Overview
The Jobs management system allows HR teams to create, edit, archive, and organize job postings with full CRUD operations and advanced filtering.

### Components

#### `JobsPage.jsx`
- **Main Features**:
  - Job listing with pagination (10 jobs per page)
  - Real-time search and filtering
  - View filters: All, Active, Archived, Filled
  - Job type filtering: Full-time, Part-time, Contract
  - Modal-based job creation and editing

#### `JobList.jsx` 
- **Features**:
  - Drag-and-drop reordering of jobs
  - Inline editing capabilities
  - Job type badges with color coding
  - Bulk operations support
  - Loading states and empty state handling

#### `JobModal.jsx`
- **Functionality**:
  - Create new jobs or edit existing ones
  - Form validation with required fields
  - Job type selection (Full-time, Part-time, Contract)
  - Tags management for categorization

### Key Functionality
- **Drag & Drop Reordering**: Uses native HTML5 drag and drop API
- **Optimistic Updates**: UI updates immediately with server sync
- **Error Handling**: Rollback on failed operations with user notifications
- **Search & Filter**: Client-side and server-side filtering options
- **Pagination**: Handles large job lists efficiently

---

## Candidates Management

### Overview
The Candidates system provides comprehensive candidate tracking throughout the hiring pipeline with detailed profile management and stage progression.

### Components

#### `CandidatesPage.jsx`
- **Core Features**:
  - Candidate listing with search and filtering
  - Stage-based filtering (Applied, Phone Screen, Onsite, etc.)
  - Sorting options by stage, name, or date
  - Modal-based candidate creation and editing
  - Duplicate prevention and data integrity

#### `CandidateList.jsx`
- **Features**:
  - Virtual scrolling for large candidate lists
  - Stage-based color coding and badges
  - Quick edit functionality
  - Profile navigation integration
  - Search highlighting

#### `CandidateModal.jsx`
- **Functionality**:
  - Add new candidates with email validation
  - Edit candidate information
  - Job assignment capabilities
  - Stage progression tracking

### Key Features
- **Stage Management**: 6-stage pipeline (Applied → Hired/Rejected)
- **Search & Filter**: Real-time search across name and email
- **Data Integrity**: Duplicate detection and prevention
- **Profile Integration**: Links to detailed candidate profiles
- **Optimistic UI**: Immediate feedback with error rollback

---

## Assessments System

### Overview
The Assessments system provides a comprehensive platform for creating, managing, and running candidate assessments with multiple question types and conditional logic.

### Components

#### `AssessmentsPage.jsx`
- **Features**:
  - Job-based assessment overview
  - Quick access to Assessment Builder
  - Assessment Runner for taking tests
  - Status tracking for each job's assessment

#### `AssessmentBuilderPage.jsx`
- **Advanced Features**:
  - Section-based assessment structure
  - Multiple question types:
    - Single Choice (radio buttons)
    - Multiple Choice (checkboxes) 
    - Short Text (single line input)
    - Long Text (textarea)
    - Numeric (number input with validation)
    - File Upload (document submission)
  - Conditional logic with `showIf` conditions
  - Field validation (required fields, min/max values, character limits)
  - Dynamic section and question management
  - Real-time preview capabilities

#### `AssessmentRunnerPage.jsx`
- **Functionality**:
  - Step-by-step assessment completion
  - Progress tracking and navigation
  - Form validation and error handling
  - Auto-save capabilities
  - Response submission with confirmation

### Question Types & Validation
- **Text Fields**: Character limits, required field validation
- **Numeric**: Min/max value constraints
- **Choice Questions**: Single or multiple selection options
- **File Uploads**: Document submission with type restrictions
- **Conditional Display**: Questions shown based on previous answers

### Assessment Structure
- **Hierarchical Design**: Assessment → Sections → Questions
- **Flexible Configuration**: Dynamic addition/removal of sections and questions
- **Template System**: Pre-built assessment templates for different roles
- **Response Tracking**: Complete submission history and analytics

---

## Kanban Board

### Overview
The Kanban Board provides a visual representation of the candidate pipeline, allowing HR teams to track candidate progress through different hiring stages with intuitive drag-and-drop functionality.

### Components

#### `KanbanPage.jsx`
- **Features**:
  - Full candidate pipeline visualization
  - Real-time candidate updates
  - Optimistic UI updates with error rollback
  - Loading states and data synchronization

#### `KanbanBoard.jsx`
- **Advanced Features**:
  - **Drag & Drop Implementation**: @dnd-kit library integration
  - **Multi-sensor Support**: Mouse, touch, and keyboard navigation
  - **Stage Columns**: 6 distinct hiring stages with color coding
  - **Collision Detection**: Smart drop zone detection
  - **Drag Overlay**: Visual feedback during drag operations
  - **Accessibility**: Full keyboard navigation support

### Stage Management
- **Pipeline Stages**:
  1. **Applied** (Light Yellow) - Initial applications
  2. **Phone Screen** (Light Blue) - First screening call
  3. **Onsite** (Sky Blue) - In-person/video interviews
  4. **Offer** (Mint Green) - Offer extended
  5. **Hired** (Light Green) - Successfully hired
  6. **Rejected** (Light Red) - Not selected

### Technical Implementation
- **@dnd-kit Features**:
  - `DndContext` for drag and drop coordination
  - `SortableContext` for sortable lists within columns
  - `useDroppable` and `useSortable` hooks for interactive elements
  - `restrictToWindowEdges` modifier for boundary constraints
- **Performance**: Memoized components and efficient re-rendering
- **State Management**: Real-time synchronization with backend API
- **Error Handling**: Rollback mechanisms for failed stage transitions

### User Experience
- **Visual Feedback**: Color-coded stages and hover states
- **Smooth Animations**: CSS transforms for drag operations
- **Responsive Design**: Horizontal scrolling on smaller screens
- **Touch Support**: Full mobile device compatibility

---

## Getting Started

After logging in with the master password (`password`), you'll land on the Jobs page where you can begin managing your hiring pipeline. Navigate between different sections using the main navigation to:

1. **Create and manage job postings** in the Jobs section
2. **Add and track candidates** in the Candidates section  
3. **Build custom assessments** in the Assessments section
4. **Visualize your hiring pipeline** in the Kanban board

Each section is designed to work together, providing a seamless hiring workflow from job creation to candidate onboarding.
