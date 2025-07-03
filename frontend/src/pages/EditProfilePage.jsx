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

  const handleAddNewExperience = () => {
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
  };

  const handleEditExperience = (exp) => {
    setEditingExperienceId(exp._id);
    setExperienceFormData({
      ...exp,
      startDate: exp.startDate || "",
      endDate: exp.endDate || "",
    });
    setShowExperienceForm(true);
  };

  const handleCancelExperienceForm = () => {
    setShowExperienceForm(false);
    setEditingExperienceId(null);
  };

  const handleExperienceFormChange = (e) => {
    setExperienceFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSaveExperience = async () => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    try {
      let response;
      if (editingExperienceId) {
        response = await axios.put(
          `${API_BASE_URL}/users/profile/experience/${editingExperienceId}`,
          experienceFormData,
          config
        );
      } else {
        response = await axios.post(
          `${API_BASE_URL}/users/profile/experience`,
          experienceFormData,
          config
        );
      }
      setExperienceList(response.data.experience);
      updateProfile(response.data);
      handleCancelExperienceForm();
    } catch (err) {
      alert(
        "Error saving experience: " +
          (err.response?.data?.message || err.message)
      );
    }
  };

  const handleDeleteExperience = async (experienceId) => {
    if (window.confirm("Are you sure?")) {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      try {
        const { data } = await axios.delete(
          `${API_BASE_URL}/users/profile/experience/${experienceId}`,
          config
        );
        updateProfile(data);
      } catch (err) {
        alert(
          "Error deleting experience: " +
            (err.response?.data?.message || err.message)
        );
      }
    }
  };

  const handleAddNewEducation = () => {
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
  };

  const handleEditEducation = (edu) => {
    setEditingEducationId(edu._id);
    setEducationFormData({
      ...edu,
      startDate: edu.startDate || "",
      endDate: edu.endDate || "",
      grade: edu.grade || "",
    });
    setShowEducationForm(true);
  };

  const handleCancelEducationForm = () => {
    setShowEducationForm(false);
    setEditingEducationId(null);
  };

  const handleEducationFormChange = (e) => {
    setEducationFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSaveEducation = async () => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    try {
      let response;
      if (editingEducationId) {
        response = await axios.put(
          `${API_BASE_URL}/users/profile/education/${editingEducationId}`,
          educationFormData,
          config
        );
      } else {
        response = await axios.post(
          `${API_BASE_URL}/users/profile/education`,
          educationFormData,
          config
        );
      }
      setEducationList(response.data.education);
      updateProfile(response.data);
      handleCancelEducationForm();
    } catch (err) {
      alert(
        "Error saving education: " +
          (err.response?.data?.message || err.message)
      );
    }
  };

  const handleDeleteEducation = async (educationId) => {
    if (window.confirm("Are you sure?")) {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      try {
        const { data } = await axios.delete(
          `${API_BASE_URL}/users/profile/education/${educationId}`,
          config
        );
        updateProfile(data);
      } catch (err) {
        alert(
          "Error deleting education: " +
            (err.response?.data?.message || err.message)
        );
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMessage("");
    try {
      const skillsArray = formData.skills
        .split(",")
        .map((skill) => skill.trim().toLowerCase())
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
        config
      );
      updateProfile(response.data);
      setSuccessMessage("Profile updated successfully! Redirecting...");
      setTimeout(
        () => navigate(`/profile/${currentUser.username.toLowerCase()}`),
        1500
      );
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  if (authLoading || loading) {
    return (
      <div className="p-8 text-center text-sky-400">
        Loading Profile Editor...
      </div>
    );
  }

  const formatMonthYear = (dateString) => {
    if (!dateString) return "Present";
    const [year, month] = dateString.split("-");
    return new Date(year, month - 1).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
    });
  };

  return (
    <div className="container mx-auto p-4 max-w-3xl mt-20 md:mt-24">
      <div className="bg-gray-800 shadow-xl rounded-lg p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <h1 className="text-3xl font-bold text-sky-400 mb-6 text-center">
            Edit Your Profile
          </h1>
          {error && (
            <p className="mb-4 text-center text-red-400 bg-red-900/50 p-3 rounded">
              {error}
            </p>
          )}
          {successMessage && (
            <p className="mb-4 text-center text-green-400 bg-green-900/50 p-3 rounded">
              {successMessage}
            </p>
          )}

          <div>
            <label
              htmlFor="displayName"
              className="block text-sm font-medium text-gray-300"
            >
              Display Name
            </label>
            <input
              type="text"
              name="displayName"
              id="displayName"
              value={formData.displayName}
              onChange={handleChange}
              className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md p-2 text-white"
            />
          </div>
          <div>
            <label
              htmlFor="bio"
              className="block text-sm font-medium text-gray-300"
            >
              Bio
            </label>
            <textarea
              name="bio"
              id="bio"
              rows="4"
              value={formData.bio}
              onChange={handleChange}
              className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md p-2 text-white"
              placeholder="Tell us a bit about yourself..."
            ></textarea>
          </div>
          <div>
            <label
              htmlFor="profilePicture"
              className="block text-sm font-medium text-gray-300"
            >
              Profile Picture URL
            </label>
            <input
              type="text"
              name="profilePicture"
              id="profilePicture"
              value={formData.profilePicture}
              onChange={handleChange}
              className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md p-2 text-white"
              placeholder="https://example.com/your-image.png"
            />
          </div>
          <div>
            <label
              htmlFor="location"
              className="block text-sm font-medium text-gray-300"
            >
              Location
            </label>
            <input
              type="text"
              name="location"
              id="location"
              value={formData.location}
              onChange={handleChange}
              className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md p-2 text-white"
              placeholder="e.g., City, Country"
            />
          </div>
          <div>
            <label
              htmlFor="skills"
              className="block text-sm font-medium text-gray-300"
            >
              Skills (comma-separated)
            </label>
            <input
              type="text"
              name="skills"
              id="skills"
              value={formData.skills}
              onChange={handleChange}
              className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md p-2 text-white"
              placeholder="e.g., react, nodejs, python"
            />
          </div>
          <fieldset className="border border-gray-700 p-4 rounded-md">
            <legend className="text-sm font-medium text-gray-300 px-2">
              Links
            </legend>
            <div className="space-y-4 mt-2">
              <div>
                <label
                  htmlFor="githubLink"
                  className="block text-xs font-medium text-gray-400"
                >
                  GitHub Profile URL
                </label>
                <input
                  type="url"
                  name="githubLink"
                  id="githubLink"
                  value={formData.githubLink}
                  onChange={handleChange}
                  className="mt-1 block w-full bg-gray-600 border-gray-500 rounded-md p-2 text-white"
                  placeholder="https://github.com/yourusername"
                />
              </div>
              <div>
                <label
                  htmlFor="linkedinLink"
                  className="block text-xs font-medium text-gray-400"
                >
                  LinkedIn Profile URL
                </label>
                <input
                  type="url"
                  name="linkedinLink"
                  id="linkedinLink"
                  value={formData.linkedinLink}
                  onChange={handleChange}
                  className="mt-1 block w-full bg-gray-600 border-gray-500 rounded-md p-2 text-white"
                  placeholder="https://linkedin.com/in/yourusername"
                />
              </div>
              <div>
                <label
                  htmlFor="websiteLink"
                  className="block text-xs font-medium text-gray-400"
                >
                  Personal Website/Portfolio
                </label>
                <input
                  type="url"
                  name="websiteLink"
                  id="websiteLink"
                  value={formData.websiteLink}
                  onChange={handleChange}
                  className="mt-1 block w-full bg-gray-600 border-gray-500 rounded-md p-2 text-white"
                  placeholder="https://yourdomain.com"
                />
              </div>
            </div>
          </fieldset>

          <DragDropContext onDragEnd={onDragEndExperience}>
            <div className="mt-10 pt-6 border-t border-gray-700">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-sky-300">
                  Work Experience
                </h2>
                {!showExperienceForm && (
                  <button
                    type="button"
                    onClick={handleAddNewExperience}
                    className="bg-gray-600 text-sky-300 border border-sky-400/50 px-3 py-1 rounded-md text-sm font-semibold hover:bg-gray-500 hover:text-white transition-colors"
                  >
                    + Add New
                  </button>
                )}
              </div>

              {showExperienceForm && (
                <ExperienceForm
                  formData={experienceFormData}
                  onFormChange={handleExperienceFormChange}
                  onSave={handleSaveExperience}
                  onCancel={handleCancelExperienceForm}
                  isEditMode={!!editingExperienceId}
                />
              )}

              <p className="text-sm text-gray-400 italic mb-2">
                Drag and drop to reorder your work experiences.
              </p>

              <Droppable droppableId="experience">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-4 mt-4"
                  >
                    {experienceList.length > 0
                      ? experienceList.map((exp, index) => (
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
                                className="bg-gray-900/50 p-4 rounded-lg flex justify-between items-start gap-4"
                              >
                                <div>
                                  <h3 className="font-bold text-lg text-white">
                                    {exp.title}
                                  </h3>
                                  <p className="text-gray-300">{exp.company}</p>
                                  <p className="text-sm text-gray-400">
                                    {formatMonthYear(exp.startDate)} -{" "}
                                    {formatMonthYear(exp.endDate)}
                                  </p>

                                  {exp.description && (
                                    <p className="text-sm text-gray-300 mt-2 whitespace-pre-wrap">
                                      {exp.description}
                                    </p>
                                  )}
                                </div>
                                <div className="flex space-x-3 mt-1 flex-shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => handleEditExperience(exp)}
                                    className="text-sky-400 hover:text-sky-300 text-sm font-medium"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleDeleteExperience(exp._id)
                                    }
                                    className="text-red-500 hover:text-red-400 text-sm font-medium"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))
                      : !showExperienceForm && (
                          <p className="text-gray-500 italic text-center py-4">
                            No work experience added yet.
                          </p>
                        )}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          </DragDropContext>

          <DragDropContext onDragEnd={onDragEndEducation}>
            <div className="mt-10 pt-6 border-t border-gray-700">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-sky-300">Education</h2>
                {!showEducationForm && (
                  <button
                    type="button"
                    onClick={handleAddNewEducation}
                    className="bg-gray-600 text-sky-300 border border-sky-400/50 px-3 py-1 rounded-md text-sm font-semibold hover:bg-gray-500 hover:text-white transition-colors"
                  >
                    + Add New
                  </button>
                )}
              </div>

              {showEducationForm && (
                <EducationForm
                  formData={educationFormData}
                  onFormChange={handleEducationFormChange}
                  onSave={handleSaveEducation}
                  onCancel={handleCancelEducationForm}
                  isEditMode={!!editingEducationId}
                />
              )}

              <p className="text-sm text-gray-400 italic mb-2">
                Drag and drop to reorder your education entries.
              </p>

              <Droppable droppableId="education">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-4 mt-4"
                  >
                    {educationList.length > 0
                      ? educationList.map((edu, index) => (
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
                                className="bg-gray-900/50 p-4 rounded-lg flex justify-between items-start gap-4"
                              >
                                <div>
                                  <h3 className="font-bold text-lg text-white">
                                    {edu.institution}
                                  </h3>
                                  <p className="text-gray-300">
                                    {edu.degree}
                                    {edu.fieldOfStudy &&
                                      `, ${edu.fieldOfStudy}`}
                                  </p>
                                  {edu.grade && (
                                    <p className="text-sm text-gray-300 font-semibold">{`Grade: ${edu.grade}`}</p>
                                  )}
                                  <p className="text-sm text-gray-400">
                                    {formatMonthYear(edu.startDate)} -{" "}
                                    {formatMonthYear(edu.endDate)}
                                  </p>
                                  {edu.description && (
                                    <p className="text-sm text-gray-300 mt-2 whitespace-pre-wrap">
                                      {edu.description}
                                    </p>
                                  )}
                                </div>
                                <div className="flex space-x-3 mt-1 flex-shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => handleEditEducation(edu)}
                                    className="text-sky-400 hover:text-sky-300 text-sm font-medium"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleDeleteEducation(edu._id)
                                    }
                                    className="text-red-500 hover:text-red-400 text-sm font-medium"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))
                      : !showEducationForm && (
                          <p className="text-gray-500 italic text-center py-4">
                            No education history added yet.
                          </p>
                        )}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          </DragDropContext>

          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Profile Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfilePage;
