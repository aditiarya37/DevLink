const ExperienceForm = ({
  formData,
  onFormChange,
  onSave,
  onCancel,
  isEditMode,
}) => {
  return (
    <div
      style={{
        background: "rgba(185, 244, 61, 0.04)",
        border: "1px solid rgba(185, 244, 61, 0.15)",
        borderRadius: "var(--radius-md)",
        padding: "1.25rem",
        marginBottom: "1rem",
        animation: "fadeSlideUp 0.3s var(--ease-expo) both",
      }}
    >
      <h3
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          fontSize: "0.95rem",
          color: "var(--text-primary)",
          marginBottom: "1rem",
        }}
      >
        {isEditMode ? "Edit Experience" : "Add New Experience"}
      </h3>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "0.65rem",
          }}
        >
          <div>
            <label className="input-label">Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={onFormChange}
              required
              className="input-field"
              style={{ fontSize: "0.875rem" }}
            />
          </div>
          <div>
            <label className="input-label">Company *</label>
            <input
              type="text"
              name="company"
              value={formData.company}
              onChange={onFormChange}
              required
              className="input-field"
              style={{ fontSize: "0.875rem" }}
            />
          </div>
        </div>
        <div>
          <label className="input-label">Location</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={onFormChange}
            className="input-field"
            style={{ fontSize: "0.875rem" }}
          />
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "0.65rem",
          }}
        >
          <div>
            <label className="input-label">Start Date</label>
            <input
              type="month"
              name="startDate"
              value={formData.startDate}
              onChange={onFormChange}
              className="input-field"
              style={{ fontSize: "0.875rem" }}
            />
          </div>
          <div>
            <label className="input-label">End Date (blank if current)</label>
            <input
              type="month"
              name="endDate"
              value={formData.endDate}
              onChange={onFormChange}
              className="input-field"
              style={{ fontSize: "0.875rem" }}
            />
          </div>
        </div>
        <div>
          <label className="input-label">Description</label>
          <textarea
            name="description"
            rows="3"
            value={formData.description}
            onChange={onFormChange}
            className="input-field"
            style={{ resize: "vertical", fontSize: "0.875rem" }}
          />
        </div>
        <div
          style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}
        >
          <button
            type="button"
            onClick={onCancel}
            className="btn-secondary"
            style={{ padding: "0.45rem 1rem", fontSize: "0.8rem" }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSave}
            className="btn-primary"
            style={{ padding: "0.45rem 1rem", fontSize: "0.8rem" }}
          >
            Save Experience
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExperienceForm;
