<template>
    <div class="create-recipient-form">
      <div class="form-description">
        <p>Fill out the information below to create a new recipient.</p>
      </div>
      
      <!-- Dynamic Form Fields -->
      <div class="form-fields">
        <div 
          v-for="field in fields" 
          :key="field.name" 
          class="form-field" 
          :class="{ 'has-error': fieldErrors[field.name] }"
        >
          <label :for="field.name" class="field-label">
            {{ field.label }}
            <span v-if="field.required" class="required-indicator">*</span>
          </label>
          
          <!-- Text Input -->
          <input
            v-if="field.type === 'text' || field.type === 'email' || field.type === 'tel'"
            :id="field.name"
            v-model="formData[field.name]"
            :type="field.type"
            :placeholder="field.placeholder"
            :required="field.required"
            class="form-input"
            @blur="validateField(field)"
            @input="clearFieldError(field.name)"
          />
          
          <!-- Textarea -->
          <textarea
            v-else-if="field.type === 'textarea'"
            :id="field.name"
            v-model="formData[field.name]"
            :placeholder="field.placeholder"
            :required="field.required"
            class="form-textarea"
            rows="3"
            @blur="validateField(field)"
            @input="clearFieldError(field.name)"
          ></textarea>
          
          <!-- Select -->
          <select
            v-else-if="field.type === 'select'"
            :id="field.name"
            v-model="formData[field.name]"
            :required="field.required"
            class="form-select"
            @blur="validateField(field)"
            @change="clearFieldError(field.name)"
          >
            <option value="">Select {{ field.label }}</option>
            <option 
              v-for="option in field.options" 
              :key="option.value" 
              :value="option.value"
            >
              {{ option.label }}
            </option>
          </select>
          
          <!-- Checkbox -->
          <div v-else-if="field.type === 'checkbox'" class="checkbox-container">
            <input
              :id="field.name"
              v-model="formData[field.name]"
              type="checkbox"
              class="form-checkbox"
              @change="clearFieldError(field.name)"
            />
            <label :for="field.name" class="checkbox-label">
              {{ field.placeholder || field.label }}
            </label>
          </div>
          
          <!-- Number Input -->
          <input
            v-else-if="field.type === 'number'"
            :id="field.name"
            v-model.number="formData[field.name]"
            type="number"
            :placeholder="field.placeholder"
            :required="field.required"
            :min="field.min"
            :max="field.max"
            :step="field.step"
            class="form-input"
            @blur="validateField(field)"
            @input="clearFieldError(field.name)"
          />
          
          <!-- Date Input -->
          <input
            v-else-if="field.type === 'date'"
            :id="field.name"
            v-model="formData[field.name]"
            type="date"
            :required="field.required"
            class="form-input"
            @blur="validateField(field)"
            @change="clearFieldError(field.name)"
          />
          
          <!-- Field Error -->
          <div v-if="fieldErrors[field.name]" class="field-error">
            {{ fieldErrors[field.name] }}
          </div>
        </div>
      </div>
      
      <!-- Form Actions -->
      <div class="form-actions">
        <button @click="handleCancel" class="cancel-btn" type="button">
          Cancel
        </button>
        <button @click="handleSave" class="save-btn" :disabled="!isFormValid">
          Create Recipient
        </button>
      </div>
      
      <!-- Dropzone for Additional Fields (if enabled) -->
      <div v-if="enableDropzone" class="dropzone-section">
        <div class="section-header">
          <h4>Customize Form</h4>
          <p>Drag and drop field types to customize this form:</p>
        </div>
        
        <div class="field-types">
          <div 
            v-for="fieldType in availableFieldTypes" 
            :key="fieldType.type"
            class="field-type-item"
            draggable="true"
            @dragstart="handleDragStart($event, fieldType)"
          >
            <span class="field-icon">{{ fieldType.icon }}</span>
            <span class="field-name">{{ fieldType.name }}</span>
          </div>
        </div>
        
        <div 
          class="dropzone"
          :class="{ 'drag-over': isDragOver }"
          @drop="handleDrop"
          @dragover.prevent="handleDragOver"
          @dragleave="handleDragLeave"
        >
          <div class="dropzone-content">
            <div class="dropzone-icon">📋</div>
            <p>Drop field types here to add them to the form</p>
          </div>
        </div>
        
        <!-- Custom Fields Preview -->
        <div v-if="customFields.length" class="custom-fields-preview">
          <h5>Custom Fields Added:</h5>
          <div class="custom-field-list">
            <div 
              v-for="(field, index) in customFields" 
              :key="`custom-${index}`"
              class="custom-field-item"
            >
              <span>{{ field.label || field.name }}</span>
              <button @click="removeCustomField(index)" class="remove-field-btn">×</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'CreateRecipientForm',
    props: {
      fields: {
        type: Array,
        default: () => [
          { name: 'firstName', label: 'First Name', type: 'text', required: true },
          { name: 'lastName', label: 'Last Name', type: 'text', required: false },
          { name: 'email', label: 'Email', type: 'email', required: true }
        ]
      },
      modelValue: {
        type: Object,
        default: () => ({})
      },
      enableDropzone: {
        type: Boolean,
        default: false
      }
    },
    emits: ['update:modelValue', 'save', 'cancel'],
    data() {
      return {
        formData: {},
        fieldErrors: {},
        isDragOver: false,
        customFields: [],
        availableFieldTypes: [
          { type: 'text', name: 'Text', icon: '📝' },
          { type: 'email', name: 'Email', icon: '📧' },
          { type: 'tel', name: 'Phone', icon: '📞' },
          { type: 'textarea', name: 'Text Area', icon: '📄' },
          { type: 'select', name: 'Dropdown', icon: '📋' },
          { type: 'checkbox', name: 'Checkbox', icon: '☑️' },
          { type: 'number', name: 'Number', icon: '🔢' },
          { type: 'date', name: 'Date', icon: '📅' }
        ]
      }
    },
    computed: {
      allFields() {
        return [...this.fields, ...this.customFields]
      },
      
      isFormValid() {
        // Check if all required fields are filled and have no errors
        const requiredFields = this.allFields.filter(field => field.required)
        const hasRequiredValues = requiredFields.every(field => {
          const value = this.formData[field.name]
          return value !== undefined && value !== null && value !== ''
        })
        
        const hasNoErrors = Object.keys(this.fieldErrors).length === 0
        
        return hasRequiredValues && hasNoErrors
      }
    },
    watch: {
      modelValue: {
        handler(newValue) {
          this.formData = { ...newValue }
        },
        immediate: true,
        deep: true
      },
      
      formData: {
        handler(newValue) {
          this.$emit('update:modelValue', newValue)
        },
        deep: true
      }
    },
    methods: {
      validateField(field) {
        const value = this.formData[field.name]
        
        // Clear previous error
        delete this.fieldErrors[field.name];
        
        // Required field validation
        if (field.required && (!value || value.toString().trim() === '')) {
          this.fieldErrors[field.name] =`${field.label} is required`;
          return
        }
        
        // Email validation
        if (field.type === 'email' && value) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
          if (!emailRegex.test(value)) {
            this.fieldErrors[field.name] = 'Please enter a valid email address';
            return
          }
        }
        
        // Phone validation
        if (field.type === 'tel' && value) {
          const phoneRegex = /^[\+]?[\d\s\-\(\)]+$/
          if (!phoneRegex.test(value)) {
            this.fieldErrors[field.name] ='Please enter a valid phone number';
            return
          }
        }
        
        // Number validation
        if (field.type === 'number' && value !== undefined && value !== null) {
          const numValue = Number(value)
          if (isNaN(numValue)) {
            this.fieldErrors[field.name] ='Please enter a valid number';
            return
          }
          
          if (field.min !== undefined && numValue < field.min) {
            this.fieldErrors[field.name] =`Value must be at least ${field.min}`;
            return
          }
          
          if (field.max !== undefined && numValue > field.max) {
            this.fieldErrors[field.name] =`Value must be at most ${field.max}`;
            return
          }
        }
        
        // Custom validation if provided
        if (field.validator && typeof field.validator === 'function') {
          const validationResult = field.validator(value)
          if (validationResult !== true) {
            this.fieldErrors[field.name] =validationResult;
          }
        }
      },
      
      clearFieldError(fieldName) {
        if (this.fieldErrors[fieldName]) {
          this.$delete(this.fieldErrors, fieldName)
        }
      },
      
      handleSave() {
        // Validate all fields before saving
        this.allFields.forEach(field => {
          this.validateField(field)
        })
        
        if (this.isFormValid) {
          this.$emit('save', { ...this.formData })
        }
      },
      
      handleCancel() {
        this.$emit('cancel')
      },
      
      // Drag and Drop Methods
      handleDragStart(event, fieldType) {
        event.dataTransfer.setData('application/json', JSON.stringify(fieldType))
      },
      
      handleDragOver(event) {
        event.preventDefault()
        this.isDragOver = true
      },
      
      handleDragLeave() {
        this.isDragOver = false
      },
      
      handleDrop(event) {
        event.preventDefault()
        this.isDragOver = false
        
        try {
          const fieldType = JSON.parse(event.dataTransfer.getData('application/json'))
          this.addCustomField(fieldType)
        } catch (error) {
          console.error('Error parsing dropped data:', error)
        }
      },
      
      addCustomField(fieldType) {
        const fieldName = `custom_${fieldType.type}_${Date.now()}`
        const newField = {
          name: fieldName,
          label: fieldType.name,
          type: fieldType.type,
          required: false,
          placeholder: `Enter ${fieldType.name.toLowerCase()}...`
        }
        
        // Add default options for select fields
        if (fieldType.type === 'select') {
          newField.options = [
            { value: 'option1', label: 'Option 1' },
            { value: 'option2', label: 'Option 2' }
          ]
        }
        
        this.customFields.push(newField)
        
        // Initialize form data for the new field
        this.formData[fieldName] = fieldType.type === 'checkbox' ? false : '';
      },
      
      removeCustomField(index) {
        const field = this.customFields[index]
        
        // Remove from form data and errors
        delete this.formData[field.name];
        delete this.fieldErrors[field.name];
        
        // Remove from custom fields
        this.customFields.splice(index, 1)
      }
    },
    
    mounted() {
      // Initialize form data with default values
      this.allFields.forEach(field => {
        if (this.formData[field.name] === undefined) {
          let defaultValue = ''
          
          switch (field.type) {
            case 'checkbox':
              defaultValue = false
              break
            case 'number':
              defaultValue = field.default || 0
              break
            default:
              defaultValue = field.default || ''
          }
          
          this.formData[field.name] = defaultValue;
        }
      })
    }
  }
  </script>
  
  <style lang="scss" scoped>
  .create-recipient-form {
    .form-description {
      margin-bottom: 24px;
      
      p {
        color: #6b7280;
        font-size: 14px;
        margin: 0;
      }
    }
    
    .form-fields {
      .form-field {
        margin-bottom: 20px;
        
        &.has-error {
          .form-input,
          .form-textarea,
          .form-select {
            border-color: #ef4444;
            box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
          }
        }
        
        .field-label {
          display: block;
          font-weight: 600;
          color: #374151;
          margin-bottom: 6px;
          font-size: 14px;
          
          .required-indicator {
            color: #ef4444;
            margin-left: 2px;
          }
        }
        
        .form-input,
        .form-textarea,
        .form-select {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;
          transition: all 0.2s;
          
          &:focus {
            outline: none;
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
          }
          
          &::placeholder {
            color: #9ca3af;
          }
        }
        
        .form-textarea {
          resize: vertical;
          min-height: 80px;
        }
        
        .checkbox-container {
          display: flex;
          align-items: center;
          gap: 8px;
          
          .form-checkbox {
            width: auto;
            margin: 0;
          }
          
          .checkbox-label {
            margin: 0;
            font-weight: 400;
            cursor: pointer;
          }
        }
        
        .field-error {
          color: #ef4444;
          font-size: 12px;
          margin-top: 4px;
        }
      }
    }
    
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      margin-top: 24px;
      
      .cancel-btn,
      .save-btn {
        padding: 10px 20px;
        border: 1px solid;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
      }
      
      .cancel-btn {
        background: white;
        border-color: #d1d5db;
        color: #374151;
        
        &:hover {
          background: #f9fafb;
          border-color: #9ca3af;
        }
      }
      
      .save-btn {
        background: #3b82f6;
        border-color: #3b82f6;
        color: white;
        
        &:hover:not(:disabled) {
          background: #2563eb;
          border-color: #2563eb;
        }
        
        &:disabled {
          background: #d1d5db;
          border-color: #d1d5db;
          cursor: not-allowed;
          opacity: 0.6;
        }
      }
    }
    
    .dropzone-section {
      margin-top: 32px;
      padding-top: 24px;
      border-top: 1px solid #e5e7eb;
      
      .section-header {
        margin-bottom: 20px;
        
        h4 {
          margin: 0 0 8px 0;
          color: #374151;
          font-size: 16px;
          font-weight: 600;
        }
        
        p {
          margin: 0;
          color: #6b7280;
          font-size: 14px;
        }
      }
      
      .field-types {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        margin-bottom: 20px;
        
        .field-type-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: #f3f4f6;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          cursor: grab;
          transition: all 0.2s;
          
          &:hover {
            background: #e5e7eb;
            transform: translateY(-1px);
          }
          
          &:active {
            cursor: grabbing;
          }
          
          .field-icon {
            font-size: 16px;
          }
          
          .field-name {
            font-size: 14px;
            color: #374151;
            font-weight: 500;
          }
        }
      }
      
      .dropzone {
        border: 2px dashed #d1d5db;
        border-radius: 8px;
        padding: 40px 20px;
        text-align: center;
        transition: all 0.2s;
        
        &.drag-over {
          border-color: #3b82f6;
          background: rgba(59, 130, 246, 0.05);
        }
        
        .dropzone-content {
          .dropzone-icon {
            font-size: 48px;
            margin-bottom: 12px;
          }
          
          p {
            margin: 0;
            color: #6b7280;
            font-size: 14px;
          }
        }
      }
      
      .custom-fields-preview {
        margin-top: 20px;
        
        h5 {
          margin: 0 0 12px 0;
          color: #374151;
          font-size: 14px;
          font-weight: 600;
        }
        
        .custom-field-list {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          
          .custom-field-item {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 6px 12px;
            background: #dbeafe;
            color: #1e40af;
            border-radius: 16px;
            font-size: 14px;
            
            .remove-field-btn {
              background: none;
              border: none;
              color: #3b82f6;
              cursor: pointer;
              font-size: 16px;
              line-height: 1;
              padding: 0;
              width: 16px;
              height: 16px;
              display: flex;
              align-items: center;
              justify-content: center;
              border-radius: 50%;
              
              &:hover {
                background: rgba(59, 130, 246, 0.2);
              }
            }
          }
        }
      }
    }
  }
  </style>
