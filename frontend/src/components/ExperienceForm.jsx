const ExperienceForm = ({ formData, onFormChange, onSave, onCancel, isEditMode }) => {
  return (
    <div className="bg-gray-900/50 p-6 my-4 rounded-lg border border-gray-700">
      <h3 className="text-xl font-semibold text-sky-300 mb-4">
        {isEditMode ? 'Edit Experience' : 'Add New Experience'}
      </h3>
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-300">Title*</label>
            <input type="text" name="title" value={formData.title} onChange={onFormChange} required className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm p-2 text-white"/>
          </div>
          <div>
            <label htmlFor="company" className="block text-sm font-medium text-gray-300">Company*</label>
            <input type="text" name="company" value={formData.company} onChange={onFormChange} required className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm p-2 text-white"/>
          </div>
        </div>
        
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-300">Location</label>
          <input type="text" name="location" value={formData.location} onChange={onFormChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm p-2 text-white"/>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-300">Start Date*</label>
            <input type="date" name="startDate" value={formData.startDate} onChange={onFormChange} required className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm p-2 text-white"/>
          </div>
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-300">End Date (blank if current)</label>
            <input type="date" name="endDate" value={formData.endDate} onChange={onFormChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm p-2 text-white"/>
          </div>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-300">Description</label>
          <textarea name="description" rows="4" value={formData.description} onChange={onFormChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm p-2 text-white"></textarea>
        </div>

        <div className="flex justify-end pt-4 space-x-3">
          <button type="button" onClick={onCancel} className="px-4 py-2 rounded-md text-gray-300 bg-gray-600 hover:bg-gray-500">
            Cancel
          </button>
          <button type="button" onClick={onSave} className="px-4 py-2 rounded-md text-white bg-sky-600 hover:bg-sky-700">
            Save Experience
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExperienceForm;