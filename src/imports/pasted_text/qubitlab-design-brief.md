Design and prototype a complete, production-quality web application called:

"QubitLab"
AI-Powered Interactive Quantum Computing Learning Platform

This is a Smart Education platform designed for students, researchers, and professionals to learn quantum computing through interactive theory, quantum circuit construction, simulation, visualization, AI tutoring, coding challenges, and gamified progression.

IMPORTANT:
I am providing an IBM Quantum Composer screenshot as a VISUAL REFERENCE for the Quantum Studio workspace.

Use the screenshot only as inspiration for:
- dense professional IDE-style workspace
- circuit canvas
- quantum gate palette
- code editor
- probability visualization
- statevector visualization
- Q-sphere visualization
- resizable panels
- dark developer-tool aesthetic

DO NOT copy IBM Quantum's branding, logo, exact visual identity, colors, text, or UI 1:1.

Create an original QubitLab design system with a modern quantum-computing aesthetic.

==================================================
1. PRODUCT VISION
==================================================

QubitLab should feel like a combination of:

- modern developer IDE
- interactive education platform
- quantum laboratory
- AI coding assistant
- gamified learning platform

The product should NOT look like a generic educational website.

It should feel technically sophisticated enough for developers and researchers while remaining understandable to a beginner learning quantum computing.

The primary differentiator is:

LEARN → BUILD → SIMULATE → VISUALIZE → ASK AI → SOLVE → GET EVALUATED → LEVEL UP

==================================================
2. PRIMARY USERS
==================================================

Design for three user types:

1. Student
- learning quantum computing
- building circuits
- solving projects
- using AI tutor
- earning XP and badges

2. Advanced learner / researcher
- writing quantum code
- switching between Qiskit, PennyLane and Cirq
- analyzing statevectors
- optimizing circuits
- experimenting with algorithms

3. Instructor
- creating assignments
- monitoring students
- viewing analytics
- identifying difficult concepts
- tracking class performance

==================================================
3. VISUAL DIRECTION
==================================================

Create a premium dark-first interface.

Visual characteristics:

- deep charcoal / near-black background
- subtle blue/purple/cyan quantum accents
- restrained gradients
- glass/soft-panel surfaces where appropriate
- thin borders
- high information density
- excellent spacing
- strong visual hierarchy
- clean typography
- technical but approachable
- subtle glow effects around quantum/AI elements
- avoid excessive neon
- avoid excessive rounded cards
- avoid childish gamification
- avoid generic SaaS styling

The design should feel like a serious developer tool combined with a premium education product.

Typography:
- Use a modern sans-serif for UI
- Use a monospace font for quantum code
- Strong hierarchy between headings, labels, metadata and body text

Use a consistent 8px spacing system.

Create reusable design tokens for:
- colors
- typography
- spacing
- borders
- radii
- shadows
- states
- buttons
- badges

==================================================
4. BRAND
==================================================

Brand name:

QubitLab

Possible tagline:

"Learn. Build. Simulate. Master Quantum."

Logo concept:
Create an original minimal quantum-inspired symbol based on:
- qubit
- orbital
- quantum state
- circuit node

Do not use an obvious generic atom icon.

Brand should work in:
- desktop navigation
- favicon
- login screen
- dashboard
- mobile navigation

==================================================
5. APPLICATION INFORMATION ARCHITECTURE
==================================================

Create these primary routes/screens:

/
Landing Page

/auth/login
Login

/auth/signup
Signup

/dashboard
Student Dashboard

/learn
Learning Path / Project Catalog

/learn/[project]
Project Briefing and Theory

/workspace
Quantum Studio

/challenges
Challenges

/history
Circuit / Project History

/leaderboard
Leaderboard

/profile
Student Profile

/instructor
Instructor Dashboard

/instructor/assignments
Assignment Management

==================================================
6. LANDING PAGE
==================================================

Design a premium landing page.

Hero section:

Headline:
"Learn Quantum Computing by Building It."

Supporting text:
"Master quantum algorithms through interactive circuits, real-time simulation, visual explanations, and an AI-powered quantum tutor."

Primary CTA:
"Start Learning"

Secondary CTA:
"Explore Quantum Studio"

Hero visual:
Show a beautiful miniature representation of the Quantum Studio:
- quantum circuit
- glowing gates
- probability chart
- statevector
- AI assistant panel

Sections:

1. Why QubitLab
2. Interactive Quantum Studio
3. AI Quantum Tutor
4. Learn Through Real-World Projects
5. Quantum Visualization
6. Gamified Progression
7. Instructor Analytics
8. Final CTA

Keep the landing page visually sophisticated and not overly long.

==================================================
7. AUTHENTICATION
==================================================

Create:

Login
Signup
Forgot Password

Login design:
- split-screen or centered premium layout
- quantum visual background
- minimal form
- Google/GitHub login options
- strong security indicators

Signup should ask:
- name
- email
- password
- experience level
- quantum computing experience

Experience:
Beginner
Intermediate
Advanced

==================================================
8. STUDENT DASHBOARD
==================================================

The dashboard is the student's command center.

Top navigation:

QubitLab logo
Learn
Studio
Challenges
Leaderboard

Right:
notifications
profile/avatar

Main dashboard:

Greeting:
"Welcome back, Alex."

Hero progress card:

Current Level:
"Level 2 — Quantum Logic Designer"

XP:
2,450 / 3,000 XP

Progress bar

Current streak:
7 days

Main section:

"Continue Learning"

Show active project:
"Instant Database Verification"
Deutsch-Jozsa Algorithm

Button:
"Continue Mission"

Then:

"Your Quantum Journey"

Five progression levels:

LEVEL 1
Security Analyst
BB84 Quantum Key Distribution

LEVEL 2
Logic Designer
Deutsch-Jozsa Algorithm

LEVEL 3
Data Architect
Grover Search

LEVEL 4
Logistics Engineer
QAOA Optimization

LEVEL 5
Quantum AI Engineer
Quantum Neural Network

Unlocked levels should look active.
Locked levels should clearly communicate progression requirements.

Additional dashboard cards:

- Weekly XP
- Learning streak
- Concepts mastered
- Circuit challenges completed
- Current rank

"Recommended for You"

AI-generated recommendation card:
"You are struggling with phase kickback. Review this 8-minute lesson before attempting the next Grover challenge."

==================================================
9. LEARNING CATALOG
==================================================

Create a `/learn` page.

Title:
"Quantum Learning Path"

Subtitle:
"From your first qubit to quantum AI."

Show the five levels as a visual journey.

Each project card must contain:

- level
- role
- project title
- algorithm
- difficulty
- estimated duration
- XP reward
- completion status
- prerequisites
- progress

Project examples:

LEVEL 1
Security Analyst
Quantum Key Distribution
BB84 Protocol

Mission:
Build a secure communication channel and detect eavesdropping.

LEVEL 2
Logic Designer
Instant Database Verification
Deutsch-Jozsa Algorithm

LEVEL 3
Data Architect
Unstructured Quantum Search
Grover's Algorithm

LEVEL 4
Logistics Engineer
Supply Chain & Route Optimizer
QAOA

LEVEL 5
Quantum AI Engineer
Automotive Customer Classifier
Parameterized Quantum Circuit / QNN

==================================================
10. PROJECT BRIEFING PAGE
==================================================

When a student opens a project, show:

Project title

Role:
Security Analyst

Algorithm:
BB84

Difficulty:
Beginner

XP:
500 XP

Estimated time:
45 minutes

Then a narrative mission briefing.

Example:

"Secure Alice and Bob's communication channel."

Explain the real-world problem.

Sections:

Mission
What You Will Learn
Quantum Concepts
Algorithm Overview
Expected Outcome
Available Gates
Hints
Success Criteria

Primary CTA:
"Enter Quantum Studio"

Secondary:
"Start Theory"

==================================================
11. QUANTUM STUDIO — MOST IMPORTANT SCREEN
==================================================

This is the flagship interface.

Use the provided IBM Quantum Composer screenshot as inspiration for layout density and functionality, but create an ORIGINAL QubitLab interface.

Desktop layout:

--------------------------------------------------
TOP NAVIGATION
--------------------------------------------------

Left:
QubitLab
Project name
File

Center:
Undo
Redo
View
Layout controls

Right:
Save
SDK selector
Run Simulation

Example:

[QubitLab] [Grover Search] [File] [Edit] [View]

                                  [Qiskit ▼]
                                  [Save]
                                  [Run Simulation ▶]

--------------------------------------------------
LEFT SIDEBAR
--------------------------------------------------

Title:
Operations

Search gates

Gate categories:

Single Qubit
H
X
Y
Z
S
T

Rotation
RX
RY
RZ

Multi Qubit
CNOT
CZ
SWAP

Measurement
Measure
Barrier

Each gate should be draggable.

Use compact professional gate buttons.

Show tooltips on hover.

--------------------------------------------------
CENTER CIRCUIT CANVAS
--------------------------------------------------

This is the main workspace.

Display:

q[0] ─────────────────────────
q[1] ─────────────────────────
q[2] ─────────────────────────
q[3] ─────────────────────────

Time/moment columns.

Gates appear as colored blocks.

Example:

q[0] ── H ────────●──────── M
                   │
q[1] ──────────────X──────── M

Provide:

- drag and drop
- gate selection
- move
- delete
- duplicate
- multi-select
- control/target connection
- zoom
- pan
- add/remove qubits
- add/remove classical bits
- measurement
- circuit validation

Show selected gate properties in a small inspector.

--------------------------------------------------
RIGHT CODE EDITOR
--------------------------------------------------

Use an IDE-like code editor.

Header:

Framework:
[Qiskit ▼]

Tabs:

Code
Console

Code should look like real Python.

Example:

from qiskit import QuantumCircuit

qc = QuantumCircuit(2)

qc.h(0)
qc.cx(0, 1)

The visual circuit and code must be conceptually synchronized.

Add:

Copy
Format
Run
Explain with AI

--------------------------------------------------
BOTTOM VISUALIZATION PANEL
--------------------------------------------------

Split into:

1. Probabilities
2. Statevector
3. Q-Sphere / Bloch Sphere

Probability chart:

|00⟩ ███████████████ 50%
|11⟩ ███████████████ 50%

Statevector:

|ψ⟩ = 0.707|00⟩ + 0.707|11⟩

Show amplitude and phase information.

Q-Sphere:
Create a sophisticated 3D visualization concept showing:
- basis states
- amplitude
- phase
- vectors
- labels

Also support Bloch Sphere mode.

Controls:
- State
- Phase
- Amplitude
- Basis labels

--------------------------------------------------
AI COPILOT
--------------------------------------------------

Add a collapsible AI Tutor panel/drawer.

Header:

"Quantum Copilot"

Status:
"Analyzing your circuit..."

Actions:

Explain Circuit
Debug
Optimize
Generate Code
Give Hint
Ask Question

Example conversation:

Student:
"Why isn't my circuit creating entanglement?"

AI:

"Your Hadamard gate creates superposition on q[0], but q[1] is never connected to it. Add a controlled-X gate between q[0] and q[1] to create entanglement."

Show:
[Apply Suggested Fix]

Important:
The AI should appear context-aware and should visually reference the current circuit.

==================================================
12. RUN SIMULATION EXPERIENCE
==================================================

When user clicks "Run Simulation":

Show subtle execution state:

Compiling circuit...
Running Qiskit Aer...
Calculating statevector...
Generating measurements...

Then update:

- probability chart
- statevector
- Bloch/Q-Sphere
- execution metrics

Show a compact result summary:

Execution successful
Qubits: 2
Gates: 4
Depth: 3
Shots: 1024
Execution: 42 ms

Do not imply real quantum hardware unless the platform is actually connected to hardware.

==================================================
13. CHALLENGE SYSTEM
==================================================

Create `/challenges`.

Challenge cards should contain:

Challenge title
Algorithm
Difficulty
XP
Best score
Attempts
Completion

Example:

"Build a Bell State"
Difficulty: Beginner
Reward: 100 XP

"Implement Grover's Oracle"
Difficulty: Intermediate
Reward: 300 XP

"Optimize a QAOA Circuit"
Difficulty: Advanced
Reward: 500 XP

==================================================
14. CHALLENGE WORKFLOW
==================================================

Challenge screen:

Problem statement
Requirements
Allowed gates
Constraints
Hints
Expected output

Then:

"Open in Quantum Studio"

Student submits circuit.

System evaluates:

Circuit validity
Correctness
Measurement result
Circuit depth
Gate count
Efficiency

Then display:

CORRECT ✓

Score:
92/100

Correctness:
100%

Efficiency:
84%

Circuit depth:
8

AI Feedback:
"Your solution produces the correct target state. You can reduce the circuit depth by removing two redundant gates."

==================================================
15. GAMIFICATION
==================================================

Use mature gamification.

XP
Levels
Badges
Streaks
Ranks
Achievements

Avoid cartoonish game UI.

Badges:

First Qubit
Superposition Master
Entanglement Explorer
Grover Solver
QAOA Optimizer
Quantum AI Engineer

Create an elegant badge visual system.

==================================================
16. LEADERBOARD
==================================================

Create `/leaderboard`.

Top:

Global
Institution
Friends

League:

Bronze
Silver
Gold
Quantum Master

Leaderboard table:

Rank
Student
Level
XP
Challenges
Efficiency

Add a student's current position prominently.

Also show:

"Your rank improved by 12 positions this week."

==================================================
17. HISTORY PAGE
==================================================

Create `/history`.

Show:

Recent Circuits
Completed Projects
Challenge Attempts

Each item:

Project
Algorithm
SDK
Score
Date
Circuit depth
Status

Allow:
Open
Duplicate
Continue

==================================================
18. STUDENT PROFILE
==================================================

Create `/profile`.

Show:

Avatar
Name
Quantum level
XP
Current streak

Achievements

Learning statistics:

Projects completed
Challenges completed
Average score
Strongest concepts
Weakest concepts

Quantum skill radar:

Superposition
Entanglement
Quantum Gates
Algorithms
Optimization
Quantum ML

==================================================
19. INSTRUCTOR DASHBOARD
==================================================

Create a completely professional analytics dashboard.

Header:

"Class Overview"

Metrics:

Students
Average Progress
Average Score
Completion Rate
At-Risk Students

Charts:

Learning progress over time
Challenge completion
Concept difficulty
Average circuit depth
Common errors

Student Risk table:

Student
Progress
Failed attempts
Weak concept
Risk
Recommended intervention

Example:

Sarah
68%
12 failed attempts
Entanglement
Medium
Review Bell States

Do NOT make this dashboard look like the student dashboard.

It should feel like an analytics/admin product.

==================================================
20. ASSIGNMENT MANAGEMENT
==================================================

Create:

Create Assignment
Edit Assignment
View Submissions

Instructor can define:

Title
Description
Algorithm
Difficulty
Allowed gates
Number of qubits
Target result
Maximum circuit depth
XP reward
Deadline
Hints

Submission table:

Student
Score
Correctness
Efficiency
Attempts
Status

==================================================
21. RESPONSIVE DESIGN
==================================================

Design desktop first.

Quantum Studio should prioritize desktop/tablet because circuit construction requires screen space.

For mobile:

Do not simply shrink the desktop UI.

Create a mobile-specific layout:

Bottom navigation:
Learn
Studio
Challenges
Progress

For Quantum Studio mobile:
- circuit canvas becomes horizontally scrollable
- sidebars become drawers
- visualizations become tabs
- AI Tutor becomes bottom sheet

==================================================
22. DESIGN SYSTEM / COMPONENT LIBRARY
==================================================

Create reusable components:

Buttons
Inputs
Dropdowns
Tabs
Cards
Badges
Tooltips
Modals
Drawers
Navigation
Progress bars
XP indicators
Avatars
Charts
Circuit gates
Qubit wires
AI messages
Code blocks
Tables
Stat cards
Notifications
Empty states
Loading states
Error states

Create variants:

Default
Hover
Active
Selected
Disabled
Loading
Success
Warning
Error

==================================================
23. IMPORTANT INTERACTION DESIGN
==================================================

Prototype these interactions:

1. Drag H gate onto q[0]

2. Drag CNOT between q[0] and q[1]

3. Select gate

4. Delete gate

5. Open gate inspector

6. Switch Qiskit → PennyLane

7. Click Run Simulation

8. Visualization updates

9. Open AI Copilot

10. Ask AI:
"Explain this circuit"

11. AI highlights relevant gates

12. Click "Give me a hint"

13. Submit challenge

14. Show score

15. Award XP

16. Unlock next level

17. Save circuit

18. Open saved circuit from history

==================================================
24. MICROINTERACTIONS
==================================================

Use subtle animations:

- gate drag
- gate placement
- selected circuit element
- simulation execution
- probability chart updates
- AI typing
- XP increase
- badge unlock
- level unlock

Keep animations fast and professional.

Avoid excessive motion.

==================================================
25. ACCESSIBILITY
==================================================

Design with accessibility in mind:

- sufficient contrast
- keyboard navigation
- visible focus states
- tooltips
- accessible labels
- color should never be the only indicator
- readable font sizes
- screen-reader-friendly controls

==================================================
26. EMPTY / ERROR / LOADING STATES
==================================================

Design all major states.

Empty circuit:

"No gates yet.
Drag a quantum gate onto a qubit wire to begin."

Simulation loading:

"Compiling circuit..."

Simulation error:

"Unable to execute this circuit."

AI loading:

"Analyzing your circuit..."

No history:

"Your quantum journey starts here."

==================================================
27. DESIGN PRINCIPLES
==================================================

Follow these principles:

1. Professional before decorative.
2. Information hierarchy before visual effects.
3. Quantum visualization should have educational value.
4. AI should feel integrated into the workflow, not like a generic chatbot.
5. Gamification should motivate learning, not distract from it.
6. Every screen should have a clear primary action.
7. Maintain consistent spacing and component behavior.
8. Avoid visual clutter even though the Quantum Studio is information-dense.
9. Use progressive disclosure for advanced functionality.
10. The product should look credible to university instructors, quantum researchers and hackathon judges.

==================================================
28. FINAL FIGMA OUTPUT
==================================================

Create:

1. Complete design system
2. Color tokens
3. Typography tokens
4. Component library
5. Landing page
6. Login
7. Signup
8. Student dashboard
9. Learning catalog
10. Project briefing
11. Quantum Studio
12. Challenge page
13. Challenge submission/result
14. History
15. Leaderboard
16. Profile
17. Instructor dashboard
18. Assignment management
19. Responsive mobile versions
20. Interactive prototype connections between major screens

Prioritize the Quantum Studio, Dashboard, Learning Path, Challenge Flow and AI Tutor.

The final result should look like a real product that could be developed immediately by a professional frontend team.

Do not produce a generic template.

Make QubitLab visually distinctive, technically credible, highly polished, and cohesive across every screen.