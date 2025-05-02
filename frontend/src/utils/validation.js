export const validateEmail = (email) => {
  return /\S+@\S+\.\S+/.test(email);
};

export const validatePassword = (password) => {
  return password.length >= 6;
};

export const validateRequired = (value) => {
  return value && value.trim() !== '';
};

export const validateForm = (formData, rules) => {
  const errors = {};
  
  Object.keys(rules).forEach(field => {
    const fieldRules = rules[field];
    const value = formData[field];
    
    if (fieldRules.required && !validateRequired(value)) {
      errors[field] = `${field} harus diisi`;
      return;
    }
    
    if (fieldRules.email && !validateEmail(value)) {
      errors[field] = 'Format email tidak valid';
      return;
    }
    
    if (fieldRules.password && !validatePassword(value)) {
      errors[field] = 'Password minimal 6 karakter';
      return;
    }
    
    if (fieldRules.minLength && value.length < fieldRules.minLength) {
      errors[field] = `${field} minimal ${fieldRules.minLength} karakter`;
      return;
    }
    
    if (fieldRules.maxLength && value.length > fieldRules.maxLength) {
      errors[field] = `${field} maksimal ${fieldRules.maxLength} karakter`;
      return;
    }
    
    if (fieldRules.custom && !fieldRules.custom(value)) {
      errors[field] = fieldRules.message || `${field} tidak valid`;
    }
  });
  
  return errors;
}; 