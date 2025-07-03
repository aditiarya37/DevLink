const EducationForm = ({
  formData,
  onFormChange,
  onSave,
  onCancel,
  isEditMode,
}) => {
  return (
    <div className="bg-gray-900/50 p-6 my-4 rounded-lg border border-gray-700">
      <h3 className="text-xl font-semibold text-sky-300 mb-4">
        {isEditMode ? "Edit Education" : "Add New Education"}
      </h3>
      <div className="space-y-4">
        <div>
          <label
            htmlFor="institution"
            className="block text-sm font-medium text-gray-300"
          >
            School or University*
          </label>
          <input
            type="text"
            name="institution"
            value={formData.institution}
            onChange={onFormChange}
            required
            className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm p-2 text-white"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="degree"
              className="block text-sm font-medium text-gray-300"
            >
              Degree
            </label>
            <input
              type="text"
              name="degree"
              value={formData.degree}
              onChange={onFormChange}
              placeholder="e.g., Bachelor of Science"
              className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm p-2 text-white"
            />
          </div>
          <div>
            <label
              htmlFor="fieldOfStudy"
              className="block text-sm font-medium text-gray-300"
            >
              Field of Study
            </label>
            <input
              type="text"
              name="fieldOfStudy"
              value={formData.fieldOfStudy}
              onChange={onFormChange}
              placeholder="e.g., Computer Science"
              className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm p-2 text-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="startDate"
              className="block text-sm font-medium text-gray-300"
            >
              Start Date
            </label>
            <input
              type="month"
              name="startDate"
              value={formData.startDate}
              onChange={onFormChange}
              className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm p-2 text-white"
            />
          </div>
          <div>
            <label
              htmlFor="endDate"
              className="block text-sm font-medium text-gray-300"
            >
              End Date (blank if current)
            </label>
            <input
              type="month"
              name="endDate"
              value={formData.endDate}
              onChange={onFormChange}
              className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm p-2 text-white"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="grade"
            className="block text-sm font-medium text-gray-300"
          >
            Grade/CGPA
          </label>
          <input
            type="text"
            name="grade"
            value={formData.grade || ""}
            onChange={onFormChange}
            placeholder="e.g., 8.5 CGPA or 85%"
            className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm p-2 text-white"
          />
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-300"
          >
            Description
          </label>
          <textarea
            name="description"
            rows="4"
            value={formData.description}
            onChange={onFormChange}
            className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm p-2 text-white"
          ></textarea>
        </div>

        <div className="flex justify-end pt-4 space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-md text-gray-300 bg-gray-600 hover:bg-gray-500"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSave}
            className="px-4 py-2 rounded-md text-white bg-sky-600 hover:bg-sky-700"
          >
            Save Education
          </button>
        </div>
      </div>
    </div>
  );
};

export default EducationForm;
