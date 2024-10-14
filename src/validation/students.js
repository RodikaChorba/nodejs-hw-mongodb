import Joi from 'joi';

export const createStudentSchema = Joi.object({
  name: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
  age: Joi.number().integer().min(6).max(16).required(),
  gender: Joi.string().valid('male', 'female', 'other').required(),
  avgMark: Joi.number().min(2).max(12).required(),
  onDuty: Joi.boolean(),
});
const dataToValidate = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  age: 12,
  gender: 'male',
  avgMark: 10.2,
};

const validationResult = createStudentSchema.validate(dataToValidate);
if (validationResult.error) {
  console.error(validationResult.error.message);
} else {
  console.log('Data is valid!');
}
import Joi from 'joi';

// Оголошення схеми з кастомізованими повідомленнями
const createStudentSchema = Joi.object({
  name: Joi.string().min(3).max(30).required().messages({
    'string.base': 'Username should be a string', // Кастомізація повідомлення для типу "string"
    'string.min': 'Username should have at least {#limit} characters',
    'string.max': 'Username should have at most {#limit} characters',
    'any.required': 'Username is required',
  }),
  email: Joi.string().email().required(),
  age: Joi.number().integer().min(6).max(16).required(),
  gender: Joi.string().valid('male', 'female', 'other').required(),
  avgMark: Joi.number().min(2).max(12).required(),
  onDuty: Joi.boolean(),
});
