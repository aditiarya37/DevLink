export default {
  control: {
  },

  '&multiLine': { 
    control: {
      fontFamily: 'inherit',
    },
    highlighter: {
      padding: '0.5rem 0.75rem',
      margin: 0,
      border: '1px solid transparent', 
      color: 'transparent', 
      overflow: 'hidden',
      whiteSpace: 'pre-wrap',
      wordWrap: 'break-word',
      minHeight: '80px',
      lineHeight: '1.25rem',
      fontSize: '0.875rem',
    },
    input: { 
      padding: '0.5rem 0.75rem', 
      margin: 0,
      border: '1px solid #4B5563', 
      borderRadius: '0.375rem',   
      outline: 'none',
      fontFamily: 'inherit',
      fontSize: '0.875rem',    
      lineHeight: '1.25rem',
      backgroundColor: '#374151',
      color: 'white',            
      caretColor: 'white',
      width: '100%',
      minHeight: '80px',
      resize: 'none',
    },
  },

  suggestions: { 
    list: {
      backgroundColor: '#4B5563',
      border: '1px solid #374151',
      fontSize: '0.875rem',
      borderRadius: '0.375rem',
      maxHeight: '200px',
      overflowY: 'auto',
      marginTop: '2px',
      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
      zIndex: 999,
    },
    item: {
      padding: '0.5rem 0.75rem',
      color: '#D1D5DB',
      '&focused': {
        backgroundColor: '#374151',
        color: 'white',
      },
    },
  },
};