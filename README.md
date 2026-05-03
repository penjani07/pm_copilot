# Meeting Action Console

A local-first Next.js app that turns meeting notes or transcripts into:

- short agenda-by-agenda summaries for fast review
- action items with owners, priorities, and suggested timelines
- Jira-ready epics and child stories with acceptance criteria
- a concise meeting summary for quick review
- a suggested cadence follow-up meeting with a short agenda and attendee list
- Jira-ready tickets created from the backend when the user clicks a button

## What the app does

1. Paste meeting notes or drop a plain-text transcript file.
2. Or import transcript content directly from Slack, Teams, or Zoom into the editor.
3. The backend calls OpenAI and extracts agenda summaries, structured action items, a cadence meeting suggestion, and a Jira delivery plan.
4. Each action item, epic, and story includes a rough timeline suggestion, and stories include acceptance criteria.
5. If Outlook scheduling settings are filled in, the user can send the suggested follow-up meeting invite directly from the UI.
6. If Jira settings are filled in, the user can create Jira tickets directly from the UI.
7. The Jira plan flow can create an epic and its child stories from the same meeting output.

## Stack

- Next.js 16 App Router
- React 19
- OpenAI Responses API with structured output parsing
- Jira Cloud REST API for ticket creation
- Microsoft Graph calendar API for Outlook invite creation

## Environment setup

Copy `.env.example` to `.env.local` and set:

```bash
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-5-mini
```

`OPENAI_MODEL` is optional. If not set, the app defaults to `gpt-5-mini`.

## Run locally

```bash
npm install
npm run dev -- --port 3000
```

Open `http://localhost:3000`.

## Jira notes

For the prototype, Jira settings are stored in the browser so you can test the flow quickly.

You will need:

- Jira site URL, such as `https://your-org.atlassian.net`
- Jira account email
- Jira API token
- Jira project key
- Epic issue type name, usually `Epic`
- Story issue type name, usually `Story`

The app will try to resolve the assignee from the extracted owner name or email, and it falls back gracefully if Jira rejects the assignee.
For Jira plan creation, the app also attempts to attach stories to the created epic using the Jira fields available in that project configuration.

## Source imports

The app now supports direct text import from:

- Slack conversation history or thread replies
- Microsoft Teams meeting transcripts through Microsoft Graph
- Zoom cloud recording transcripts

For the prototype, these source credentials are also stored locally in the browser.

Typical inputs:

- Slack: bot or user token, channel ID, optional thread timestamp
- Teams: Microsoft Graph bearer token, organizer user ID, meeting ID, optional transcript ID
- Zoom: OAuth access token and meeting ID or UUID

## Outlook follow-up scheduling

For the prototype, Outlook scheduling settings are also stored locally in the browser.

Typical inputs:

- Microsoft Graph bearer token with `Calendars.ReadWrite`
- Optional organizer user ID or calendar ID
- A scheduling window in days
- Preferred start time, meeting duration, and time zone
- Optional extra attendee emails when the transcript does not contain enough email data

The app creates an Outlook calendar event and requests a Teams online meeting link by setting `isOnlineMeeting` during event creation.

## Product assumptions

- Transcript upload supports PDF, TXT, DOC, and DOCX files for meeting minutes or other permitted documents.
- Agenda summaries and cadence-meeting recommendations are AI-generated suggestions for review before sending.
- Timeline suggestions and acceptance criteria are AI-generated planning suggestions, not deterministic schedules.
- Due dates are only filled when the transcript strongly implies a specific date.
