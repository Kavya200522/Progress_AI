# Build a complete, polished, responsive web application called "ProgressAI"

Build a complete, polished, responsive web application called "ProgressAI".

TAGLINE:

"Turn effort into visible progress."

IMPORTANT PRODUCT IDEA:

ProgressAI is NOT a normal todo list or habit tracker.

The core problem it solves is:

People often start a long-term goal with 100% motivation but lose motivation after a few days because they cannot SEE their progress. ProgressAI converts a user's small daily efforts into visible, measurable progress.

Every user can have a completely different goal and plan. The application must NOT force users into predefined categories or fixed milestones.

The application should work as a flexible personal progress visualization platform.

==================================================

1. TECHNOLOGY

==================================================

Use:

- React

- TypeScript

- Tailwind CSS

- Modern component-based architecture

- Supabase for authentication and PostgreSQL database

- Recharts or another suitable charting library for visualizations

Make the application production-quality, responsive, and easy to understand.

Use a clean modern dashboard design.

Do NOT create unnecessary pages or complicated features.

==================================================

2. BRANDING / DESIGN

==================================================

Application name:

ProgressAI

Tagline:

Turn effort into visible progress.

Design philosophy:

- Modern

- Minimal

- Motivating

- Professional

- Clean

- Not childish

- Not overly colorful

- Strong visual hierarchy

- Dashboard should make progress immediately visible

Use a modern productivity/AI SaaS style.

The most important visual element is PROGRESS.

Use cards, progress bars, timelines, charts and activity heatmaps.

Include light and dark mode if it can be implemented cleanly.

Make the interface fully responsive for desktop, tablet and mobile.

==================================================

3. AUTHENTICATION

==================================================

Implement:

- Sign up

- Login

- Logout

- Protected dashboard

- User profile

Use Supabase authentication.

Each user's goals and progress must belong only to that user.

==================================================

4. MAIN USER FLOW

==================================================

The complete flow should be:

Landing Page

    ↓

Sign Up / Login

    ↓

Dashboard

    ↓

Create Goal

    ↓

Choose:

    A. I already have a plan

    B. Generate a roadmap with AI

    ↓

Create/Edit Roadmap

    ↓

Start Goal

    ↓

Daily Progress Updates

    ↓

Progress Dashboard

    ↓

AI Insights

==================================================

5. LANDING PAGE

==================================================

Create an attractive landing page.

Hero section:

ProgressAI

"Turn effort into visible progress."

Supporting text:

"Set any goal. Track your daily effort. See how far you've come."

Primary button:

"Start Your Goal"

Secondary button:

"See How It Works"

Include a simple visual preview of the progress dashboard.

Explain three core concepts:

1. Create your goal

2. Track your effort

3. See your progress

Add a section explaining AI roadmap generation:

"Don't know how to break your goal into milestones?

Let AI create a personalized roadmap that you can edit."

Include a simple footer.

==================================================

6. DASHBOARD

==================================================

The dashboard is the HEART of the application.

At the top:

"Good morning, [user name]"

Show active goals.

Primary button:

"+ Create New Goal"

Each goal card should show:

- Goal title

- Short description

- Overall completion percentage

- Progress bar

- Current streak

- Days completed

- Days remaining

- Current status:

  Ahead / On Track / Behind

- Last activity

Example:

Learn Machine Learning

68% Complete

████████████████░░░░░░

Day 37 / 60

🔥 8 day streak

Status: Ahead of schedule

Clicking the goal opens its detailed progress page.

If there are no goals:

Show:

"You haven't started a goal yet."

Button:

"Create Your First Goal"

==================================================

7. CREATE GOAL PAGE

==================================================

Create a form:

Goal name

Example: "Learn Machine Learning"

Description

Example: "Learn ML fundamentals and build two projects."

Target duration

Example: 60 days

Start date

Default to today

Target date

Automatically calculate based on duration but allow editing

Daily available time

Example: 60 minutes

Current level:

- Beginner

- Intermediate

- Advanced

Main question:

"Do you already know how you want to achieve this goal?"

Two large choices:

OPTION A:

"I already have a plan"

OPTION B:

"✨ Help me create a plan with AI"

==================================================

8. MANUAL ROADMAP CREATION

==================================================

If the user chooses "I already have a plan":

Allow them to create custom milestones.

Example:

Goal:

Learn Machine Learning

Milestone 1:

Python Fundamentals

Milestone 2:

NumPy & Pandas

Milestone 3:

Data Visualization

Milestone 4:

Machine Learning Fundamentals

Milestone 5:

Machine Learning Algorithms

Milestone 6:

Final Project

Users must be able to:

- Add milestone

- Edit milestone

- Delete milestone

- Reorder milestones

- Add tasks inside each milestone

- Edit tasks

- Delete tasks

- Mark tasks as completed

Do NOT impose predefined milestones.

==================================================

9. AI ROADMAP GENERATION

==================================================

If the user chooses:

"✨ Help me create a plan with AI"

Show a form:

Goal:

Learn Machine Learning

Current level:

Beginner

Available time per day:

1 hour

Target duration:

60 days

Learning preference:

Optional text field

Additional information:

Optional text field

Button:

"Generate My Roadmap"

The AI should generate:

- Milestones

- Tasks under each milestone

- Suggested duration

- Suggested order

- Short explanation for each milestone

Example output:

Milestone 1:

Python Fundamentals

Days 1-10

Tasks:

- Python data types

- Functions

- Loops

- OOP basics

- Practice problems

Milestone 2:

NumPy and Pandas

Days 11-18

etc.

IMPORTANT:

The AI-generated roadmap MUST be editable.

After generation, show:

"Your AI-generated roadmap"

Buttons:

"Edit"

"Regenerate"

"Add Milestone"

"Start Goal"

The user must be able to modify the AI-generated roadmap before starting the goal.

Do not lock the user into the AI's plan.

==================================================

10. AI ROADMAP DATA STRUCTURE

==================================================

AI roadmap generation should return structured JSON rather than plain text.

Use a structure similar to:

{

  "milestones": [

    {

      "title": "Python Fundamentals",

      "description": "...",

      "estimated_days": 10,

      "tasks": [

        {

          "title": "Learn Python data types",

          "estimated_minutes": 60

        }

      ]

    }

  ]

}

Validate the response before saving it.

If an AI API key is not configured, provide a clearly separated mock/demo mode so the rest of the application can still be tested.

Do not expose API keys in frontend code.

==================================================

11. GOAL DETAIL / PROGRESS PAGE

==================================================

When a user opens a goal, show:

Header:

Goal name

Overall progress:

68%

Progress bar

Day 37 / 60

Status:

Ahead of schedule

Then show:

--------------------------------

YOUR JOURNEY

--------------------------------

Create a visual milestone timeline.

Example:

START

  ● Python

  │

  ● NumPy

  │

  ● Visualization

  │

  ● ML Fundamentals

  │

  ○ ML Algorithms

  │

  ○ Final Project

TARGET

Completed milestones should be visually different from incomplete milestones.

Clicking a milestone opens its tasks.

==================================================

12. DAILY PROGRESS UPDATE

==================================================

Make daily updates extremely simple.

Button:

"Update Today's Progress"

Form:

Date

What did you work on?

Allow selecting completed tasks.

Time spent:

minutes/hours

Optional:

"How difficult was today's work?"

- Easy

- Moderate

- Difficult

Optional:

"How are you feeling about your progress?"

- Low

- Okay

- Good

- Very good

Optional notes.

Button:

"Save Progress"

Do not make daily logging complicated.

==================================================

13. AUTOMATIC PROGRESS CALCULATION

==================================================

Calculate progress automatically.

Overall goal progress should be based primarily on completed tasks/milestones, not simply time spent.

Track:

- Total milestones

- Completed milestones

- Total tasks

- Completed tasks

- Overall percentage

- Days elapsed

- Days remaining

- Active days

- Current streak

- Longest streak

- Total time invested

Do not allow users to manually enter their overall percentage.

The system calculates it.

==================================================

14. PROGRESS VISUALIZATION

==================================================

Include these visualizations.

A. Overall progress

Large percentage and progress bar.

B. Expected vs Actual progress

Create a line chart.

X-axis:

Days

Y-axis:

Progress %

Show:

- Expected progress

- Actual progress

C. Activity heatmap

Show daily activity similar conceptually to GitHub contribution graphs.

Intensity should represent activity level.

D. Milestone progress

Show progress for each milestone.

E. Weekly activity

Show time spent or tasks completed per week.

All charts should be responsive.

==================================================

15. "LOOK HOW FAR YOU'VE COME" SECTION

==================================================

This is one of the most important features.

Create a section titled:

"Look how far you've come"

Show:

- Total days worked

- Total time invested

- Tasks completed

- Milestones completed

- Current streak

- Longest streak

- Percentage of goal completed

Example:

"You started this goal 37 days ago."

"You've invested 32 hours and 45 minutes."

"You've completed 41 tasks."

"You've worked on this goal on 29 different days."

This section should emphasize achievement rather than remaining work.

==================================================

16. AI INSIGHTS

==================================================

Create an "AI Insights" section.

Initially, implement the interface and data pipeline cleanly.

Examples of insights:

"You've completed 64% of your roadmap in 37 days."

"Your current pace is faster than your original plan."

"Your activity has decreased during the last 5 days."

"You usually complete more tasks on days when you work for 45-60 minutes."

The system should NOT make up statistics.

Only display insights supported by actual stored user data.

If there is insufficient data, show:

"Keep logging your progress. AI insights will become available as we learn your activity pattern."

==================================================

17. COMPLETION PREDICTION

==================================================

Prepare the application architecture for a future machine learning model.

Do NOT fake an ML prediction.

Create a clearly separated placeholder section:

"Goal Completion Prediction"

Display:

"Not enough data yet"

or

"Prediction will become available after enough progress data has been collected."

Do not generate random percentages.

The future model will use features such as:

- days_active

- tasks_completed

- tasks_missed

- average_daily_time

- current_streak

- progress_percentage

- days_remaining

- recent_activity

- average_weekly_progress

The ML model will eventually predict the probability of completing the goal by the target date.

Keep the architecture ready for a Python/scikit-learn service later.

==================================================

18. ADAPTIVE RE-PLANNING

==================================================

Prepare the UI for a future feature:

"AI Re-plan"

If the user falls behind:

Example:

"You are currently 7 days behind your original roadmap."

Button:

"✨ Create Revised Plan"

The future AI feature should be able to generate a revised roadmap based on:

- Remaining milestones

- Remaining days

- User's recent activity

- Available daily time

For now, create the interface and data structure without pretending this feature is fully implemented.

==================================================

19. DATABASE

==================================================

Use Supabase/PostgreSQL.

Create sensible relational tables.

At minimum:

users

goals

milestones

tasks

daily_progress

daily_task_completion

Suggested relationships:

User

  ↓

Goals

  ↓

Milestones

  ↓

Tasks

Goals

  ↓

Daily Progress

  ↓

Daily Task Completion

Make sure users can only access their own data.

Implement appropriate Row Level Security policies.

==================================================

20. DATA MODEL

==================================================

Goal fields should include:

id

user_id

title

description

start_date

target_date

duration_days

daily_available_minutes

current_level

status

created_at

Milestone fields:

id

goal_id

title

description

order_index

estimated_days

status

created_at

Task fields:

id

milestone_id

title

description

estimated_minutes

order_index

status

created_at

Daily progress fields:

id

goal_id

user_id

date

time_spent_minutes

difficulty

mood

notes

created_at

Daily task completion:

id

daily_progress_id

task_id

completed

==================================================

21. NAVIGATION

==================================================

Use a clean sidebar on desktop.

Navigation:

Dashboard

My Goals

Progress

AI Insights

Settings

On mobile use a responsive navigation system.

==================================================

22. SETTINGS

==================================================

Include:

Profile

Name

Email

Preferences

Theme:

Light / Dark

Default daily reminder preference:

Optional

Account:

Logout

==================================================

23. EMPTY STATES

==================================================

Design good empty states.

Examples:

No goals:

"Your progress journey starts here."

No daily progress:

"You haven't logged today's progress yet."

Not enough AI data:

"Keep going. Your progress history will help us generate meaningful insights."

==================================================

24. ERROR HANDLING

==================================================

Handle:

- Invalid forms

- Empty fields

- Database errors

- AI API errors

- Invalid AI response

- Authentication errors

- Network failures

Show clear user-friendly messages.

Never show raw technical errors to the user.

==================================================

25. IMPORTANT UX RULES

==================================================

The application must feel:

- Fast

- Simple

- Motivating

- Clear

Do not overload the user with forms.

Daily progress update should take less than one minute.

The dashboard should communicate progress within a few seconds.

The application should emphasize:

"How far have I come?"

rather than:

"How much work do I still have?"

==================================================

26. DEMO DATA

==================================================

After authentication, if the user chooses demo mode or if appropriate for development, provide optional sample data for:

Goal:

"Learn Machine Learning"

60-day roadmap

Some completed milestones

Some daily progress

Example current progress around 60-70%

This allows the dashboard and charts to be visually demonstrated.

Clearly distinguish demo/sample data from real user data.

==================================================

27. CODE QUALITY

==================================================

Use reusable components.

Separate:

- UI components

- Pages

- Database operations

- AI service

- Progress calculations

- Chart components

- Utility functions

Do not put the entire application into one huge component.

Use TypeScript types/interfaces for database entities and AI roadmap responses.

Use environment variables for secrets.

Never expose API keys in frontend code.

Add comments only where they help explain non-obvious logic.

==================================================

28. MOST IMPORTANT REQUIREMENT

==================================================

Do NOT build this as a generic todo application.

The identity of ProgressAI is:

"Turn effort into visible progress."

The dashboard and visual progress experience are more important than having hundreds of features.

The user should be able to look at their dashboard and immediately understand:

1. Where I started

2. What I have completed

3. How much effort I have invested

4. How consistent I have been

5. Whether I am ahead or behind

6. How far I have come

7. What I should focus on next

==================================================

29. FINAL RESULT

==================================================

Deliver a complete working MVP with:

- Landing page

- Authentication

- Dashboard

- Goal creation

- Manual roadmap creation

- AI roadmap generation interface

- Editable AI roadmap

- Daily progress tracking

- Automatic progress calculations

- Progress timeline

- Expected vs actual chart

- Activity heatmap

- Milestone tracking

- Streak tracking

- "Look how far you've come" section

- AI Insights interface

- ML prediction placeholder

- AI re-planning interface

- Settings

- Responsive design

- Supabase database integration

- Proper authentication and user data isolation

Prioritize functionality, clean architecture, responsive UI, and the central ProgressAI experience over unnecessary decorative features.

Build the application as a real product, not a static mockup.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://progress1234.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/74d3c302-e4a1-45e5-bed9-91c760c8b340).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
