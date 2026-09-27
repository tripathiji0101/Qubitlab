import { useState, useEffect, useCallback } from "react";
import {
  universityApi,
  auth,
  type University,
  type Course,
  type UniversityDocument,
  type TutorCitation,
  type UserResponse,
} from "../lib/api";
import { Button, Card, Badge, cx } from "../components/ui";

export default function UniversityPortal() {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [universities, setUniversities] = useState<University[]>([]);
  const [selectedUniv, setSelectedUniv] = useState<University | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [documents, setDocuments] = useState<UniversityDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"documents" | "courses" | "rag" | "institutions">("documents");

  // Document Upload Form state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [docTitle, setDocTitle] = useState("");
  const [contentType, setContentType] = useState("lecture_note");
  const [uploadCourseId, setUploadCourseId] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Document filter state
  const [filterStatus, setFilterStatus] = useState("");

  // New Course Form state
  const [courseCode, setCourseCode] = useState("");
  const [courseTitle, setCourseTitle] = useState("");
  const [courseYear, setCourseYear] = useState("2026-2027");
  const [creatingCourse, setCreatingCourse] = useState(false);

  // New University Form state
  const [showCreateUniv, setShowCreateUniv] = useState(false);
  const [newUnivName, setNewUnivName] = useState("");
  const [newUnivDomain, setNewUnivDomain] = useState("");
  const [newUnivDesc, setNewUnivDesc] = useState("");
  const [creatingUniv, setCreatingUniv] = useState(false);
  const [univCreateError, setUnivCreateError] = useState<string | null>(null);

  // RAG Search Test state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchCourseId, setSearchCourseId] = useState("");
  const [searchingRAG, setSearchingRAG] = useState(false);
  const [citations, setCitations] = useState<TutorCitation[]>([]);

  // Load initial user & universities
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [userData, univList] = await Promise.all([
        auth.me().catch(() => null),
        universityApi.list().catch(() => []),
      ]);
      setUser(userData);
      setUniversities(univList);

      if (userData?.university_id) {
        const myUniv = univList.find((u) => u.id === userData.university_id);
        if (myUniv) {
          setSelectedUniv(myUniv);
        } else {
          const fetched = await universityApi.get(userData.university_id).catch(() => null);
          setSelectedUniv(fetched);
        }
      } else if (univList.length > 0) {
        setSelectedUniv(univList[0]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Load documents and courses when selectedUniv or filterStatus changes
  const loadUnivDetails = useCallback(async () => {
    if (!selectedUniv) return;
    try {
      const [docs, crs] = await Promise.all([
        universityApi.listDocuments(selectedUniv.id, filterStatus || undefined).catch(() => []),
        universityApi.listCourses(selectedUniv.id).catch(() => []),
      ]);
      setDocuments(docs);
      setCourses(crs);
    } catch (e) {
      console.error("Failed to load university documents/courses:", e);
    }
  }, [selectedUniv, filterStatus]);

  useEffect(() => {
    loadUnivDetails();
  }, [loadUnivDetails]);

  // Handle Document Upload
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUniv || !uploadFile || !docTitle.trim()) return;

    setUploading(true);
    setUploadError(null);
    try {
      const formData = new FormData();
      formData.append("file", uploadFile);
      formData.append("title", docTitle.trim());
      formData.append("content_type", contentType);
      if (uploadCourseId) {
        formData.append("course_id", uploadCourseId);
      }

      await universityApi.uploadDocument(selectedUniv.id, formData);
      setUploadFile(null);
      setDocTitle("");
      setUploadCourseId("");
      await loadUnivDetails();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to upload document";
      setUploadError(msg);
    } finally {
      setUploading(false);
    }
  };

  // Handle Retry Ingestion
  const handleRetry = async (docId: string) => {
    try {
      await universityApi.retryDocument(docId);
      await loadUnivDetails();
    } catch (err) {
      console.error("Retry failed", err);
    }
  };

  // Handle Delete Document
  const handleDeleteDoc = async (docId: string) => {
    if (!confirm("Are you sure you want to delete this document and all its vector chunks?")) return;
    try {
      await universityApi.deleteDocument(docId);
      await loadUnivDetails();
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  // Handle Create Course
  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUniv || !courseCode.trim() || !courseTitle.trim()) return;
    setCreatingCourse(true);
    try {
      await universityApi.createCourse(selectedUniv.id, {
        code: courseCode.trim(),
        title: courseTitle.trim(),
        academic_year: courseYear,
      });
      setCourseCode("");
      setCourseTitle("");
      await loadUnivDetails();
    } catch (err) {
      console.error("Course creation failed", err);
    } finally {
      setCreatingCourse(false);
    }
  };

  // Handle Create University
  const handleCreateUniversity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUnivName.trim() || !newUnivDomain.trim()) return;
    setCreatingUniv(true);
    setUnivCreateError(null);
    try {
      const created = await universityApi.create({
        name: newUnivName.trim(),
        domain: newUnivDomain.trim().toLowerCase(),
        description: newUnivDesc.trim() || undefined,
      });
      setNewUnivName("");
      setNewUnivDomain("");
      setNewUnivDesc("");
      setShowCreateUniv(false);
      await loadData();
      setSelectedUniv(created);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create university";
      setUnivCreateError(msg);
    } finally {
      setCreatingUniv(false);
    }
  };

  // Handle RAG Semantic Search Test
  const handleSearchRAG = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUniv || !searchQuery.trim()) return;
    setSearchingRAG(true);
    try {
      const results = await universityApi.searchRAG(
        selectedUniv.id,
        searchQuery.trim(),
        5,
        searchCourseId || undefined
      );
      setCitations(results);
    } catch (err) {
      console.error("RAG search failed", err);
      setCitations([]);
    } finally {
      setSearchingRAG(false);
    }
  };

  // Handle Join University
  const handleJoin = async (univId: string) => {
    try {
      await universityApi.join(univId);
      await loadData();
    } catch (err) {
      console.error("Failed to join university", err);
    }
  };

  const isEnrolled = Boolean(user && user.university_id === selectedUniv?.id);
  const isAdminOrFaculty = Boolean(
    isEnrolled &&
    (user?.role === "instructor" ||
     user?.role === "admin" ||
     user?.university_role === "university_admin" ||
     user?.university_role === "faculty")
  );

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-8 md:px-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-line bg-gradient-to-r from-bg-panel via-bg-surface to-bg-panel p-6 shadow-md md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">🏛️</span>
              <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
                University Knowledge Hub
              </h1>
              {selectedUniv && (
                <Badge tone="cyan" className="ml-2 font-mono text-[11px]">
                  {selectedUniv.name}
                </Badge>
              )}
            </div>
            <p className="text-[13px] text-txt-dim max-w-2xl">
              Upload institutional course materials, lecture notes, lab manuals, and syllabi.
              Our tenant-isolated Adaptive RAG system equips the AI Quantum Tutor with grounded knowledge
              tailored to your university's exact curriculum.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {selectedUniv && !isEnrolled && (
              <Button onClick={() => handleJoin(selectedUniv.id)}>
                Join as Student
              </Button>
            )}
            {isEnrolled && (
              <div className="flex items-center gap-2 rounded-xl bg-ok/10 border border-ok/30 px-3.5 py-1.5 text-xs text-ok font-semibold">
                <span>✓</span> Enrolled Member ({user?.university_role || "student"})
              </div>
            )}
          </div>
        </div>

        {/* Telemetry Stats */}
        {selectedUniv && (
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 pt-6 border-t border-line/50">
            <div className="rounded-xl bg-bg-surface/80 border border-line/60 p-3">
              <div className="text-[11px] font-medium text-txt-faint uppercase tracking-wider">Total Documents</div>
              <div className="text-xl font-bold text-white mt-1">{documents.length}</div>
            </div>
            <div className="rounded-xl bg-bg-surface/80 border border-line/60 p-3">
              <div className="text-[11px] font-medium text-txt-faint uppercase tracking-wider">Indexed & Grounded</div>
              <div className="text-xl font-bold text-ok mt-1">
                {documents.filter((d) => d.processing_status === "indexed").length}
              </div>
            </div>
            <div className="rounded-xl bg-bg-surface/80 border border-line/60 p-3">
              <div className="text-[11px] font-medium text-txt-faint uppercase tracking-wider">Vector Chunks</div>
              <div className="text-xl font-bold text-accent-cyan mt-1">
                {documents.reduce((acc, d) => acc + (d.chunk_count || 0), 0)}
              </div>
            </div>
            <div className="rounded-xl bg-bg-surface/80 border border-line/60 p-3">
              <div className="text-[11px] font-medium text-txt-faint uppercase tracking-wider">Syllabus Courses</div>
              <div className="text-xl font-bold text-accent-primary mt-1">{courses.length}</div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="mt-8 flex gap-2 border-b border-line pb-3">
        <button
          onClick={() => setActiveTab("documents")}
          className={cx(
            "rounded-lg px-4 py-2 text-[13px] font-semibold transition-colors cursor-pointer",
            activeTab === "documents"
              ? "bg-accent-primary text-white shadow-sm"
              : "text-txt-dim hover:text-white hover:bg-bg-panel"
          )}
        >
          📚 Course Documents ({documents.length})
        </button>
        <button
          onClick={() => setActiveTab("courses")}
          className={cx(
            "rounded-lg px-4 py-2 text-[13px] font-semibold transition-colors cursor-pointer",
            activeTab === "courses"
              ? "bg-accent-primary text-white shadow-sm"
              : "text-txt-dim hover:text-white hover:bg-bg-panel"
          )}
        >
          🎓 Syllabus & Courses ({courses.length})
        </button>
        <button
          onClick={() => setActiveTab("rag")}
          className={cx(
            "rounded-lg px-4 py-2 text-[13px] font-semibold transition-colors cursor-pointer",
            activeTab === "rag"
              ? "bg-accent-primary text-white shadow-sm"
              : "text-txt-dim hover:text-white hover:bg-bg-panel"
          )}
        >
          🔍 Semantic RAG Test
        </button>
        <button
          onClick={() => setActiveTab("institutions")}
          className={cx(
            "rounded-lg px-4 py-2 text-[13px] font-semibold transition-colors cursor-pointer",
            activeTab === "institutions"
              ? "bg-accent-primary text-white shadow-sm"
              : "text-txt-dim hover:text-white hover:bg-bg-panel"
          )}
        >
          🏢 All Institutions ({universities.length})
        </button>
      </div>

      {/* TAB 1: DOCUMENTS MANAGEMENT */}
      {activeTab === "documents" && (
        <div className="mt-6 space-y-6">
          {/* Upload Section (Admin/Faculty only) */}
          {isAdminOrFaculty ? (
            <Card className="p-5">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>📤</span> Ingest New University Document
              </h2>
              <p className="text-xs text-txt-faint mt-1">
                Supported formats: PDF, DOCX, TXT, Markdown. Max 25 MB. Text is automatically normalized,
                chunked with overlap, and indexed into the tenant vector space.
              </p>

              <form onSubmit={handleUpload} className="mt-4 grid gap-4 sm:grid-cols-2 md:grid-cols-5">
                <div>
                  <label className="block text-[11px] font-medium text-txt-dim mb-1">Document Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Unit 3 Bell States Lecture Notes"
                    value={docTitle}
                    onChange={(e) => setDocTitle(e.target.value)}
                    className="w-full rounded-lg border border-line bg-bg-panel px-3 py-2 text-xs text-white outline-none focus:border-accent-primary"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-txt-dim mb-1">Course Association</label>
                  <select
                    value={uploadCourseId}
                    onChange={(e) => setUploadCourseId(e.target.value)}
                    className="w-full rounded-lg border border-line bg-bg-panel px-3 py-2 text-xs text-white outline-none focus:border-accent-primary"
                  >
                    <option value="">General / Unassigned</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.code} — {c.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-txt-dim mb-1">Content Type</label>
                  <select
                    value={contentType}
                    onChange={(e) => setContentType(e.target.value)}
                    className="w-full rounded-lg border border-line bg-bg-panel px-3 py-2 text-xs text-white outline-none focus:border-accent-primary"
                  >
                    <option value="lecture_note">Lecture Notes</option>
                    <option value="syllabus">Official Syllabus</option>
                    <option value="lab_manual">Lab Manual / Experiments</option>
                    <option value="assignment">Assignment / Problem Set</option>
                    <option value="textbook">Textbook Chapter</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-txt-dim mb-1">Select File *</label>
                  <input
                    type="file"
                    required
                    accept=".pdf,.docx,.doc,.txt,.md"
                    onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                    className="w-full text-xs text-txt-dim file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-bg-panel file:text-accent-primary hover:file:bg-bg-panel/80 cursor-pointer"
                  />
                </div>

                <div className="flex items-end">
                  <Button type="submit" disabled={uploading || !uploadFile || !docTitle.trim()} className="w-full">
                    {uploading ? "Ingesting..." : "Upload & Index"}
                  </Button>
                </div>
              </form>

              {uploadError && (
                <div className="mt-3 rounded-lg bg-danger/10 border border-danger/30 p-2.5 text-xs text-danger">
                  ⚠️ {uploadError}
                </div>
              )}
            </Card>
          ) : isEnrolled ? (
            <Card className="p-4 bg-bg-panel/40 border-dashed">
              <div className="flex items-center gap-3 text-xs text-txt-dim">
                <span className="text-base">🎓</span>
                <div>
                  <span className="font-semibold text-white">Student Read-Only Access:</span> You can view and search institutional course documents. Only faculty and administrators can upload or delete official syllabus materials.
                </div>
              </div>
            </Card>
          ) : null}

          {/* Filter Bar */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs text-txt-dim">Filter status:</span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="rounded-lg border border-line bg-bg-panel px-2.5 py-1 text-xs text-white outline-none focus:border-accent-primary"
              >
                <option value="">All statuses</option>
                <option value="indexed">Indexed</option>
                <option value="processing">Processing</option>
                <option value="failed">Failed</option>
                <option value="uploaded">Uploaded</option>
              </select>
            </div>
            <span className="text-xs text-txt-faint">{documents.length} documents</span>
          </div>

          {/* Documents Table */}
          <div className="rounded-xl border border-line bg-bg-surface overflow-hidden shadow-sm">
            <div className="border-b border-line px-5 py-3.5 bg-bg-panel/50 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Institutional Document Repository</h3>
              <span className="text-xs text-txt-faint">{documents.length} documents uploaded</span>
            </div>

            {documents.length === 0 ? (
              <div className="p-8 text-center text-xs text-txt-faint">
                No documents uploaded for this university yet.
              </div>
            ) : (
              <div className="divide-y divide-line/60">
                {documents.map((doc) => (
                  <div key={doc.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-bg-panel/30 transition-colors">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white">{doc.title}</span>
                        <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-bg-panel border border-line text-txt-faint">
                          {doc.file_format}
                        </span>
                      </div>
                      <div className="text-xs text-txt-dim flex items-center gap-3">
                        <span>📄 {doc.filename}</span>
                        <span>•</span>
                        <span>{(doc.file_size / 1024).toFixed(1)} KB</span>
                        <span>•</span>
                        <span>{doc.chunk_count || 0} chunks</span>
                      </div>
                      {doc.error_message && (
                        <p className="text-xs text-danger mt-1">Error: {doc.error_message}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      {doc.processing_status === "indexed" && (
                        <Badge tone="ok">✓ Indexed</Badge>
                      )}
                      {doc.processing_status === "processing" && (
                        <Badge tone="warn">⏳ Processing</Badge>
                      )}
                      {doc.processing_status === "failed" && (
                        <Badge tone="danger">❌ Failed</Badge>
                      )}
                      {doc.processing_status === "uploaded" && (
                        <Badge tone="blue">Uploaded</Badge>
                      )}

                      {/* Admin & Faculty controls only */}
                      {isAdminOrFaculty && (
                        <>
                          {doc.processing_status === "failed" && (
                            <Button size="sm" variant="outline" onClick={() => handleRetry(doc.id)}>
                              Retry
                            </Button>
                          )}

                          <Button size="sm" variant="danger" onClick={() => handleDeleteDoc(doc.id)}>
                            Delete
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: COURSES & SYLLABUS */}
      {activeTab === "courses" && (
        <div className="mt-6 space-y-6">
          {isAdminOrFaculty ? (
            <Card className="p-5">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>🎓</span> Add New Course
              </h2>
              <form onSubmit={handleCreateCourse} className="mt-4 grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-[11px] font-medium text-txt-dim mb-1">Course Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. QC-301"
                    value={courseCode}
                    onChange={(e) => setCourseCode(e.target.value)}
                    className="w-full rounded-lg border border-line bg-bg-panel px-3 py-2 text-xs text-white outline-none focus:border-accent-primary"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-txt-dim mb-1">Course Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Quantum Computing & Algorithms"
                    value={courseTitle}
                    onChange={(e) => setCourseTitle(e.target.value)}
                    className="w-full rounded-lg border border-line bg-bg-panel px-3 py-2 text-xs text-white outline-none focus:border-accent-primary"
                  />
                </div>

                <div className="flex items-end">
                  <Button type="submit" disabled={creatingCourse || !courseCode.trim() || !courseTitle.trim()} className="w-full">
                    {creatingCourse ? "Creating..." : "Add Course"}
                  </Button>
                </div>
              </form>
            </Card>
          ) : (
            <Card className="p-4 bg-bg-panel/40 border-dashed">
              <div className="flex items-center gap-3 text-xs text-txt-dim">
                <span className="text-base">ℹ️</span>
                <div>
                  <span className="font-semibold text-white">Course Syllabus:</span> Below are all active courses registered for {selectedUniv?.name || "your institution"}.
                </div>
              </div>
            </Card>
          )}

          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {courses.length === 0 ? (
              <div className="col-span-full p-8 text-center text-xs text-txt-faint border border-line rounded-xl bg-bg-surface">
                No courses added yet.
              </div>
            ) : (
              courses.map((c) => (
                <Card key={c.id} className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-accent-primary">{c.code}</span>
                    <span className="text-[10px] text-txt-faint">{c.academic_year || "2026"}</span>
                  </div>
                  <h4 className="text-sm font-semibold text-white">{c.title}</h4>
                  {c.description && <p className="text-xs text-txt-dim">{c.description}</p>}
                </Card>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 3: SEMANTIC RAG SEARCH TEST */}
      {activeTab === "rag" && (
        <div className="mt-6 space-y-6">
          <Card className="p-5">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>🔍</span> Tenant-Isolated RAG Vector Query
            </h2>
            <p className="text-xs text-txt-faint mt-1">
              Test semantic search across your university's knowledge base.
              This confirms vector embeddings, chunk relevance, and institutional tenant boundaries.
            </p>

            <form onSubmit={handleSearchRAG} className="mt-4 flex flex-col sm:flex-row gap-3">
              <select
                value={searchCourseId}
                onChange={(e) => setSearchCourseId(e.target.value)}
                className="rounded-lg border border-line bg-bg-panel px-3 py-2 text-xs text-white outline-none focus:border-accent-primary"
              >
                <option value="">All Courses</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code}
                  </option>
                ))}
              </select>
              <input
                type="text"
                required
                placeholder="Ask or query: e.g. What does experiment 4 say about Hadamard gates?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 rounded-lg border border-line bg-bg-panel px-3.5 py-2 text-xs text-white outline-none focus:border-accent-primary"
              />
              <Button type="submit" disabled={searchingRAG || !searchQuery.trim()}>
                {searchingRAG ? "Searching..." : "Search RAG"}
              </Button>
            </form>
          </Card>

          {citations.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-white">Retrieved Grounded Chunks ({citations.length})</h3>
              {citations.map((c, idx) => (
                <div key={idx} className="rounded-xl border border-line/60 bg-bg-surface p-4 space-y-2 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-semibold text-white text-xs">
                      <span>📄 {c.document_title}</span>
                      {c.page_number && <span className="text-txt-faint">• Page {c.page_number}</span>}
                      {c.section_title && <span className="text-accent-blue">• {c.section_title}</span>}
                    </div>
                    <span className="font-mono text-[11px] text-ok">
                      Score: {(c.similarity_score * 100).toFixed(1)}%
                    </span>
                  </div>
                  <p className="text-xs text-txt-dim whitespace-pre-wrap leading-relaxed bg-bg-panel/40 p-3 rounded-lg border border-line/40">
                    {c.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: ALL INSTITUTIONS */}
      {activeTab === "institutions" && (
        <div className="mt-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Registered Institutions</h3>
            <Button size="sm" onClick={() => setShowCreateUniv(!showCreateUniv)}>
              {showCreateUniv ? "Cancel" : "+ Register Institution"}
            </Button>
          </div>

          {showCreateUniv && (
            <Card className="p-5 border-accent-primary/40 bg-bg-panel/50">
              <h4 className="text-sm font-bold text-white mb-2">Register a New University</h4>
              <form onSubmit={handleCreateUniversity} className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label className="block text-[11px] font-medium text-txt-dim mb-1">University Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Oxford Quantum Institute"
                    value={newUnivName}
                    onChange={(e) => setNewUnivName(e.target.value)}
                    className="w-full rounded-lg border border-line bg-bg-panel px-3 py-2 text-xs text-white outline-none focus:border-accent-primary"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-txt-dim mb-1">Domain *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. oxford.ac.uk"
                    value={newUnivDomain}
                    onChange={(e) => setNewUnivDomain(e.target.value)}
                    className="w-full rounded-lg border border-line bg-bg-panel px-3 py-2 text-xs text-white outline-none focus:border-accent-primary"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-txt-dim mb-1">Description (optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Department of Quantum Physics"
                    value={newUnivDesc}
                    onChange={(e) => setNewUnivDesc(e.target.value)}
                    className="w-full rounded-lg border border-line bg-bg-panel px-3 py-2 text-xs text-white outline-none focus:border-accent-primary"
                  />
                </div>
                <div className="sm:col-span-3 flex justify-end">
                  <Button type="submit" disabled={creatingUniv || !newUnivName.trim() || !newUnivDomain.trim()}>
                    {creatingUniv ? "Creating..." : "Create Institution"}
                  </Button>
                </div>
              </form>
              {univCreateError && (
                <p className="text-xs text-danger mt-2">{univCreateError}</p>
              )}
            </Card>
          )}

          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {universities.map((u) => (
              <Card key={u.id} className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xl">🏛️</span>
                  {u.id === selectedUniv?.id && <Badge tone="cyan">Active Hub</Badge>}
                </div>
                <div>
                  <h4 className="font-semibold text-white text-sm">{u.name}</h4>
                  <p className="text-xs text-txt-dim font-mono">{u.domain}</p>
                  {u.description && <p className="text-xs text-txt-faint mt-1 line-clamp-2">{u.description}</p>}
                </div>
                <div className="pt-2 flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full text-xs"
                    onClick={() => setSelectedUniv(u)}
                  >
                    View Hub
                  </Button>
                  {user?.university_id !== u.id && (
                    <Button
                      size="sm"
                      className="w-full text-xs"
                      onClick={() => handleJoin(u.id)}
                    >
                      Join
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
