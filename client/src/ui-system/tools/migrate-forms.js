/**
 * BlogPro Form Migration Script
 */

const fs = require('fs').promises;
const path = require('path');

async function migrateForms() {
  console.log('📝 Starting form migration...');
  
  const srcPath = path.resolve(__dirname, '..', '..');
  
  // Create form compatibility CSS
  const formCompatCSS = `/* Form Compatibility Layer */
@import '../../ui-system/components/form/index.css';

/* Legacy form field mapping */
.form-field {
  composes: bp-form-field from '../../ui-system/components/form/form.css';
}

.form-field__label {
  composes: form-field__label from '../../ui-system/components/form/form.css';
}

.form-field__input {
  composes: form-field__input from '../../ui-system/components/form/form.css';
}

.form-field__textarea {
  composes: form-field__textarea from '../../ui-system/components/form/form.css';
}

.form-field__select {
  composes: form-field__select from '../../ui-system/components/form/form.css';
}

.form-field__error {
  composes: form-field__error from '../../ui-system/components/form/form.css';
}

.form-field__help {
  composes: form-field__help from '../../ui-system/components/form/form.css';
}

/* Legacy input classes */
.input {
  composes: form-field__input from '../../ui-system/components/form/form.css';
}

.input--sm {
  composes: form-field__input--size-sm from '../../ui-system/components/form/form.css';
}

.input--lg {
  composes: form-field__input--size-lg from '../../ui-system/components/form/form.css';
}

/* Form actions */
.form-actions {
  composes: bp-form-actions from '../../ui-system/components/form/form.css';
}`;
  
  const formCompatPath = path.join(srcPath, 'styles', 'blocks', 'form', 'form-compat.css');
  await fs.mkdir(path.dirname(formCompatPath), { recursive: true });
  await fs.writeFile(formCompatPath, formCompatCSS);
  
  console.log('✅ Form migration completed');
}

migrateForms().catch(console.error);