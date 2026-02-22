import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import ExperienceForm from "../components/ExperienceForm";
import EducationForm from "../components/EducationForm";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

const EditProfilePage = () => {
  const {
    user: currentUser,
    token,
    loading: authLoading,
    updateProfile,
  } = useAuth();
  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const [formData, setFormData] = useState({
    displayName: "",
    bio: "",
    profilePicture: "",
    location: "",
    skills: "",
    githubLink: "",
    linkedinLink: "",
    websiteLink: "",
  });
  const [experienceList, setExperienceList] = useState([]);
  const [showExperienceForm, setShowExperienceForm] = useState(false);
  const [editingExperienceId, setEditingExperienceId] = useState(null);
  const [experienceFormData, setExperienceFormData] = useState({
    title: "",
    company: "",
    location: "",
    startDate: "",
    endDate: "",
    description: "",
  });
  const [educationList, setEducationList] = useState([]);
  const [showEducationForm, setShowEducationForm] = useState(false);
  const [editingEducationId, setEditingEducationId] = useState(null);
  const [educationFormData, setEducationFormData] = useState({
    institution: "",
    degree: "",
    fieldOfStudy: "",
    startDate: "",
    endDate: "",
    grade: "",
    description: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (!authLoading && currentUser) {
      setFormData({
        displayName: currentUser.displayName || "",
        bio: currentUser.bio || "",
        profilePicture: currentUser.profilePicture || "",
        location: currentUser.location || "",
        skills: Array.isArray(currentUser.skills)
          ? currentUser.skills.join(", ")
          : "",
        githubLink: currentUser.links?.github || "",
        linkedinLink: currentUser.links?.linkedin || "",
        websiteLink: currentUser.links?.website || "",
      });
      setExperienceList(currentUser.experience || []);
      setEducationList(currentUser.education || []);
      setLoading(false);
    }
  }, [currentUser, authLoading]);

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMessage("");
    try {
      const skillsArray = formData.skills
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);
      const payload = {
        displayName: formData.displayName,
        bio: formData.bio,
        profilePicture: formData.profilePicture,
        location: formData.location,
        skills: skillsArray,
        links: {
          github: formData.githubLink,
          linkedin: formData.linkedinLink,
          website: formData.websiteLink,
        },
        experience: experienceList,
        education: educationList,
      };
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.put(
        `${API_BASE_URL}/users/me/update`,
        payload,
        config,
      );
      updateProfile(response.data);
      setSuccessMessage("Profile updated! Redirecting...");
      setTimeout(
        () => navigate(`/profile/${currentUser.username.toLowerCase()}`),
        1500,
      );
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  // Experience handlers
  const onDragEndExperience = (result) => {
    if (!result.destination) return;
    const items = Array.from(experienceList);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setExperienceList(items);
  };

  const onDragEndEducation = (result) => {
    if (!result.destination) return;
    const items = Array.from(educationList);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setEducationList(items);
  };

  const handleSaveExperience = async () => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    try {
      let response;
      if (editingExperienceId) {
        response = await axios.put(
          `${API_BASE_URL}/users/profile/experience/${editingExperienceId}`,
          experienceFormData,
          config,
        );
      } else {
        response = await axios.post(
          `${API_BASE_URL}/users/profile/experience`,
          experienceFormData,
          config,
        );
      }
      setExperienceList(response.data.experience);
      updateProfile(response.data);
      setShowExperienceForm(false);
      setEditingExperienceId(null);
    } catch (err) {
      alert(
        "Error saving experience: " +
          (err.response?.data?.message || err.message),
      );
    }
  };

  const handleDeleteExperience = async (expId) => {
    if (window.confirm("Delete this experience?")) {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      try {
        const { data } = await axios.delete(
          `${API_BASE_URL}/users/profile/experience/${expId}`,
          config,
        );
        updateProfile(data);
        setExperienceList(data.experience);
      } catch (err) {
        alert("Error deleting experience.");
      }
    }
  };

  const handleSaveEducation = async () => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    try {
      let response;
      if (editingEducationId) {
        response = await axios.put(
          `${API_BASE_URL}/users/profile/education/${editingEducationId}`,
          educationFormData,
          config,
        );
      } else {
        response = await axios.post(
          `${API_BASE_URL}/users/profile/education`,
          educationFormData,
          config,
        );
      }
      setEducationList(response.data.education);
      updateProfile(response.data);
      setShowEducationForm(false);
      setEditingEducationId(null);
    } catch (err) {
      alert(
        "Error saving education: " +
          (err.response?.data?.message || err.message),
      );
    }
  };

  const handleDeleteEducation = async (eduId) => {
    if (window.confirm("Delete this education entry?")) {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      try {
        const { data } = await axios.delete(
          `${API_BASE_URL}/users/profile/education/${eduId}`,
          config,
        );
        updateProfile(data);
        setEducationList(data.education);
      } catch (err) {
        alert("Error deleting education.");
      }
    }
  };

  const formatMonthYear = (dateString) => {
    if (!dateString) return "Present";
    const [year, month] = dateString.split("-");
    return new Date(year, month - 1).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
    });
  };

  if (authLoading || loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "60vh",
        }}
      >
        <div
          style={{
            width: "28px",
            height: "28px",
            border: "2px solid var(--border-subtle)",
            borderTop: "2px solid var(--accent-green)",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }}
        />
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: "680px",
        margin: "0 auto",
        padding: "2rem 1.25rem 4rem",
      }}
    >
      <div style={{ marginBottom: "2rem" }}>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: "1.75rem",
            color: "var(--text-primary)",
            letterSpacing: "-0.03em",
          }}
        >
          Edit Profile
        </h1>
        <p
          style={{
            fontSize: "0.875rem",
            color: "var(--text-muted)",
            marginTop: "0.25rem",
          }}
        >
          Update your developer presence
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {error && (
          <div
            style={{
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.2)",
              borderRadius: "var(--radius-md)",
              padding: "0.75rem 1rem",
              color: "#f87171",
              fontSize: "0.85rem",
              marginBottom: "1.25rem",
            }}
          >
            {error}
          </div>
        )}
        {successMessage && (
          <div
            style={{
              background: "rgba(185,244,61,0.08)",
              border: "1px solid rgba(185,244,61,0.2)",
              borderRadius: "var(--radius-md)",
              padding: "0.75rem 1rem",
              color: "var(--accent-green)",
              fontSize: "0.85rem",
              marginBottom: "1.25rem",
            }}
          >
            {successMessage}
          </div>
        )}

        {/* Basic Info Section */}
        <FormSection title="Basic Info">
          <FormField label="Display Name">
            <input
              type="text"
              name="displayName"
              value={formData.displayName}
              onChange={handleChange}
              className="input-field"
              placeholder="Your Display Name"
            />
          </FormField>
          <FormField label="Bio">
            <textarea
              name="bio"
              rows="4"
              value={formData.bio}
              onChange={handleChange}
              className="input-field"
              placeholder="Tell us about yourself..."
              style={{ resize: "vertical" }}
            />
          </FormField>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "0.75rem",
            }}
          >
            <FormField label="Profile Picture URL">
              <input
                type="text"
                name="profilePicture"
                value={formData.profilePicture}
                onChange={handleChange}
                className="input-field"
                placeholder="https://..."
              />
            </FormField>
            <FormField label="Location">
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="input-field"
                placeholder="City, Country"
              />
            </FormField>
          </div>
          <FormField label="Skills (comma-separated)">
            <input
              type="text"
              name="skills"
              value={formData.skills}
              onChange={handleChange}
              className="input-field"
              placeholder="react, nodejs, python..."
            />
          </FormField>
        </FormSection>

        {/* Links Section */}
        <FormSection title="Links">
          <FormField label="GitHub URL">
            <input
              type="url"
              name="githubLink"
              value={formData.githubLink}
              onChange={handleChange}
              className="input-field"
              placeholder="https://github.com/yourusername"
            />
          </FormField>
          <FormField label="LinkedIn URL">
            <input
              type="url"
              name="linkedinLink"
              value={formData.linkedinLink}
              onChange={handleChange}
              className="input-field"
              placeholder="https://linkedin.com/in/yourusername"
            />
          </FormField>
          <FormField label="Website / Portfolio">
            <input
              type="url"
              name="websiteLink"
              value={formData.websiteLink}
              onChange={handleChange}
              className="input-field"
              placeholder="https://yourdomain.com"
            />
          </FormField>
        </FormSection>

        {/* Experience Section */}
        <FormSection
          title="Work Experience"
          action={
            !showExperienceForm && (
              <button
                type="button"
                onClick={() => {
                  setEditingExperienceId(null);
                  setExperienceFormData({
                    title: "",
                    company: "",
                    location: "",
                    startDate: "",
                    endDate: "",
                    description: "",
                  });
                  setShowExperienceForm(true);
                }}
                className="btn-ghost"
                style={{ fontSize: "0.78rem" }}
              >
                + Add
              </button>
            )
          }
        >
          {showExperienceForm && (
            <ExperienceForm
              formData={experienceFormData}
              onFormChange={(e) =>
                setExperienceFormData((prev) => ({
                  ...prev,
                  [e.target.name]: e.target.value,
                }))
              }
              onSave={handleSaveExperience}
              onCancel={() => {
                setShowExperienceForm(false);
                setEditingExperienceId(null);
              }}
              isEditMode={!!editingExperienceId}
            />
          )}
          <p
            style={{
              fontSize: "0.72rem",
              color: "var(--text-dim)",
              fontStyle: "italic",
              marginBottom: "0.5rem",
            }}
          >
            Drag to reorder
          </p>
          <DragDropContext onDragEnd={onDragEndExperience}>
            <Droppable droppableId="experience">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5rem",
                  }}
                >
                  {experienceList.length === 0 && !showExperienceForm && (
                    <p
                      style={{
                        fontSize: "0.85rem",
                        color: "var(--text-dim)",
                        fontStyle: "italic",
                        textAlign: "center",
                        padding: "1rem 0",
                      }}
                    >
                      No experience added yet.
                    </p>
                  )}
                  {experienceList.map((exp, index) => (
                    <Draggable
                      key={exp._id}
                      draggableId={exp._id}
                      index={index}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          style={{
                            ...provided.draggableProps.style,
                            background: "rgba(255,255,255,0.03)",
                            border: "1px solid var(--border-subtle)",
                            borderRadius: "var(--radius-md)",
                            padding: "0.85rem 1rem",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            gap: "0.75rem",
                            cursor: "grab",
                          }}
                        >
                          <div>
                            <p
                              style={{
                                fontFamily: "var(--font-display)",
                                fontWeight: 700,
                                fontSize: "0.9rem",
                                color: "var(--text-primary)",
                                marginBottom: "0.15rem",
                              }}
                            >
                              {exp.title}
                            </p>
                            <p
                              style={{
                                fontSize: "0.82rem",
                                color: "var(--text-secondary)",
                                marginBottom: "0.1rem",
                              }}
                            >
                              {exp.company}
                            </p>
                            <p
                              style={{
                                fontSize: "0.72rem",
                                color: "var(--text-dim)",
                              }}
                            >
                              {formatMonthYear(exp.startDate)} —{" "}
                              {formatMonthYear(exp.endDate)}
                            </p>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              gap: "0.3rem",
                              flexShrink: 0,
                            }}
                          >
                            <button
                              type="button"
                              onClick={() => {
                                setEditingExperienceId(exp._id);
                                setExperienceFormData({
                                  ...exp,
                                  startDate: exp.startDate || "",
                                  endDate: exp.endDate || "",
                                });
                                setShowExperienceForm(true);
                              }}
                              className="btn-ghost"
                              style={{
                                fontSize: "0.72rem",
                                padding: "0.2rem 0.5rem",
                              }}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteExperience(exp._id)}
                              className="btn-danger"
                              style={{
                                fontSize: "0.72rem",
                                padding: "0.2rem 0.5rem",
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </FormSection>

        {/* Education Section */}
        <FormSection
          title="Education"
          action={
            !showEducationForm && (
              <button
                type="button"
                onClick={() => {
                  setEditingEducationId(null);
                  setEducationFormData({
                    institution: "",
                    degree: "",
                    fieldOfStudy: "",
                    startDate: "",
                    endDate: "",
                    grade: "",
                    description: "",
                  });
                  setShowEducationForm(true);
                }}
                className="btn-ghost"
                style={{ fontSize: "0.78rem" }}
              >
                + Add
              </button>
            )
          }
        >
          {showEducationForm && (
            <EducationForm
              formData={educationFormData}
              onFormChange={(e) =>
                setEducationFormData((prev) => ({
                  ...prev,
                  [e.target.name]: e.target.value,
                }))
              }
              onSave={handleSaveEducation}
              onCancel={() => {
                setShowEducationForm(false);
                setEditingEducationId(null);
              }}
              isEditMode={!!editingEducationId}
            />
          )}
          <p
            style={{
              fontSize: "0.72rem",
              color: "var(--text-dim)",
              fontStyle: "italic",
              marginBottom: "0.5rem",
            }}
          >
            Drag to reorder
          </p>
          <DragDropContext onDragEnd={onDragEndEducation}>
            <Droppable droppableId="education">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5rem",
                  }}
                >
                  {educationList.length === 0 && !showEducationForm && (
                    <p
                      style={{
                        fontSize: "0.85rem",
                        color: "var(--text-dim)",
                        fontStyle: "italic",
                        textAlign: "center",
                        padding: "1rem 0",
                      }}
                    >
                      No education added yet.
                    </p>
                  )}
                  {educationList.map((edu, index) => (
                    <Draggable
                      key={edu._id}
                      draggableId={edu._id}
                      index={index}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          style={{
                            ...provided.draggableProps.style,
                            background: "rgba(255,255,255,0.03)",
                            border: "1px solid var(--border-subtle)",
                            borderRadius: "var(--radius-md)",
                            padding: "0.85rem 1rem",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            gap: "0.75rem",
                            cursor: "grab",
                          }}
                        >
                          <div>
                            <p
                              style={{
                                fontFamily: "var(--font-display)",
                                fontWeight: 700,
                                fontSize: "0.9rem",
                                color: "var(--text-primary)",
                                marginBottom: "0.15rem",
                              }}
                            >
                              {edu.institution}
                            </p>
                            <p
                              style={{
                                fontSize: "0.82rem",
                                color: "var(--text-secondary)",
                                marginBottom: "0.1rem",
                              }}
                            >
                              {edu.degree}
                              {edu.fieldOfStudy && `, ${edu.fieldOfStudy}`}
                            </p>
                            {edu.grade && (
                              <p
                                style={{
                                  fontSize: "0.72rem",
                                  color: "var(--accent-green)",
                                  fontWeight: 600,
                                  marginBottom: "0.1rem",
                                }}
                              >
                                Grade: {edu.grade}
                              </p>
                            )}
                            <p
                              style={{
                                fontSize: "0.72rem",
                                color: "var(--text-dim)",
                              }}
                            >
                              {formatMonthYear(edu.startDate)} —{" "}
                              {formatMonthYear(edu.endDate)}
                            </p>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              gap: "0.3rem",
                              flexShrink: 0,
                            }}
                          >
                            <button
                              type="button"
                              onClick={() => {
                                setEditingEducationId(edu._id);
                                setEducationFormData({
                                  ...edu,
                                  startDate: edu.startDate || "",
                                  endDate: edu.endDate || "",
                                  grade: edu.grade || "",
                                });
                                setShowEducationForm(true);
                              }}
                              className="btn-ghost"
                              style={{
                                fontSize: "0.72rem",
                                padding: "0.2rem 0.5rem",
                              }}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteEducation(edu._id)}
                              className="btn-danger"
                              style={{
                                fontSize: "0.72rem",
                                padding: "0.2rem 0.5rem",
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </FormSection>

        {/* Submit */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            paddingTop: "0.5rem",
          }}
        >
          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ padding: "0.65rem 2rem" }}
          >
            {loading ? "Saving..." : "Save Profile Changes"}
          </button>
        </div>
      </form>
    </div>
  );
};

const FormSection = ({ title, children, action }) => (
  <div
    style={{
      background: "var(--bg-card)",
      border: "1px solid var(--border-card)",
      borderRadius: "var(--radius-lg)",
      padding: "1.5rem",
      marginBottom: "1rem",
      boxShadow: "var(--shadow-card)",
    }}
  >
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "1.25rem",
      }}
    >
      <h2
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          fontSize: "0.95rem",
          color: "var(--text-primary)",
          margin: 0,
        }}
      >
        {title}
      </h2>
      {action}
    </div>
    <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
      {children}
    </div>
  </div>
);

const FormField = ({ label, children }) => (
  <div>
    <label className="input-label">{label}</label>
    {children}
  </div>
);

export default EditProfilePage;
