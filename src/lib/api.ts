/**
 * QubitLab API Client
 *
 * Thin wrapper around fetch with JWT token management,
 * automatic token refresh, and typed request/response helpers.
 */

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

// ── Token storage ──

let accessToken: string | null = typeof localStorage !== "undefined" ? localStorage.getItem("qbl_access") : null;
let refreshToken: string | null = typeof localStorage !== "undefined" ? localStorage.getItem("qbl_refresh") : null;

export function setTokens(access: string, refresh: string) {
  accessToken = access;
  refreshToken = refresh;
  if (typeof localStorage !== "undefined") {
    localStorage.setItem("qbl_access", access);
    localStorage.setItem("qbl_refresh", refresh);
  }
}

export function clearTokens() {
  accessToken = null;
  refreshToken = null;
  if (typeof localStorage !== "undefined") {
    localStorage.removeItem("qbl_access");
    localStorage.removeItem("qbl_refresh");
  }
}

export function getAccessToken(): string | null {
  if (typeof localStorage !== "undefined") {
    const stored = localStorage.getItem("qbl_access");
    if (stored) {
      accessToken = stored;
      return stored;
    }
  }
  return accessToken;
}

export function getRefreshToken(): string | null {
  if (typeof localStorage !== "undefined") {
    const stored = localStorage.getItem("qbl_refresh");
    if (stored) {
      refreshToken = stored;
      return stored;
    }
  }
  return refreshToken;
}

// ── Core fetch ──

async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  retry = true,
): Promise<T> {
  const headers: Record<string, string> = {
    ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
    ...(options.headers as Record<string, string>),
  };

  const token = getAccessToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  // Token expired — try refresh
  const rToken = getRefreshToken();
  if (res.status === 401 && rToken && retry) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      return apiFetch<T>(path, options, false);
    }
    clearTokens();
    window.location.href = "/auth/login";
    throw new ApiError(401, "Session expired");
  }

  if (res.status === 401 && !rToken) {
    clearTokens();
    throw new ApiError(401, "Authentication required");
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({ detail: res.statusText }));
    throw new ApiError(res.status, body.detail || JSON.stringify(body));
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

async function tryRefresh(): Promise<boolean> {
  const rToken = getRefreshToken();
  if (!rToken) return false;
  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: rToken }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    setTokens(data.access_token, data.refresh_token);
    return true;
  } catch {
    return false;
  }
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// ── Auth ──

export const auth = {
  register: (body: { name: string; email: string; password: string; experience_level?: string }) =>
    apiFetch<AuthResponse>("/auth/register", { method: "POST", body: JSON.stringify(body) }),

  login: (body: { email: string; password: string }) =>
    apiFetch<AuthResponse>("/auth/login", { method: "POST", body: JSON.stringify(body) }),

  me: () => apiFetch<UserResponse>("/auth/me"),
};

// ── Simulation ──

export const simulation = {
  run: (body: SimulationRequest) =>
    apiFetch<SimulationResponse>("/simulations/run", { method: "POST", body: JSON.stringify(body) }),
  runCode: (body: CodeExecutionRequest) =>
    apiFetch<CodeExecutionResponse>("/simulations/run-code", { method: "POST", body: JSON.stringify(body) }),
};

// ── Circuits ──

export const circuits = {
  list: () => apiFetch<CircuitResponse[]>("/circuits"),
  get: (id: string) => apiFetch<CircuitResponse>(`/circuits/${id}`),
  create: (body: CircuitCreate) =>
    apiFetch<CircuitResponse>("/circuits", { method: "POST", body: JSON.stringify(body) }),
  update: (id: string, body: CircuitUpdate) =>
    apiFetch<CircuitResponse>(`/circuits/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  delete: (id: string) =>
    apiFetch<void>(`/circuits/${id}`, { method: "DELETE" }),
  generateCode: (body: CodeGenRequest) =>
    apiFetch<CodeGenResponse>("/circuits/generate-code", { method: "POST", body: JSON.stringify(body) }),
};

// ── Learning ──

export const learning = {
  levels: () => apiFetch<LevelResponse[]>("/learning/levels"),
  project: (slug: string) => apiFetch<ProjectDetailResponse>(`/learning/projects/${slug}`),
  startProject: (slug: string) =>
    apiFetch<{ status: string; slug: string }>(`/learning/projects/${slug}/start`, { method: "POST" }),
  completeProject: (slug: string) =>
    apiFetch<{ status: string; slug: string; xp_awarded: number; next_level: string | null }>(
      `/learning/projects/${slug}/complete`,
      { method: "POST" }
    ),
};

// ── Dashboard ──

export const dashboard = {
  get: () => apiFetch<DashboardResponse>("/dashboard"),
};

// ── Challenges ──

export const challenges = {
  list: () => apiFetch<ChallengeListItem[]>("/challenges"),
  get: (id: string) => apiFetch<ChallengeDetailResponse>(`/challenges/${id}`),
  submit: (id: string, body: ChallengeSubmitRequest) =>
    apiFetch<ChallengeSubmitResponse>(`/challenges/${id}/submit`, { method: "POST", body: JSON.stringify(body) }),
};

// ── Progress ──

export const progress = {
  profile: () => apiFetch<ProfileResponse>("/progress"),
  achievements: () => apiFetch<BadgeResponse[]>("/progress/achievements"),
};

// ── Leaderboard ──

export const leaderboard = {
  get: (scope = "global") => apiFetch<LeaderboardResponse>(`/leaderboard?scope=${scope}`),
};

// ── History ──

export const history = {
  list: () => apiFetch<HistoryItem[]>("/history"),
};

// ── AI Tutor ──

export const tutor = {
  chat: (body: TutorChatRequest) =>
    apiFetch<TutorResponse>("/tutor/chat", { method: "POST", body: JSON.stringify(body) }),
  explain: (body: TutorChatRequest) =>
    apiFetch<TutorResponse>("/tutor/explain-circuit", { method: "POST", body: JSON.stringify(body) }),
  debug: (body: TutorChatRequest) =>
    apiFetch<TutorResponse>("/tutor/debug", { method: "POST", body: JSON.stringify(body) }),
  hint: (body: TutorChatRequest) =>
    apiFetch<TutorResponse>("/tutor/hint", { method: "POST", body: JSON.stringify(body) }),
  optimize: (body: TutorChatRequest) =>
    apiFetch<TutorResponse>("/tutor/optimize", { method: "POST", body: JSON.stringify(body) }),
  verify: (body: TutorChatRequest) =>
    apiFetch<TutorResponse>("/tutor/verify", { method: "POST", body: JSON.stringify(body) }),
  whatIf: (body: TutorChatRequest) =>
    apiFetch<TutorResponse>("/tutor/what-if", { method: "POST", body: JSON.stringify(body) }),
};

// ── Instructor ──

export const instructor = {
  dashboard: () => apiFetch<InstructorDashboardResponse>("/instructor/dashboard"),
  assignments: () => apiFetch<AssignmentResponse[]>("/instructor/assignments"),
  createAssignment: (body: AssignmentCreate) =>
    apiFetch<AssignmentResponse>("/instructor/assignments", { method: "POST", body: JSON.stringify(body) }),
  submissions: (id: string) => apiFetch<SubmissionListItem[]>(`/instructor/assignments/${id}/submissions`),
};

// ── Types (mirrors backend Pydantic schemas) ──

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: UserResponse;
}

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar_initials: string;
  experience_level: string;
  xp: number;
  current_level: number;
  streak: number;
  university_id?: string | null;
  university_role?: string | null;
}

export interface SimulationRequest {
  placements: Placement[];
  qubits: number;
  framework: string;
  backend?: string;
  shots?: number;
  return_statevector?: boolean;
}

export interface Placement {
  id: string;
  g: string;
  col: number;
  q: number;
  q2?: number;
  theta?: number;
}

export interface SimulationResponse {
  success: boolean;
  execution: Record<string, unknown>;
  circuit_info: Record<string, unknown>;
  amps: { state: string; re: number; im: number; p: number; phase: number }[];
  probs: { state: string; p: number }[];
  counts: Record<string, number>;
  bloch_spheres: { qubit: number; theta: number; phi: number }[];
  qsphere: { label: string; amp: number; phase: number }[];
  errors: { code: string; message: string }[];
}

export interface CodeExecutionRequest {
  code: string;
  framework: string;
  shots?: number;
  backend?: string;
  return_statevector?: boolean;
}

export interface CodeExecutionError {
  code: string;
  message: string;
  line?: number;
  col?: number;
  snippet?: string;
}

export interface CodeExecutionResponse {
  success: boolean;
  framework: string;
  qubits: number;
  placements: Placement[];
  execution: Record<string, unknown>;
  circuit_info: Record<string, unknown>;
  amps: { state: string; re: number; im: number; p: number; phase: number }[];
  probs: { state: string; p: number }[];
  counts: Record<string, number>;
  bloch_spheres: { qubit: number; theta: number; phi: number }[];
  qsphere: { label: string; amp: number; phase: number }[];
  output: string;
  errors: CodeExecutionError[];
}

export interface CircuitResponse {
  id: string;
  name: string;
  qubits: number;
  classical_bits: number;
  placements: Placement[];
  sdk: string;
  project_slug: string | null;
  version: number;
  created_at: string;
  updated_at: string;
}

export interface CircuitCreate {
  name?: string;
  qubits?: number;
  placements: Placement[];
  sdk?: string;
  project_slug?: string;
}

export interface CircuitUpdate {
  name?: string;
  qubits?: number;
  placements?: Placement[];
  sdk?: string;
}

export interface CodeGenRequest {
  placements: Placement[];
  qubits: number;
  framework: string;
}

export interface CodeGenResponse {
  framework: string;
  language: string;
  code: string;
}

export interface LevelResponse {
  n: number;
  role: string;
  title: string;
  algorithm: string;
  difficulty: string;
  duration: string;
  xp: number;
  status: string;
  progress: number;
  slug: string;
  mission: string;
  concepts: string[];
  gates: string[];
}

export interface LessonItem {
  id: string;
  title: string;
  order: number;
  duration_minutes: number;
  xp_reward: number;
  content: string;
  completed?: boolean;
}

export interface ProjectDetailResponse {
  slug: string;
  level_number?: number;
  title?: string;
  role?: string;
  algorithm?: string;
  difficulty?: string;
  mission?: string;
  concepts?: string[];
  gates?: string[];
  xp?: number;
  duration?: string;
  level?: LevelResponse;
  overview?: string;
  learning_objectives?: string[];
  algorithm_overview?: string;
  expected_outcome?: string;
  hints?: string[];
  success_criteria?: string[];
  lessons?: LessonItem[];
}

export interface DashboardResponse {
  user: Record<string, unknown>;
  current_level: number;
  xp: number;
  xp_to_next_level: number;
  streak: number;
  active_project: Record<string, unknown> | null;
  recommendation: Record<string, unknown> | null;
  weekly_xp: number[];
  stats: Record<string, unknown>;
  levels: LevelResponse[];
}

export interface ChallengeListItem {
  id: string;
  title: string;
  algorithm: string;
  difficulty: string;
  xp: number;
  best: number;
  attempts: number;
  done: boolean;
  tone: string;
  statement: string;
}

export interface ChallengeDetailResponse extends ChallengeListItem {
  qubit_count: number;
  allowed_gates: string[];
  max_depth: number;
  max_gate_count: number;
  requirements: string[];
  hints: string[];
  expected_output_display: string;
}

export interface ChallengeSubmitRequest {
  placements: Placement[];
  qubits: number;
  framework?: string;
}

export interface ChallengeSubmitResponse {
  passed: boolean;
  score: number;
  correctness: number;
  efficiency: number;
  depth: number;
  gate_count: number;
  xp_awarded: number;
  feedback: string;
}

export interface ProfileResponse {
  user: Record<string, unknown>;
  skill_radar: { skill: string; value: number }[];
  badges: BadgeResponse[];
  stats: Record<string, unknown>;
  strongest_concepts: { name: string; value: number }[];
  weakest_concepts: { name: string; value: number }[];
}

export interface BadgeResponse {
  name: string;
  tone: string;
  earned: boolean;
  desc: string;
}

export interface LeaderboardResponse {
  entries: LeaderboardEntry[];
  your_rank: number;
  your_xp: number;
  your_eff: number;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  level: number;
  xp: number;
  challenges: number;
  eff: number;
  you: boolean;
}

export interface HistoryItem {
  project: string;
  algorithm: string;
  sdk: string;
  score: number;
  date: string;
  depth: number;
  status: string;
}

export interface TutorChatRequest {
  question: string;
  placements?: Placement[];
  qubits?: number;
  classical_bits?: number;
  simulation_result?: Record<string, unknown>;
  project_slug?: string;
  challenge_id?: string;
  level?: {
    number: number;
    title: string;
    algorithm: string;
    difficulty: string;
  };
  lesson?: {
    title: string;
    content: string;
  };
  challenge_context?: {
    active: boolean;
    objective: string;
    hints_used: number;
  };
  available_gates?: string[];
  conversation_history?: { role: string; text: string }[];
  mission?: string;
  success_criteria?: string[];
  concepts?: string[];
  selected_gate?: {
    id: string;
    gate: string;
    qubit: number;
    moment: number;
    target?: number;
  };
  student_history?: {
    attempt_count?: number;
    hints_used?: number;
    recent_attempts?: {
      timestamp?: number;
      gate_count?: number;
      gates?: string[];
      met_criteria?: number;
    }[];
  };
  mode?: string;
}

export interface WhatIfProbDiff {
  state: string;
  original: number;
  modified: number;
  delta: number;
}

export interface WhatIfComparison {
  operation: string;
  description: string;
  gate_count: { original: number; modified: number; diff: number };
  depth: { original: number; modified: number; diff: number };
  entanglement: { original: boolean; modified: boolean; summary: string };
  probabilities: WhatIfProbDiff[];
  ascii_diff: { original: string; modified: string };
  lost_criteria?: string[];
  gained_criteria?: string[];
  mission_impact?: string;
}

export interface WhatIfResult {
  valid: boolean;
  description: string;
  operation: string;
  target_gate_id?: string;
  original_placements: Placement[];
  modified_placements: Placement[];
  qubits: number;
  comparison: WhatIfComparison;
}

export interface MissionCriterionResult {
  criterion: string;
  status: "MET" | "UNMET";
  reason: string;
}

export interface MissionProgress {
  met_count: number;
  total_count: number;
  percentage: number;
  criteria: MissionCriterionResult[];
}

export interface CelebrationInfo {
  title: string;
  message: string;
  xp: number;
  criteria_met: string[];
}

export interface TutorResponse {
  response: string;
  sources: Record<string, unknown>[];
  suggestions: string[];
  what_if?: WhatIfResult;
  student_state?: "NOT_STARTED" | "EARLY_ATTEMPT" | "PROGRESSING" | "NEAR_COMPLETION" | "COMPLETED" | "BLOCKED" | "INVALID";
  intent?: string;
  mission_progress?: MissionProgress;
  celebration?: CelebrationInfo;
  suggested_experiment?: string;
}

export interface InstructorDashboardResponse {
  stats: Record<string, unknown>;
  progress_series: Record<string, unknown>[];
  concept_difficulty: Record<string, unknown>[];
  at_risk: Record<string, unknown>[];
}

export interface AssignmentResponse {
  title: string;
  algorithm: string;
  difficulty: string;
  due: string;
  submitted: number;
  total: number;
  status: string;
}

export interface AssignmentCreate {
  title: string;
  description?: string;
  algorithm?: string;
  difficulty?: string;
  qubit_count?: number;
  max_depth?: number;
  target_result?: string;
  xp_reward?: number;
  due_date?: string;
  allowed_gates?: string;
  hints?: string;
}

export interface SubmissionListItem {
  name: string;
  score: number;
  correctness: number;
  efficiency: number;
  attempts: number;
  status: string;
}

// ── Social ──

export const social = {
  search: (q: string) =>
    apiFetch<UserSearchResult[]>(`/social/search?q=${encodeURIComponent(q)}`),

  friends: () => apiFetch<FriendResponse[]>("/social/friends"),

  requests: () => apiFetch<FriendRequestResponse[]>("/social/requests"),

  sendRequest: (addresseeId: string) =>
    apiFetch<FriendRequestResponse>("/social/requests", {
      method: "POST",
      body: JSON.stringify({ addressee_id: addresseeId }),
    }),

  respondRequest: (requestId: string, accept: boolean) =>
    apiFetch<FriendRequestResponse>(`/social/requests/${requestId}`, {
      method: "PUT",
      body: JSON.stringify({ accept }),
    }),

  removeFriend: (friendshipId: string) =>
    apiFetch<void>(`/social/friends/${friendshipId}`, { method: "DELETE" }),

  messages: (friendId: string, limit = 50, offset = 0) =>
    apiFetch<MessageResponse[]>(
      `/social/messages/${friendId}?limit=${limit}&offset=${offset}`,
    ),
};

// ── Rooms ──

export const rooms = {
  create: (name: string) =>
    apiFetch<RoomResponse>("/rooms", {
      method: "POST",
      body: JSON.stringify({ name }),
    }),

  list: () => apiFetch<RoomListItem[]>("/rooms"),

  get: (id: string) => apiFetch<RoomResponse>(`/rooms/${id}`),

  invite: (roomId: string, userId: string) =>
    apiFetch<RoomMemberResponse>(`/rooms/${roomId}/invite`, {
      method: "POST",
      body: JSON.stringify({ user_id: userId }),
    }),

  updateRole: (roomId: string, userId: string, role: "editor" | "viewer") =>
    apiFetch<RoomMemberResponse>(`/rooms/${roomId}/members/${userId}/role`, {
      method: "PUT",
      body: JSON.stringify({ role }),
    }),

  createInvite: (roomId: string, role: "editor" | "viewer" = "viewer", expiresInHours = 168) =>
    apiFetch<RoomInviteResponse>(`/rooms/${roomId}/invites`, {
      method: "POST",
      body: JSON.stringify({ role, expires_in_hours: expiresInHours }),
    }),

  getInvite: (token: string) =>
    apiFetch<RoomInviteInfo>(`/rooms/invites/${token}`),

  joinByInvite: (token: string) =>
    apiFetch<RoomResponse>(`/rooms/invites/${token}/join`, {
      method: "POST",
    }),

  leave: (roomId: string) =>
    apiFetch<void>(`/rooms/${roomId}/leave`, { method: "POST" }),

  close: (roomId: string) =>
    apiFetch<void>(`/rooms/${roomId}`, { method: "DELETE" }),
};

// ── Social Types ──

export interface UserSearchResult {
  id: string;
  name: string;
  avatar_initials: string;
  current_level: number;
  xp: number;
  is_friend: boolean;
  request_pending: boolean;
}

export interface FriendRequestResponse {
  id: string;
  requester: UserSearchResult;
  addressee: UserSearchResult;
  status: string;
  created_at: string;
}

export interface FriendResponse {
  id: string;
  user: UserSearchResult;
  is_online: boolean;
  last_active: string | null;
}

export interface MessageResponse {
  id: string;
  sender_id: string;
  sender_name: string;
  sender_initials: string;
  recipient_id: string | null;
  room_id: string | null;
  content: string;
  read: boolean;
  created_at: string;
}

export interface RoomMemberResponse {
  id: string;
  user_id: string;
  name: string;
  avatar_initials: string;
  role: string;
  is_online: boolean;
}

export interface RoomResponse {
  id: string;
  name: string;
  owner_id: string;
  owner_name: string;
  circuit_revision: number;
  is_active: boolean;
  member_count: number;
  members: RoomMemberResponse[];
  created_at: string;
}

export interface RoomListItem {
  id: string;
  name: string;
  owner_name: string;
  member_count: number;
  is_active: boolean;
  created_at: string;
}

export interface RoomInviteResponse {
  invite_token: string;
  invite_url: string;
  room_id: string;
  room_name: string;
  role: string;
  expires_at: string | null;
}

export interface RoomInviteInfo {
  token: string;
  room_id: string;
  room_name: string;
  owner_name: string;
  inviter_name: string;
  role: string;
  is_active: boolean;
  is_expired: boolean;
  is_member: boolean;
}

// ── Discussions ──

export const discussions = {
  list: (params: {
    scope: "friends" | "university" | "global";
    topic?: string;
    tag?: string;
    search?: string;
    sort?: "newest" | "oldest" | "top" | "most_replies";
    page?: number;
    page_size?: number;
  }) => {
    const qs = new URLSearchParams();
    qs.set("scope", params.scope);
    if (params.topic) qs.set("topic", params.topic);
    if (params.tag) qs.set("tag", params.tag);
    if (params.search) qs.set("search", params.search);
    if (params.sort) qs.set("sort", params.sort);
    if (params.page) qs.set("page", String(params.page));
    if (params.page_size) qs.set("page_size", String(params.page_size));
    return apiFetch<DiscussionListResponse>(`/discussions?${qs.toString()}`);
  },

  get: (id: string) => apiFetch<DiscussionPostResponse>(`/discussions/${id}`),

  create: (body: DiscussionCreateRequest) =>
    apiFetch<DiscussionPostResponse>("/discussions", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  update: (id: string, body: DiscussionUpdateRequest) =>
    apiFetch<DiscussionPostResponse>(`/discussions/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),

  delete: (id: string) =>
    apiFetch<void>(`/discussions/${id}`, { method: "DELETE" }),

  vote: (id: string, value: -1 | 0 | 1) =>
    apiFetch<DiscussionPostResponse>(`/discussions/${id}/vote`, {
      method: "POST",
      body: JSON.stringify({ value }),
    }),
};

// ── Discussion Types ──

export interface DiscussionAuthor {
  id: string;
  name: string;
  avatar_initials: string;
  xp: number;
  current_level: number;
}

export interface DiscussionPostResponse {
  id: string;
  author: DiscussionAuthor;
  scope: string;
  topic: string | null;
  parent_id: string | null;
  title: string | null;
  body: string;
  tag: string;
  upvotes: number;
  downvotes: number;
  score: number;
  reply_count: number;
  view_count: number;
  is_pinned: boolean;
  is_accepted: boolean;
  user_vote: number;
  created_at: string;
  updated_at: string;
  replies: DiscussionPostResponse[];
}

export interface DiscussionListResponse {
  posts: DiscussionPostResponse[];
  total: number;
  page: number;
  page_size: number;
}

export interface DiscussionCreateRequest {
  scope: "friends" | "university" | "global";
  topic?: string;
  parent_id?: string;
  title?: string;
  body: string;
  tag?: string;
}

export interface DiscussionUpdateRequest {
  title?: string;
  body?: string;
  tag?: string;
}

// ── University & Adaptive RAG Types ──

export interface University {
  id: string;
  name: string;
  domain: string;
  description?: string;
  logo?: string;
  status: string;
  created_at?: string;
}

export interface Course {
  id: string;
  university_id: string;
  code: string;
  title: string;
  description?: string;
  academic_year?: string;
}

export interface UniversityDocument {
  id: string;
  university_id: string;
  uploaded_by?: string;
  filename: string;
  title: string;
  subject_id?: string;
  course_id?: string;
  content_type: string;
  file_format: string;
  file_size: number;
  processing_status: "uploaded" | "processing" | "indexed" | "failed" | "archived";
  error_message?: string;
  chunk_count: number;
  created_at?: string;
}

export interface TutorCitation {
  document_id: string;
  document_title: string;
  chunk_index: number;
  page_number?: number;
  section_title?: string;
  content: string;
  similarity_score: number;
}

export interface Subject {
  id: string;
  course_id: string;
  code: string;
  name: string;
  semester: number;
  description?: string;
  created_at?: string;
}

export interface Unit {
  id: string;
  subject_id: string;
  unit_number: number;
  title: string;
  description?: string;
  created_at?: string;
}

export interface Topic {
  id: string;
  unit_id: string;
  title: string;
  description?: string;
  order: number;
  created_at?: string;
}

export const universityApi = {
  list: () => apiFetch<University[]>("/universities"),
  get: (id: string) => apiFetch<University>(`/universities/${id}`),
  create: (body: { name: string; domain: string; description?: string }) =>
    apiFetch<University>("/universities", { method: "POST", body: JSON.stringify(body) }),
  join: (id: string) =>
    apiFetch<{ message: string; role: string }>(`/universities/${id}/join`, { method: "POST" }),
  listCourses: (id: string) =>
    apiFetch<Course[]>(`/universities/${id}/courses`),
  createCourse: (id: string, body: { code: string; title: string; description?: string; academic_year?: string }) =>
    apiFetch<Course>(`/universities/${id}/courses`, { method: "POST", body: JSON.stringify(body) }),
  listSubjects: (univId: string, courseId: string) =>
    apiFetch<Subject[]>(`/universities/${univId}/courses/${courseId}/subjects`),
  createSubject: (univId: string, courseId: string, body: { code: string; name?: string; title?: string; semester: number; description?: string }) =>
    apiFetch<Subject>(`/universities/${univId}/courses/${courseId}/subjects`, { method: "POST", body: JSON.stringify(body) }),
  listUnits: (univId: string, subjectId: string) =>
    apiFetch<Unit[]>(`/universities/${univId}/subjects/${subjectId}/units`),
  createUnit: (univId: string, subjectId: string, body: { unit_number: number; title: string; description?: string }) =>
    apiFetch<Unit>(`/universities/${univId}/subjects/${subjectId}/units`, { method: "POST", body: JSON.stringify(body) }),
  listTopics: (univId: string, unitId: string) =>
    apiFetch<Topic[]>(`/universities/${univId}/units/${unitId}/topics`),
  createTopic: (univId: string, unitId: string, body: { title: string; description?: string; order?: number }) =>
    apiFetch<Topic>(`/universities/${univId}/units/${unitId}/topics`, { method: "POST", body: JSON.stringify(body) }),
  listDocuments: (id: string, status?: string, subjectId?: string, courseId?: string) => {
    const params = new URLSearchParams();
    if (status) params.append("status_filter", status);
    if (subjectId) params.append("subject_id", subjectId);
    if (courseId) params.append("course_id", courseId);
    const qs = params.toString();
    return apiFetch<UniversityDocument[]>(`/universities/${id}/documents${qs ? `?${qs}` : ""}`);
  },
  uploadDocument: (univId: string, formData: FormData) =>
    apiFetch<UniversityDocument>(`/universities/${univId}/documents/upload`, {
      method: "POST",
      body: formData,
    }),
  retryDocument: (docId: string) =>
    apiFetch<UniversityDocument>(`/universities/documents/${docId}/retry`, { method: "POST" }),
  deleteDocument: (docId: string) =>
    apiFetch<{ message: string }>(`/universities/documents/${docId}`, { method: "DELETE" }),
  searchRAG: (univId: string, query: string, limit = 5, courseId?: string, subjectId?: string) =>
    apiFetch<TutorCitation[]>(`/universities/${univId}/rag/search`, {
      method: "POST",
      body: JSON.stringify({ query, limit, course_id: courseId, subject_id: subjectId }),
    }),
};

