import { useState, useMemo, useRef, useEffect } from "react";

// Rules (templates only):
//   Published  → moderationState must be "Passed"
//   Draft      → moderationState must be "For review"
//   Unpublished → moderationState is "Rejected" (or "Passed" if previously published then unpublished)
// Courses have no moderation state (null).

const INITIAL_DATA = [
  { id: "cl-001", title: "Incident Report - First Response",       sourceContentId: "a1b2c3d4-0001", productId: "p-0001", state: "Published",   publisher: "SafetyCulture", type: "Template", slug: "incident-report-first-response",       downloads: 73353, created: "2021-03-12", moderationState: "Passed"     },
  { id: "cl-002", title: "Weekly Site Safety Inspection",          sourceContentId: "a1b2c3d4-0002", productId: "p-0002", state: "Published",   publisher: "SafetyCulture", type: "Template", slug: "weekly-site-safety-inspection",          downloads: 42783, created: "2021-04-05", moderationState: "Passed"     },
  { id: "cl-003", title: "Safety Walk Checklist",                  sourceContentId: "a1b2c3d4-0003", productId: "p-0003", state: "Published",   publisher: "SafetyCulture", type: "Template", slug: "safety-walk-checklist",                  downloads: 39766, created: "2021-05-18", moderationState: "Passed"     },
  { id: "cl-004", title: "Fire Safety Inspection",                 sourceContentId: "a1b2c3d4-0004", productId: "p-0004", state: "Draft",       publisher: "Community",     type: "Template", slug: "fire-safety-inspection",                 downloads: 31200, created: "2022-01-09", moderationState: "For review" },
  { id: "cl-005", title: "Vehicle Pre-Start Checklist",            sourceContentId: "a1b2c3d4-0005", productId: "p-0005", state: "Published",   publisher: "SafetyCulture", type: "Template", slug: "vehicle-pre-start-checklist",            downloads: 28540, created: "2022-03-22", moderationState: "Passed"     },
  { id: "cl-006", title: "COVID-19 Workplace Screening",           sourceContentId: "a1b2c3d4-0006", productId: "p-0006", state: "Unpublished", publisher: "Community",     type: "Template", slug: "covid-19-workplace-screening",           downloads: 25100, created: "2022-06-14", moderationState: "Rejected"   },
  { id: "cl-007", title: "Forklift Pre-Operational Check",         sourceContentId: "a1b2c3d4-0007", productId: "p-0007", state: "Published",   publisher: "SafetyCulture", type: "Template", slug: "forklift-pre-operational-check",         downloads: 22300, created: "2022-08-30", moderationState: "Passed"     },
  { id: "cl-008", title: "Construction Site Hazard Assessment",    sourceContentId: "a1b2c3d4-0008", productId: "p-0008", state: "Published",   publisher: "SafetyCulture", type: "Course",   slug: "construction-site-hazard-assessment",    downloads: 19800, created: "2022-10-11", moderationState: null         },
  { id: "cl-009", title: "Food Safety Audit",                      sourceContentId: "a1b2c3d4-0009", productId: "p-0009", state: "Draft",       publisher: "Community",     type: "Template", slug: "food-safety-audit",                      downloads: 17650, created: "2023-01-03", moderationState: "For review" },
  { id: "cl-010", title: "PPE Compliance Checklist",               sourceContentId: "a1b2c3d4-0010", productId: "p-0010", state: "Draft",       publisher: "SafetyCulture", type: "Template", slug: "ppe-compliance-checklist",               downloads: 15400, created: "2023-02-28", moderationState: "For review" },
  { id: "cl-011", title: "Electrical Safety Inspection",           sourceContentId: "a1b2c3d4-0011", productId: "p-0011", state: "Published",   publisher: "SafetyCulture", type: "Template", slug: "electrical-safety-inspection",           downloads: 14900, created: "2023-04-17", moderationState: "Passed"     },
  { id: "cl-012", title: "Warehouse Safety Walkthrough",           sourceContentId: "a1b2c3d4-0012", productId: "p-0012", state: "Published",   publisher: "Community",     type: "Course",   slug: "warehouse-safety-walkthrough",           downloads: 13200, created: "2023-05-22", moderationState: null         },
  { id: "cl-013", title: "Manual Handling Risk Assessment",        sourceContentId: "a1b2c3d4-0013", productId: "p-0013", state: "Draft",       publisher: "SafetyCulture", type: "Template", slug: "manual-handling-risk-assessment",        downloads: 11800, created: "2023-07-09", moderationState: "For review" },
  { id: "cl-014", title: "Chemical Storage Compliance",            sourceContentId: "a1b2c3d4-0014", productId: "p-0014", state: "Published",   publisher: "SafetyCulture", type: "Template", slug: "chemical-storage-compliance",            downloads: 10500, created: "2023-09-01", moderationState: "Passed"     },
  { id: "cl-015", title: "Emergency Evacuation Drill",             sourceContentId: "a1b2c3d4-0015", productId: "p-0015", state: "Published",   publisher: "Community",     type: "Course",   slug: "emergency-evacuation-drill",             downloads:  9800, created: "2023-11-14", moderationState: null         },
  { id: "cl-016", title: "Scaffold Inspection Checklist",          sourceContentId: "a1b2c3d4-0016", productId: "p-0016", state: "Draft",       publisher: "SafetyCulture", type: "Template", slug: "scaffold-inspection-checklist",          downloads:  8700, created: "2024-01-20", moderationState: "For review" },
  { id: "cl-017", title: "Noise Exposure Risk Assessment",         sourceContentId: "a1b2c3d4-0017", productId: "p-0017", state: "Unpublished", publisher: "Community",     type: "Template", slug: "noise-exposure-risk-assessment",         downloads:  7600, created: "2024-02-05", moderationState: "Rejected"   },
  { id: "cl-018", title: "Slip, Trip and Fall Prevention",         sourceContentId: "a1b2c3d4-0018", productId: "p-0018", state: "Published",   publisher: "SafetyCulture", type: "Course",   slug: "slip-trip-fall-prevention",             downloads:  6900, created: "2024-03-18", moderationState: null         },
  { id: "cl-019", title: "Working at Heights Permit",              sourceContentId: "a1b2c3d4-0019", productId: "p-0019", state: "Published",   publisher: "SafetyCulture", type: "Template", slug: "working-at-heights-permit",              downloads:  5800, created: "2024-04-30", moderationState: "Passed"     },
  { id: "cl-020", title: "First Aid Kit Inspection",               sourceContentId: "a1b2c3d4-0020", productId: "p-0020", state: "Unpublished", publisher: "Community",     type: "Template", slug: "first-aid-kit-inspection",               downloads:  4400, created: "2024-06-12", moderationState: "Rejected"   },
  { id: "cl-021", title: "Hot Work Permit",                        sourceContentId: "a1b2c3d4-0021", productId: "p-0021", state: "Published",   publisher: "SafetyCulture", type: "Template", slug: "hot-work-permit",                        downloads:  3900, created: "2024-07-25", moderationState: "Passed"     },
  { id: "cl-022", title: "Office Ergonomics Assessment",           sourceContentId: "a1b2c3d4-0022", productId: "p-0022", state: "Draft",       publisher: "Community",     type: "Template", slug: "office-ergonomics-assessment",           downloads:  3200, created: "2024-08-08", moderationState: "For review" },
  { id: "cl-023", title: "Lone Worker Safety Check",               sourceContentId: "a1b2c3d4-0023", productId: "p-0023", state: "Published",   publisher: "SafetyCulture", type: "Course",   slug: "lone-worker-safety-check",               downloads:  2700, created: "2024-09-14", moderationState: null         },
  { id: "cl-024", title: "Contractor Induction Checklist",         sourceContentId: "a1b2c3d4-0024", productId: "p-0024", state: "Published",   publisher: "SafetyCulture", type: "Template", slug: "contractor-induction-checklist",         downloads:  2100, created: "2024-10-02", moderationState: "Passed"     },
  { id: "cl-025", title: "Respiratory Protection Program",         sourceContentId: "a1b2c3d4-0025", productId: "p-0025", state: "Unpublished", publisher: "Community",     type: "Course",   slug: "respiratory-protection-program",         downloads:  1400, created: "2024-11-19", moderationState: null         },
];

const PRODUCT_STATES     = ["all", "Published", "Unpublished", "Draft"];
const MODERATION_STATES  = ["all", "Passed", "Rejected", "For review"];
const PRODUCT_TYPES      = ["All", "Template", "Course"];
const ROWS_PER_PAGE_OPTIONS = [10, 25, 50];

const STATE_COLORS = {
  Published:   { bg: "#e6f4ea", text: "#1e7e34" },
  Unpublished: { bg: "#f0f0f0", text: "#6c757d" },
  Draft:       { bg: "#e8f0fe", text: "#1a73e8" },
};

const MODERATION_COLORS = {
  Passed:       { bg: "#e6f4ea", text: "#1e7e34" },
  Rejected:     { bg: "#fde8e8", text: "#c0392b" },
  "For review": { bg: "#fff3cd", text: "#856404" },
};

function StateChip({ state }) {
  const colors = STATE_COLORS[state] || { bg: "#f0f0f0", text: "#333" };
  return (
    <span style={{ backgroundColor: colors.bg, color: colors.text, padding: "2px 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap" }}>
      {state}
    </span>
  );
}

function ModerationChip({ state }) {
  if (!state) return <span style={{ color: "#ccc", fontSize: 12 }}>—</span>;
  const colors = MODERATION_COLORS[state] || { bg: "#f0f0f0", text: "#333" };
  return (
    <span style={{ backgroundColor: colors.bg, color: colors.text, padding: "2px 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap" }}>
      {state}
    </span>
  );
}

function TypeChip({ type }) {
  const isTemplate = type === "Template";
  return (
    <span style={{ backgroundColor: isTemplate ? "#e8f0fe" : "#fce8f3", color: isTemplate ? "#1a73e8" : "#c2185b", padding: "2px 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap" }}>
      {type}
    </span>
  );
}

function RejectModal({ onSubmit, onClose }) {
  const [reason, setReason] = useState("");
  const textareaRef = useRef(null);

  useEffect(() => { textareaRef.current?.focus(); }, []);

  const handleSubmit = () => {
    if (!reason.trim()) return;
    onSubmit(reason.trim());
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}
      onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: 10, padding: "28px 32px", width: 480, boxShadow: "0 8px 32px rgba(0,0,0,0.2)", position: "relative" }}
        onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 20 }}>🚫</span>
            <span style={{ fontWeight: 700, fontSize: 16, color: "#1a1a2e" }}>Reject template</span>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, color: "#999", cursor: "pointer", lineHeight: 1, padding: 0 }}>×</button>
        </div>

        {/* Body */}
        <p style={{ margin: "0 0 12px", fontSize: 13, color: "#555" }}>
          Please provide a reason for rejection. This will be recorded against the template.
        </p>
        <label style={{ display: "block", fontWeight: 600, fontSize: 12, color: "#444", marginBottom: 6 }}>
          REASON FOR REJECTION <span style={{ color: "#dc3545" }}>*</span>
        </label>
        <textarea
          ref={textareaRef}
          value={reason}
          onChange={e => setReason(e.target.value)}
          placeholder="Describe why this template is being rejected…"
          rows={5}
          style={{
            width: "100%", padding: "10px 12px", border: `1px solid ${reason.trim() === "" ? "#d0d0d0" : "#1a73e8"}`,
            borderRadius: 6, fontSize: 13, resize: "vertical", boxSizing: "border-box",
            fontFamily: "inherit", outline: "none", color: "#1a1a2e", lineHeight: 1.5,
          }}
        />
        {reason.trim() === "" && (
          <p style={{ margin: "4px 0 0", fontSize: 11.5, color: "#dc3545" }}>A reason is required before submitting.</p>
        )}

        {/* Footer */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
          <button onClick={onClose}
            style={{ padding: "8px 20px", background: "#fff", border: "1px solid #d0d0d0", borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: "pointer", color: "#555" }}>
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={!reason.trim()}
            style={{
              padding: "8px 20px", background: reason.trim() ? "#dc3545" : "#f5a5ae", color: "#fff",
              border: "none", borderRadius: 6, fontSize: 13, fontWeight: 700,
              cursor: reason.trim() ? "pointer" : "not-allowed", transition: "background 0.15s",
            }}>
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}

const EMPTY_FILTERS = { productState: "all", moderationState: "all", productType: "All", title: "", sourceContentId: "", orgId: "", slug: "", publisherName: "" };

export default function ContentLibrarySearch() {
  const [data, setData]                 = useState(INITIAL_DATA);
  const [filters, setFilters]           = useState({ ...EMPTY_FILTERS });
  const [activeFilters, setActiveFilters] = useState({ ...EMPTY_FILTERS });
  const [page, setPage]                 = useState(1);
  const [rowsPerPage, setRowsPerPage]   = useState(25);
  const [sortCol, setSortCol]           = useState("downloads");
  const [sortDir, setSortDir]           = useState("desc");
  const [selected, setSelected]         = useState(new Set());
  const [openMenu, setOpenMenu]         = useState(null);
  const [rejectModal, setRejectModal]   = useState({ open: false, itemId: null });

  const filtered = useMemo(() => {
    let rows = [...data];
    if (activeFilters.productState !== "all")
      rows = rows.filter(d => d.state === activeFilters.productState);
    if (activeFilters.moderationState !== "all")
      rows = rows.filter(d => d.moderationState === activeFilters.moderationState);
    if (activeFilters.productType !== "All")
      rows = rows.filter(d => d.type === activeFilters.productType);
    if (activeFilters.title)
      rows = rows.filter(d => d.title.toLowerCase().includes(activeFilters.title.toLowerCase()));
    if (activeFilters.sourceContentId)
      rows = rows.filter(d => d.sourceContentId.includes(activeFilters.sourceContentId));
    if (activeFilters.slug)
      rows = rows.filter(d => d.slug.includes(activeFilters.slug.toLowerCase()));
    if (activeFilters.publisherName)
      rows = rows.filter(d => d.publisher.toLowerCase().includes(activeFilters.publisherName.toLowerCase()));

    rows.sort((a, b) => {
      let va = a[sortCol] ?? "", vb = b[sortCol] ?? "";
      if (typeof va === "string") { va = va.toLowerCase(); vb = vb.toLowerCase(); }
      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return rows;
  }, [data, activeFilters, sortCol, sortDir]);

  // Count of templates currently awaiting moderation review (independent of filters)
  const forReviewCount = useMemo(
    () => data.filter(d => d.type === "Template" && d.moderationState === "For review").length,
    [data]
  );

  const totalPages = Math.ceil(filtered.length / rowsPerPage);
  const pageData   = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const handleSearch = () => { setActiveFilters({ ...filters }); setPage(1); setSelected(new Set()); };

  const handleClear = () => {
    setFilters({ ...EMPTY_FILTERS });
    setActiveFilters({ ...EMPTY_FILTERS });
    setPage(1);
    setSelected(new Set());
  };

  const handleApprove = (id) => {
    setData(prev => prev.map(item => item.id === id ? { ...item, state: "Published", moderationState: "Passed" } : item));
    setOpenMenu(null);
  };

  const handleRejectSubmit = (reason) => {
    setData(prev => prev.map(item => item.id === rejectModal.itemId ? { ...item, moderationState: "Rejected" } : item));
    setRejectModal({ open: false, itemId: null });
    setOpenMenu(null);
  };

  const handleForReviewClick = () => {
    const updated = { ...EMPTY_FILTERS, moderationState: "For review", productType: "Template" };
    setFilters(updated);
    setActiveFilters(updated);
    setPage(1);
    setSelected(new Set());
  };

  const handleSort = (col) => {
    if (sortCol === col) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortCol(col); setSortDir("asc"); }
  };

  const toggleSelect = (id) => setSelected(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const toggleAll = () => {
    if (selected.size === pageData.length) setSelected(new Set());
    else setSelected(new Set(pageData.map(d => d.id)));
  };

  const COLS = [
    { key: "title",            label: "Title",              sortable: true  },
    { key: "sourceContentId",  label: "Source Content ID",  sortable: false },
    { key: "productId",        label: "Product ID",         sortable: false },
    { key: "state",            label: "Product State",      sortable: true  },
    { key: "moderationState",  label: "Moderation State",   sortable: true  },
    { key: "publisher",        label: "Publisher Name",     sortable: true  },
    { key: "type",             label: "Content Type",       sortable: true  },
    { key: "slug",             label: "Slug",               sortable: false },
    { key: "downloads",        label: "Downloads",          sortable: true  },
    { key: "created",          label: "Created",            sortable: true  },
    { key: "action",           label: "Action",             sortable: false },
  ];

  const getMenuActions = (row) => {
    if (row.type === "Template" && row.moderationState === "For review")
      return [
        { label: "Approve and Publish", danger: false, onClick: () => handleApprove(row.id) },
        { label: "Reject", danger: true,  onClick: () => { setRejectModal({ open: true, itemId: row.id }); setOpenMenu(null); } },
      ];
    if (row.state === "Published")
      return [
        { label: "View public listing", danger: false, onClick: () => setOpenMenu(null) },
        { label: "Unpublish",           danger: true,  onClick: () => setOpenMenu(null) },
      ];
    if (row.state === "Unpublished")
      return [
        { label: "Publish", danger: false, onClick: () => setOpenMenu(null) },
      ];
    return [];
  };

  return (
    <>
    {rejectModal.open && (
      <RejectModal
        onSubmit={handleRejectSubmit}
        onClose={() => setRejectModal({ open: false, itemId: null })}
      />
    )}
    <div style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif", fontSize: 13, color: "#1a1a2e", minHeight: "100vh", background: "#f4f6f9" }}
      onClick={() => setOpenMenu(null)}>

      {/* Top Nav */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e0e0e0", padding: "0 24px", display: "flex", alignItems: "center", height: 52, gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginRight: 24 }}>
          <div style={{ width: 28, height: 28, background: "#009f6b", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#fff", fontWeight: 900, fontSize: 14 }}>SC</span>
          </div>
          <span style={{ fontWeight: 700, fontSize: 14, color: "#222" }}>Periscope</span>
        </div>
        {["Users", "Identity", "Organization", "Document", "Templates", "GRS", "Public Library", "Content Library", "Sensors", "Media"].map(tab => (
          <button key={tab} style={{
            padding: "0 14px", height: 52, border: "none", background: "none", cursor: "pointer", fontSize: 13,
            fontWeight: tab === "Content Library" ? 700 : 400,
            color: tab === "Content Library" ? "#009f6b" : "#555",
            borderBottom: tab === "Content Library" ? "2px solid #009f6b" : "2px solid transparent",
          }}>{tab}</button>
        ))}
        <div style={{ flex: 1 }} />
        <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#009f6b", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>S</div>
      </div>

      <div style={{ padding: 24, maxWidth: 1400, margin: "0 auto" }}>

        {/* Filter Card */}
        <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #e0e0e0", padding: "20px 24px", marginBottom: 20 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "14px 20px" }}>

            <div>
              <label style={{ display: "block", fontWeight: 600, fontSize: 12, color: "#555", marginBottom: 5 }}>PRODUCT STATE</label>
              <select value={filters.productState} onChange={e => setFilters(f => ({ ...f, productState: e.target.value }))}
                style={{ width: "100%", padding: "8px 10px", border: "1px solid #d0d0d0", borderRadius: 6, fontSize: 13, background: "#fff" }}>
                {PRODUCT_STATES.map(s => <option key={s} value={s}>{s === "all" ? "All states" : s}</option>)}
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontWeight: 600, fontSize: 12, color: "#555", marginBottom: 5 }}>MODERATION STATE</label>
              <select value={filters.moderationState} onChange={e => setFilters(f => ({ ...f, moderationState: e.target.value }))}
                style={{ width: "100%", padding: "8px 10px", border: "1px solid #d0d0d0", borderRadius: 6, fontSize: 13, background: "#fff" }}>
                {MODERATION_STATES.map(s => <option key={s} value={s}>{s === "all" ? "All moderation states" : s}</option>)}
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontWeight: 600, fontSize: 12, color: "#555", marginBottom: 5 }}>PRODUCT TYPE</label>
              <select value={filters.productType} onChange={e => setFilters(f => ({ ...f, productType: e.target.value }))}
                style={{ width: "100%", padding: "8px 10px", border: "1px solid #d0d0d0", borderRadius: 6, fontSize: 13, background: "#fff" }}>
                {PRODUCT_TYPES.map(t => <option key={t} value={t}>{t === "All" ? "All types" : t}</option>)}
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontWeight: 600, fontSize: 12, color: "#555", marginBottom: 5 }}>TITLE</label>
              <input value={filters.title} onChange={e => setFilters(f => ({ ...f, title: e.target.value }))}
                onKeyDown={e => e.key === "Enter" && handleSearch()}
                placeholder="Search by title…"
                style={{ width: "100%", padding: "8px 10px", border: "1px solid #d0d0d0", borderRadius: 6, fontSize: 13, boxSizing: "border-box" }} />
            </div>

            <div>
              <label style={{ display: "block", fontWeight: 600, fontSize: 12, color: "#555", marginBottom: 5 }}>SOURCE CONTENT ID</label>
              <input value={filters.sourceContentId} onChange={e => setFilters(f => ({ ...f, sourceContentId: e.target.value }))}
                onKeyDown={e => e.key === "Enter" && handleSearch()}
                placeholder="e.g. a1b2c3d4-0001"
                style={{ width: "100%", padding: "8px 10px", border: "1px solid #d0d0d0", borderRadius: 6, fontSize: 13, boxSizing: "border-box" }} />
            </div>

            <div>
              <label style={{ display: "block", fontWeight: 600, fontSize: 12, color: "#555", marginBottom: 5 }}>ORG ID</label>
              <input value={filters.orgId} onChange={e => setFilters(f => ({ ...f, orgId: e.target.value }))}
                onKeyDown={e => e.key === "Enter" && handleSearch()}
                placeholder="Organisation ID"
                style={{ width: "100%", padding: "8px 10px", border: "1px solid #d0d0d0", borderRadius: 6, fontSize: 13, boxSizing: "border-box" }} />
            </div>

            <div>
              <label style={{ display: "block", fontWeight: 600, fontSize: 12, color: "#555", marginBottom: 5 }}>SLUG</label>
              <input value={filters.slug} onChange={e => setFilters(f => ({ ...f, slug: e.target.value }))}
                onKeyDown={e => e.key === "Enter" && handleSearch()}
                placeholder="e.g. safety-walk-checklist"
                style={{ width: "100%", padding: "8px 10px", border: "1px solid #d0d0d0", borderRadius: 6, fontSize: 13, boxSizing: "border-box" }} />
            </div>

            <div>
              <label style={{ display: "block", fontWeight: 600, fontSize: 12, color: "#555", marginBottom: 5 }}>PUBLISHER NAME</label>
              <input value={filters.publisherName} onChange={e => setFilters(f => ({ ...f, publisherName: e.target.value }))}
                onKeyDown={e => e.key === "Enter" && handleSearch()}
                placeholder="e.g. SafetyCulture"
                style={{ width: "100%", padding: "8px 10px", border: "1px solid #d0d0d0", borderRadius: 6, fontSize: 13, boxSizing: "border-box" }} />
            </div>

            <div style={{ display: "flex", alignItems: "flex-end", gap: 10 }}>
              <button onClick={handleSearch} style={{ flex: 1, padding: "8px 0", background: "#1a73e8", color: "#fff", border: "none", borderRadius: 6, fontWeight: 700, fontSize: 13, cursor: "pointer", letterSpacing: 0.5 }}>
                SEARCH
              </button>
              <button onClick={handleClear} style={{ flex: 1, padding: "8px 0", background: "#dc3545", color: "#fff", border: "none", borderRadius: 6, fontWeight: 700, fontSize: 13, cursor: "pointer", letterSpacing: 0.5 }}>
                CLEAR
              </button>
            </div>

          </div>
        </div>

        {/* For Review Banner */}
        {forReviewCount > 0 && (
          <div style={{ background: "#fff8e1", border: "1px solid #ffe082", borderRadius: 8, padding: "12px 18px", marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 18 }}>⚠️</span>
              <span style={{ color: "#7a5c00", fontWeight: 500, fontSize: 13 }}>
                <strong>{forReviewCount}</strong> template{forReviewCount !== 1 ? "s are" : " is"} requiring moderator review.
              </span>
            </div>
            <button
              onClick={handleForReviewClick}
              style={{ background: "#f59e0b", color: "#fff", border: "none", borderRadius: 6, padding: "7px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}
              onMouseEnter={e => e.currentTarget.style.background = "#d97706"}
              onMouseLeave={e => e.currentTarget.style.background = "#f59e0b"}>
              Click to view
            </button>
          </div>
        )}

        {/* Table Card */}
        <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #e0e0e0" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid #e0e0e0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontWeight: 700, fontSize: 15 }}>
              Content Items <span style={{ color: "#777", fontWeight: 400 }}>({filtered.length.toLocaleString()})</span>
            </span>
            <button style={{ padding: "7px 16px", background: "#fff", border: "1px solid #d0d0d0", borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: "pointer", color: "#333" }}>
              ⬇ Export All
            </button>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
              <thead>
                <tr style={{ background: "#f8f9fa", borderBottom: "1px solid #e0e0e0" }}>
                  <th style={{ padding: "10px 14px", textAlign: "left", width: 36 }}>
                    <input type="checkbox" checked={selected.size === pageData.length && pageData.length > 0} onChange={toggleAll} style={{ cursor: "pointer" }} />
                  </th>
                  {COLS.map(col => (
                    <th key={col.key}
                      onClick={col.sortable ? () => handleSort(col.key) : undefined}
                      style={{
                        padding: "10px 14px", textAlign: "left", fontWeight: 700, color: "#444",
                        whiteSpace: "nowrap", cursor: col.sortable ? "pointer" : "default", userSelect: "none",
                        background: sortCol === col.key ? "#eef3fb" : "transparent",
                      }}>
                      {col.label}
                      {col.sortable && (
                        <span style={{ marginLeft: 4, color: sortCol === col.key ? "#1a73e8" : "#bbb", fontSize: 11 }}>
                          {sortCol === col.key ? (sortDir === "asc" ? "▲" : "▼") : "▼"}
                        </span>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pageData.map((row, i) => (
                  <tr key={row.id}
                    style={{ borderBottom: "1px solid #f0f0f0", background: selected.has(row.id) ? "#f0f7ff" : i % 2 === 1 ? "#fafafa" : "#fff" }}
                    onMouseEnter={e => { if (!selected.has(row.id)) e.currentTarget.style.background = "#f5f5f5"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = selected.has(row.id) ? "#f0f7ff" : i % 2 === 1 ? "#fafafa" : "#fff"; }}>
                    <td style={{ padding: "9px 14px" }}>
                      <input type="checkbox" checked={selected.has(row.id)} onChange={() => toggleSelect(row.id)} style={{ cursor: "pointer" }} />
                    </td>
                    <td style={{ padding: "9px 14px", maxWidth: 240 }}>
                      <span style={{ color: "#1a73e8", cursor: "pointer", fontWeight: 500 }}
                        onMouseEnter={e => e.target.style.textDecoration = "underline"}
                        onMouseLeave={e => e.target.style.textDecoration = "none"}>
                        {row.title}
                      </span>
                    </td>
                    <td style={{ padding: "9px 14px", color: "#777", fontFamily: "monospace", fontSize: 11.5 }}>{row.sourceContentId}</td>
                    <td style={{ padding: "9px 14px", color: "#777", fontFamily: "monospace", fontSize: 11.5 }}>{row.productId}</td>
                    <td style={{ padding: "9px 14px" }}><StateChip state={row.state} /></td>
                    <td style={{ padding: "9px 14px" }}><ModerationChip state={row.moderationState} /></td>
                    <td style={{ padding: "9px 14px" }}>{row.publisher}</td>
                    <td style={{ padding: "9px 14px" }}><TypeChip type={row.type} /></td>
                    <td style={{ padding: "9px 14px", color: "#777", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row.slug}</td>
                    <td style={{ padding: "9px 14px", fontWeight: 600 }}>{row.downloads.toLocaleString()}</td>
                    <td style={{ padding: "9px 14px", color: "#777" }}>{row.created}</td>
                    <td style={{ padding: "9px 14px", position: "relative" }}>
                      <div style={{ position: "relative", display: "inline-block" }}>
                        <button
                          onClick={e => { e.stopPropagation(); setOpenMenu(openMenu === row.id ? null : row.id); }}
                          style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "#666", padding: "0 4px", lineHeight: 1 }}>
                          ⋯
                        </button>
                        {openMenu === row.id && (
                          <div onClick={e => e.stopPropagation()} style={{
                            position: "absolute", right: 0, top: "100%", background: "#fff", border: "1px solid #d0d0d0",
                            borderRadius: 6, boxShadow: "0 4px 12px rgba(0,0,0,0.12)", zIndex: 100, minWidth: 160,
                          }}>
                            {getMenuActions(row).map(({ label, danger, onClick }) => (
                              <div key={label}
                                style={{ padding: "9px 16px", cursor: "pointer", fontSize: 13, color: danger ? "#dc3545" : "#333" }}
                                onMouseEnter={e => e.currentTarget.style.background = "#f5f5f5"}
                                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                                onClick={onClick}>
                                {label}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {pageData.length === 0 && (
                  <tr>
                    <td colSpan={12} style={{ padding: "40px 0", textAlign: "center", color: "#999" }}>
                      No results found. Try adjusting your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div style={{ padding: "12px 20px", borderTop: "1px solid #f0f0f0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#666" }}>
              <span>Rows per page:</span>
              <select value={rowsPerPage} onChange={e => { setRowsPerPage(+e.target.value); setPage(1); }}
                style={{ padding: "4px 8px", border: "1px solid #d0d0d0", borderRadius: 5, fontSize: 13, background: "#fff" }}>
                {ROWS_PER_PAGE_OPTIONS.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, color: "#666", fontSize: 13 }}>
              <span>
                {filtered.length === 0 ? "0" : `${(page - 1) * rowsPerPage + 1}–${Math.min(page * rowsPerPage, filtered.length)}`} of {filtered.length.toLocaleString()}
              </span>
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                style={{ padding: "5px 12px", border: "1px solid #d0d0d0", borderRadius: 5, background: page === 1 ? "#f5f5f5" : "#fff", cursor: page === 1 ? "default" : "pointer", color: page === 1 ? "#bbb" : "#333" }}>
                ← Prev
              </button>
              <span style={{ fontWeight: 600 }}>Page {page} / {Math.max(1, totalPages)}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
                style={{ padding: "5px 12px", border: "1px solid #d0d0d0", borderRadius: 5, background: page >= totalPages ? "#f5f5f5" : "#fff", cursor: page >= totalPages ? "default" : "pointer", color: page >= totalPages ? "#bbb" : "#333" }}>
                Next →
              </button>
            </div>
          </div>
        </div>

        {/* Bulk Import */}
        <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #e0e0e0", padding: "20px 24px", marginTop: 20 }}>
          <h3 style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 700 }}>Bulk Import products in Content Library</h3>
          <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
            <div style={{ border: "2px dashed #d0d0d0", borderRadius: 8, padding: "20px 32px", textAlign: "center", color: "#999", cursor: "pointer", minWidth: 220 }}
              onMouseEnter={e => e.currentTarget.style.borderColor = "#1a73e8"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "#d0d0d0"}>
              <div style={{ fontSize: 24, marginBottom: 4 }}>📄</div>
              <div style={{ fontSize: 13 }}>Drag & drop or <span style={{ color: "#1a73e8", textDecoration: "underline", cursor: "pointer" }}>browse</span></div>
              <div style={{ fontSize: 11, color: "#bbb", marginTop: 4 }}>.xlsx files only</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div>
                <label style={{ display: "block", fontWeight: 600, fontSize: 12, color: "#555", marginBottom: 5 }}>TARGET REGION</label>
                <select style={{ padding: "8px 10px", border: "1px solid #d0d0d0", borderRadius: 6, fontSize: 13, background: "#fff", minWidth: 180 }}>
                  <option>AU - Sydney</option>
                  <option>US - East</option>
                  <option>EU - Ireland</option>
                </select>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button style={{ padding: "8px 18px", background: "#fff", border: "1px solid #d0d0d0", borderRadius: 6, fontSize: 13, cursor: "pointer", fontWeight: 600, color: "#333" }}>
                  ⬇ Download Sample
                </button>
                <button style={{ padding: "8px 18px", background: "#1a73e8", color: "#fff", border: "none", borderRadius: 6, fontSize: 13, cursor: "pointer", fontWeight: 700 }}>
                  Upload Spreadsheet
                </button>
              </div>
            </div>
          </div>
        </div>

        <div style={{ textAlign: "right", marginTop: 12, color: "#bbb", fontSize: 11 }}>v1.5.163</div>
      </div>
    </div>
    </>
  );
}
