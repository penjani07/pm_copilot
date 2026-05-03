import type {
  ActionItem,
  CreatedJiraEpicBundle,
  CreatedJiraIssue,
  CreatedJiraStory,
  EpicDraft,
  JiraSettings,
  MeetingAnalysis,
  StoryDraft,
} from "./types";

type JiraSearchUser = {
  accountId: string;
  active: boolean;
  displayName: string;
};

type JiraIssueResponse = {
  key: string;
};

type JiraIssueType = {
  id?: string;
  issueTypeId?: string;
  name?: string;
};

type JiraIssueTypesResponse = {
  issueTypes?: JiraIssueType[];
  values?: JiraIssueType[];
  results?: JiraIssueType[];
};

type JiraCreateFieldMeta = {
  fieldId?: string;
  key?: string;
  name?: string;
  required?: boolean;
};

type JiraCreateFieldsResponse = {
  fields?: JiraCreateFieldMeta[] | Record<string, JiraCreateFieldMeta>;
  values?: JiraCreateFieldMeta[];
  results?: JiraCreateFieldMeta[];
};

type JiraIssueLinkType = {
  id?: string;
  inward?: string;
  name?: string;
  outward?: string;
};

type JiraIssueLinkTypesResponse = {
  issueLinkTypes?: JiraIssueLinkType[];
};

type JiraAssignee = {
  accountId: string;
  displayName: string;
};

type CreateJiraIssueArgs = {
  actionItem: ActionItem;
  analysis: Pick<MeetingAnalysis, "meetingTitle" | "conciseSummary">;
  settings: JiraSettings;
};

type CreateJiraEpicBundleArgs = {
  epic: EpicDraft;
  analysis: Pick<MeetingAnalysis, "meetingTitle" | "conciseSummary">;
  settings: JiraSettings;
};

type JiraFieldMap = Map<
  string,
  JiraCreateFieldMeta & {
    fieldId: string;
  }
>;

function normalizeSiteUrl(siteUrl: string) {
  return siteUrl.trim().replace(/\/+$/, "");
}

function buildAuthHeader(settings: JiraSettings) {
  const raw = `${settings.email.trim()}:${settings.apiToken.trim()}`;
  return `Basic ${Buffer.from(raw).toString("base64")}`;
}

function paragraph(text: string) {
  return {
    type: "paragraph",
    content: [{ type: "text", text }],
  };
}

function heading(text: string, level: 3 | 4 = 3) {
  return {
    type: "heading",
    attrs: { level },
    content: [{ type: "text", text }],
  };
}

function bulletList(items: string[]) {
  return {
    type: "bulletList",
    content: items.map((item) => ({
      type: "listItem",
      content: [paragraph(item)],
    })),
  };
}

function buildAdfDocument(blocks: object[]) {
  return {
    version: 1,
    type: "doc",
    content: blocks.length ? blocks : [paragraph("No details.")],
  };
}

function labelsFromSettings(defaultLabels: string) {
  return defaultLabels
    .split(",")
    .map((label) => label.trim())
    .filter(Boolean);
}

function buildActionDescription(
  actionItem: ActionItem,
  analysis: Pick<MeetingAnalysis, "meetingTitle" | "conciseSummary">,
) {
  const blocks: object[] = [
    heading("Context"),
    paragraph(`Meeting: ${analysis.meetingTitle}`),
    paragraph(`Meeting summary: ${analysis.conciseSummary}`),
    heading("Work item"),
    paragraph(actionItem.summary),
    paragraph(`Owner: ${actionItem.ownerName}${actionItem.ownerEmail ? ` (${actionItem.ownerEmail})` : ""}`),
    paragraph(`Priority: ${actionItem.priority}`),
    paragraph(`Suggested timeline: ${actionItem.suggestedTimeline}`),
    heading("Why this matters"),
    paragraph(actionItem.rationale),
  ];

  if (actionItem.suggestedDueDate) {
    blocks.splice(5, 0, paragraph(`Suggested due date: ${actionItem.suggestedDueDate}`));
  }

  if (actionItem.blockers.length) {
    blocks.push(heading("Potential blockers"));
    blocks.push(bulletList(actionItem.blockers));
  }

  blocks.push(heading("Implementation notes"));
  blocks.push(paragraph(actionItem.jiraDescription));

  return buildAdfDocument(blocks);
}

function buildEpicDescription(
  epic: EpicDraft,
  analysis: Pick<MeetingAnalysis, "meetingTitle" | "conciseSummary">,
) {
  const blocks: object[] = [
    heading("Meeting context"),
    paragraph(`Meeting: ${analysis.meetingTitle}`),
    paragraph(`Meeting summary: ${analysis.conciseSummary}`),
    heading("Epic objective"),
    paragraph(epic.objective),
    heading("Business value"),
    paragraph(epic.businessValue),
    paragraph(`Priority: ${epic.priority}`),
    paragraph(`Suggested timeline: ${epic.suggestedTimeline}`),
  ];

  if (epic.suggestedDueDate) {
    blocks.push(paragraph(`Suggested due date: ${epic.suggestedDueDate}`));
  }

  if (epic.successMetrics.length) {
    blocks.push(heading("Success metrics"));
    blocks.push(bulletList(epic.successMetrics));
  }

  if (epic.acceptanceCriteria.length) {
    blocks.push(heading("Acceptance criteria"));
    blocks.push(bulletList(epic.acceptanceCriteria));
  }

  blocks.push(heading("Implementation details"));
  blocks.push(paragraph(epic.jiraDescription));

  return buildAdfDocument(blocks);
}

function buildStoryDescription(
  story: StoryDraft,
  epic: EpicDraft,
  analysis: Pick<MeetingAnalysis, "meetingTitle" | "conciseSummary">,
) {
  const blocks: object[] = [
    heading("Meeting context"),
    paragraph(`Meeting: ${analysis.meetingTitle}`),
    paragraph(`Meeting summary: ${analysis.conciseSummary}`),
    heading("Epic"),
    paragraph(epic.title),
    heading("Story details"),
    paragraph(story.summary),
    paragraph(`Owner: ${story.ownerName}${story.ownerEmail ? ` (${story.ownerEmail})` : ""}`),
    paragraph(`Priority: ${story.priority}`),
    paragraph(`Suggested timeline: ${story.suggestedTimeline}`),
    heading("Why this matters"),
    paragraph(story.rationale),
  ];

  if (story.suggestedDueDate) {
    blocks.splice(8, 0, paragraph(`Suggested due date: ${story.suggestedDueDate}`));
  }

  if (story.acceptanceCriteria.length) {
    blocks.push(heading("Acceptance criteria"));
    blocks.push(bulletList(story.acceptanceCriteria));
  }

  if (story.blockers.length) {
    blocks.push(heading("Potential blockers"));
    blocks.push(bulletList(story.blockers));
  }

  blocks.push(heading("Implementation details"));
  blocks.push(paragraph(story.jiraDescription));

  return buildAdfDocument(blocks);
}

async function jiraRequest<T>(url: string, init: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  const text = await response.text();

  let payload: unknown = null;
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = text;
    }
  }

  if (!response.ok) {
    const message =
      typeof payload === "object" &&
      payload !== null &&
      "errorMessages" in payload &&
      Array.isArray(payload.errorMessages)
        ? payload.errorMessages.join(", ")
        : typeof payload === "object" &&
            payload !== null &&
            "errors" in payload &&
            typeof payload.errors === "object" &&
            payload.errors
          ? Object.values(payload.errors as Record<string, string>).join(", ")
          : typeof payload === "string" && payload
            ? payload
            : `${response.status} ${response.statusText}`;

    throw new Error(message);
  }

  return payload as T;
}

async function resolveAssignee(
  siteUrl: string,
  authHeader: string,
  ownerName: string,
  ownerEmail: string | null,
) {
  const query = ownerEmail?.trim() || ownerName.trim();

  if (!query || ownerName === "Unassigned") {
    return null;
  }

  try {
    const users = await jiraRequest<JiraSearchUser[]>(
      `${siteUrl}/rest/api/3/user/search?query=${encodeURIComponent(query)}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: authHeader,
        },
      },
    );

    const match = users.find((user) => user.active) ?? users[0];
    return match
      ? { accountId: match.accountId, displayName: match.displayName }
      : null;
  } catch {
    return null;
  }
}

function normalizeFieldMap(response: JiraCreateFieldsResponse): JiraFieldMap {
  const fieldMap: JiraFieldMap = new Map();

  if (Array.isArray(response.fields)) {
    for (const field of response.fields) {
      const fieldId = field.fieldId || field.key;
      if (fieldId) {
        fieldMap.set(fieldId, { ...field, fieldId });
      }
    }
    return fieldMap;
  }

  if (response.fields && typeof response.fields === "object") {
    for (const [fieldId, field] of Object.entries(response.fields)) {
      fieldMap.set(fieldId, { ...field, fieldId });
    }
    return fieldMap;
  }

  const fallbackFields = response.values ?? response.results ?? [];
  for (const field of fallbackFields) {
    const fieldId = field.fieldId || field.key;
    if (fieldId) {
      fieldMap.set(fieldId, { ...field, fieldId });
    }
  }

  return fieldMap;
}

function findFieldId(fields: JiraFieldMap, candidates: string[]) {
  const normalizedCandidates = candidates.map((candidate) =>
    candidate.trim().toLowerCase(),
  );

  for (const [fieldId, field] of fields.entries()) {
    const name = field.name?.trim().toLowerCase();
    const key = field.key?.trim().toLowerCase();
    const id = field.fieldId.trim().toLowerCase();

    if (
      normalizedCandidates.includes(name || "") ||
      normalizedCandidates.includes(key || "") ||
      normalizedCandidates.includes(id)
    ) {
      return fieldId;
    }
  }

  return null;
}

async function getIssueTypes(
  siteUrl: string,
  authHeader: string,
  projectKey: string,
) {
  const response = await jiraRequest<JiraIssueTypesResponse>(
    `${siteUrl}/rest/api/3/issue/createmeta/${encodeURIComponent(
      projectKey,
    )}/issuetypes`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: authHeader,
      },
    },
  );

  return response.issueTypes ?? response.values ?? response.results ?? [];
}

async function resolveIssueType(
  siteUrl: string,
  authHeader: string,
  projectKey: string,
  issueTypeName: string,
) {
  const issueTypes = await getIssueTypes(siteUrl, authHeader, projectKey);
  const normalizedTarget = issueTypeName.trim().toLowerCase();

  const exact =
    issueTypes.find(
      (issueType) => issueType.name?.trim().toLowerCase() === normalizedTarget,
    ) ?? issueTypes.find((issueType) =>
      issueType.name?.trim().toLowerCase().includes(normalizedTarget),
    );

  const issueTypeId = exact?.id ?? exact?.issueTypeId;

  if (!issueTypeId || !exact?.name) {
    throw new Error(
      `Jira issue type "${issueTypeName}" is not available in project ${projectKey}.`,
    );
  }

  return {
    id: issueTypeId,
    name: exact.name,
  };
}

async function getCreateFields(
  siteUrl: string,
  authHeader: string,
  projectKey: string,
  issueTypeId: string,
) {
  const response = await jiraRequest<JiraCreateFieldsResponse>(
    `${siteUrl}/rest/api/3/issue/createmeta/${encodeURIComponent(
      projectKey,
    )}/issuetypes/${encodeURIComponent(issueTypeId)}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: authHeader,
      },
    },
  );

  return normalizeFieldMap(response);
}

async function getLinkTypeName(siteUrl: string, authHeader: string) {
  try {
    const response = await jiraRequest<JiraIssueLinkTypesResponse>(
      `${siteUrl}/rest/api/3/issueLinkType`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: authHeader,
        },
      },
    );

    const linkTypes = response.issueLinkTypes ?? [];
    const relates =
      linkTypes.find((linkType) => linkType.name === "Relates") ?? linkTypes[0];

    return relates?.name ?? null;
  } catch {
    return null;
  }
}

async function createIssueLink(
  siteUrl: string,
  authHeader: string,
  inwardKey: string,
  outwardKey: string,
) {
  const linkTypeName = await getLinkTypeName(siteUrl, authHeader);

  if (!linkTypeName) {
    return false;
  }

  try {
    await jiraRequest<void>(`${siteUrl}/rest/api/3/issueLink`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify({
        inwardIssue: { key: inwardKey },
        outwardIssue: { key: outwardKey },
        type: { name: linkTypeName },
      }),
    });
    return true;
  } catch {
    return false;
  }
}

async function createIssueRecord(args: {
  siteUrl: string;
  authHeader: string;
  fields: Record<string, unknown>;
  assignee: JiraAssignee | null;
  allowAssignee: boolean;
}) {
  const attemptCreate = async (includeAssignee: boolean) =>
    jiraRequest<JiraIssueResponse>(`${args.siteUrl}/rest/api/3/issue`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: args.authHeader,
      },
      body: JSON.stringify({
        fields:
          includeAssignee && args.assignee && args.allowAssignee
            ? { ...args.fields, assignee: { accountId: args.assignee.accountId } }
            : args.fields,
      }),
    });

  try {
    const created = await attemptCreate(true);
    return {
      issueKey: created.key,
      issueUrl: `${args.siteUrl}/browse/${created.key}`,
      assigneeName: args.assignee?.displayName ?? null,
      note: null,
    } satisfies CreatedJiraIssue;
  } catch (error) {
    if (!args.assignee || !args.allowAssignee) {
      throw error;
    }

    const fallback = await attemptCreate(false);
    return {
      issueKey: fallback.key,
      issueUrl: `${args.siteUrl}/browse/${fallback.key}`,
      assigneeName: null,
      note: "Jira created the issue, but the suggested assignee could not be applied automatically.",
    } satisfies CreatedJiraIssue;
  }
}

function buildCommonFields(args: {
  projectKey: string;
  issueTypeName: string;
  summary: string;
  description: object;
  labels: string[];
  dueDate: string | null;
  fields: JiraFieldMap;
}) {
  const commonFields: Record<string, unknown> = {
    project: { key: args.projectKey },
    summary: args.summary,
    issuetype: { name: args.issueTypeName },
  };

  const descriptionFieldId = findFieldId(args.fields, ["description"]);
  if (descriptionFieldId) {
    commonFields[descriptionFieldId] = args.description;
  }

  const labelsFieldId = findFieldId(args.fields, ["labels"]);
  if (labelsFieldId && args.labels.length) {
    commonFields[labelsFieldId] = args.labels;
  }

  const dueDateFieldId = findFieldId(args.fields, ["duedate", "due date"]);
  if (dueDateFieldId && args.dueDate) {
    commonFields[dueDateFieldId] = args.dueDate;
  }

  return commonFields;
}

function buildEpicFields(args: {
  epic: EpicDraft;
  analysis: Pick<MeetingAnalysis, "meetingTitle" | "conciseSummary">;
  settings: JiraSettings;
  fields: JiraFieldMap;
}) {
  const fieldValues = buildCommonFields({
    projectKey: args.settings.projectKey.trim().toUpperCase(),
    issueTypeName: args.settings.epicIssueType.trim() || "Epic",
    summary: args.epic.jiraSummary.trim() || args.epic.title.trim(),
    description: buildEpicDescription(args.epic, args.analysis),
    labels: labelsFromSettings(args.settings.defaultLabels),
    dueDate: args.epic.suggestedDueDate,
    fields: args.fields,
  });

  const epicNameFieldId = findFieldId(args.fields, ["epic name"]);
  if (epicNameFieldId) {
    fieldValues[epicNameFieldId] = args.epic.title.trim();
  }

  return fieldValues;
}

function buildStoryFields(args: {
  story: StoryDraft;
  epic: EpicDraft;
  epicKey: string;
  analysis: Pick<MeetingAnalysis, "meetingTitle" | "conciseSummary">;
  settings: JiraSettings;
  fields: JiraFieldMap;
}) {
  const fieldValues = buildCommonFields({
    projectKey: args.settings.projectKey.trim().toUpperCase(),
    issueTypeName: args.settings.storyIssueType.trim() || "Story",
    summary: args.story.jiraSummary.trim() || args.story.title.trim(),
    description: buildStoryDescription(args.story, args.epic, args.analysis),
    labels: labelsFromSettings(args.settings.defaultLabels),
    dueDate: args.story.suggestedDueDate,
    fields: args.fields,
  });

  const parentFieldId = findFieldId(args.fields, ["parent"]);
  if (parentFieldId) {
    fieldValues[parentFieldId] = { key: args.epicKey };
    return { fieldValues, relationMode: "parent" as const };
  }

  const epicLinkFieldId = findFieldId(args.fields, ["epic link"]);
  if (epicLinkFieldId) {
    fieldValues[epicLinkFieldId] = args.epicKey;
    return { fieldValues, relationMode: "epic-link" as const };
  }

  return { fieldValues, relationMode: "none" as const };
}

async function createStoryForEpic(args: {
  story: StoryDraft;
  epic: EpicDraft;
  epicKey: string;
  analysis: Pick<MeetingAnalysis, "meetingTitle" | "conciseSummary">;
  settings: JiraSettings;
  siteUrl: string;
  authHeader: string;
  storyFields: JiraFieldMap;
}) {
  const assignee = await resolveAssignee(
    args.siteUrl,
    args.authHeader,
    args.story.ownerName,
    args.story.ownerEmail,
  );

  const assigneeFieldId = findFieldId(args.storyFields, ["assignee"]);
  const { fieldValues, relationMode } = buildStoryFields({
    story: args.story,
    epic: args.epic,
    epicKey: args.epicKey,
    analysis: args.analysis,
    settings: args.settings,
    fields: args.storyFields,
  });

  try {
    const created = await createIssueRecord({
      siteUrl: args.siteUrl,
      authHeader: args.authHeader,
      fields: fieldValues,
      assignee,
      allowAssignee: Boolean(assigneeFieldId),
    });

    return {
      ...created,
      referenceId: args.story.referenceId,
      parentLinked: relationMode !== "none",
    } satisfies CreatedJiraStory;
  } catch (error) {
    if (relationMode === "none") {
      throw error;
    }

    const relationFieldId =
      relationMode === "parent"
        ? findFieldId(args.storyFields, ["parent"])
        : findFieldId(args.storyFields, ["epic link"]);

    const fallbackFields = { ...fieldValues };
    if (relationFieldId) {
      delete fallbackFields[relationFieldId];
    }

    const created = await createIssueRecord({
      siteUrl: args.siteUrl,
      authHeader: args.authHeader,
      fields: fallbackFields,
      assignee,
      allowAssignee: Boolean(assigneeFieldId),
    });

    const linked = await createIssueLink(
      args.siteUrl,
      args.authHeader,
      created.issueKey,
      args.epicKey,
    );

    return {
      ...created,
      referenceId: args.story.referenceId,
      parentLinked: linked,
      note:
        created.note ??
        (linked
          ? "Story was created and linked to the epic with a standard issue link."
          : "Story was created, but Jira did not allow automatic epic parenting."),
    } satisfies CreatedJiraStory;
  }
}

export async function createJiraIssue({
  actionItem,
  analysis,
  settings,
}: CreateJiraIssueArgs): Promise<CreatedJiraIssue> {
  const siteUrl = normalizeSiteUrl(settings.siteUrl);
  const authHeader = buildAuthHeader(settings);
  const assignee = await resolveAssignee(
    siteUrl,
    authHeader,
    actionItem.ownerName,
    actionItem.ownerEmail,
  );

  const issueType = settings.issueType.trim() || "Task";
  const issueTypeInfo = await resolveIssueType(
    siteUrl,
    authHeader,
    settings.projectKey.trim().toUpperCase(),
    issueType,
  );
  const createFields = await getCreateFields(
    siteUrl,
    authHeader,
    settings.projectKey.trim().toUpperCase(),
    issueTypeInfo.id,
  );
  const assigneeFieldId = findFieldId(createFields, ["assignee"]);

  const fields = buildCommonFields({
    projectKey: settings.projectKey.trim().toUpperCase(),
    issueTypeName: issueTypeInfo.name,
    summary: actionItem.jiraSummary.trim() || actionItem.title.trim(),
    description: buildActionDescription(actionItem, analysis),
    labels: labelsFromSettings(settings.defaultLabels),
    dueDate: actionItem.suggestedDueDate,
    fields: createFields,
  });

  return createIssueRecord({
    siteUrl,
    authHeader,
    fields,
    assignee,
    allowAssignee: Boolean(assigneeFieldId),
  });
}

export async function createJiraEpicBundle({
  epic,
  analysis,
  settings,
}: CreateJiraEpicBundleArgs): Promise<CreatedJiraEpicBundle> {
  const siteUrl = normalizeSiteUrl(settings.siteUrl);
  const authHeader = buildAuthHeader(settings);
  const projectKey = settings.projectKey.trim().toUpperCase();
  const epicTypeName = settings.epicIssueType.trim() || "Epic";
  const storyTypeName = settings.storyIssueType.trim() || "Story";

  const epicType = await resolveIssueType(
    siteUrl,
    authHeader,
    projectKey,
    epicTypeName,
  );
  const storyType = await resolveIssueType(
    siteUrl,
    authHeader,
    projectKey,
    storyTypeName,
  );

  const epicFields = await getCreateFields(
    siteUrl,
    authHeader,
    projectKey,
    epicType.id,
  );
  const storyFields = await getCreateFields(
    siteUrl,
    authHeader,
    projectKey,
    storyType.id,
  );

  const epicAssignee = await resolveAssignee(
    siteUrl,
    authHeader,
    epic.ownerName,
    epic.ownerEmail,
  );
  const epicAssigneeFieldId = findFieldId(epicFields, ["assignee"]);
  const epicPayload = buildEpicFields({
    epic,
    analysis,
    settings,
    fields: epicFields,
  });

  const createdEpic = await createIssueRecord({
    siteUrl,
    authHeader,
    fields: epicPayload,
    assignee: epicAssignee,
    allowAssignee: Boolean(epicAssigneeFieldId),
  });

  const createdStories: CreatedJiraStory[] = [];
  for (const story of epic.stories) {
    const createdStory = await createStoryForEpic({
      story,
      epic,
      epicKey: createdEpic.issueKey,
      analysis,
      settings,
      siteUrl,
      authHeader,
      storyFields,
    });
    createdStories.push(createdStory);
  }

  const unlinkedCount = createdStories.filter((story) => !story.parentLinked).length;

  return {
    epic: createdEpic,
    stories: createdStories,
    note:
      unlinkedCount > 0
        ? `${unlinkedCount} story item(s) were created but could not be attached as true epic children in this Jira project configuration.`
        : null,
  };
}
