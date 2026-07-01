export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const passwordRules = {
  required: 'Password is required',
  minLength: { value: 6, message: 'Password must be at least 6 characters' },
};

export const emailRules = {
  required: 'Email is required',
  pattern: { value: emailRegex, message: 'Enter a valid email address' },
};

export const nameRules = {
  required: 'Name is required',
  minLength: { value: 2, message: 'Name must be at least 2 characters' },
};

export const requiredRule = (fieldName) => ({
  required: `${fieldName} is required`,
});