<template>
  <div class="ww-email-composer" :style="componentStyles">
    <!-- Main Email Form -->
    <div class="email-form" :class="{ 'compact': content.compactMode }">
      
      <!-- Recipients Section -->
      <div class="recipients-section">
        <!-- TO Field -->
        <div class="recipient-field">
          <label class="field-label">To:</label>
          <RecipientInput
            v-model="emailData.to"
            :recipients-data="recipientsList"
            :allow-create="content.allowCreateRecipient"
            :create-fields="content.createRecipientFields"
            @create-recipient="handleCreateRecipient"
            @slide-panel="handleSlidePanel"
          />
        </div>
        
        <!-- CC/BCC Toggle -->
        <div class="cc-bcc-toggle" v-if="!showCcBcc && !content.showCcBcc">
          <button @click="showCcBcc = true" class="toggle-btn">CC</button>
          <button @click="showCcBcc = true" class="toggle-btn">BCC</button>
        </div>
        
        <!-- CC Field -->
        <div class="recipient-field" v-if="showCcBcc || content.showCcBcc">
          <label class="field-label">CC:</label>
          <RecipientInput
            v-model="emailData.cc"
            :recipients-data="recipientsList"
            :allow-create="content.allowCreateRecipient"
            :create-fields="content.createRecipientFields"
            @create-recipient="handleCreateRecipient"
            @slide-panel="handleSlidePanel"
          />
        </div>
        
        <!-- BCC Field -->
        <div class="recipient-field" v-if="showCcBcc || content.showCcBcc">
          <label class="field-label">BCC:</label>
          <RecipientInput
            v-model="emailData.bcc"
            :recipients-data="recipientsList"
            :allow-create="content.allowCreateRecipient"
            :create-fields="content.createRecipientFields"
            @create-recipient="handleCreateRecipient"
            @slide-panel="handleSlidePanel"
          />
        </div>
      </div>
      
      <!-- Related Objects Section -->
      <div class="related-objects" v-if="content.mergeFieldsDataSources?.length">
        <div v-for="dataSource in content.mergeFieldsDataSources" :key="dataSource.name">
          <label class="field-label">{{ dataSource.label }}:</label>
          <select 
            v-model="emailData.linkedRecords[dataSource.name]"
            class="related-select"
          >
            <option value="">Select {{ dataSource.label }}</option>
            <option 
              v-for="item in getDataSourceItems(dataSource.dataSource)" 
              :key="getItemId(item)"
              :value="item"
            >
              {{ getItemLabel(item) }}
            </option>
          </select>
        </div>
      </div>
      
      <!-- Subject Line -->
      <div class="subject-field">
        <label class="field-label">Subject:</label>
        <input
          v-model="emailData.subject"
          type="text"
          class="subject-input"
          placeholder="Enter email subject..."
          @input="processMergeFields"
        />
      </div>
      
      <!-- Template Selection -->
      <div class="template-section" v-if="content.enableTemplates && templatesList?.length">
        <label class="field-label">Template:</label>
        <select v-model="selectedTemplate" @change="applyTemplate" class="template-select">
          <option value="">No Template</option>
          <option 
            v-for="template in templatesList" 
            :key="getTemplateId(template)"
            :value="template"
          >
            {{ getTemplateLabel(template) }}
          </option>
        </select>
        
        <!-- Preview Toggle -->
        <button 
          v-if="content.showPreviewButton && selectedTemplate && content.enableMergeFields"
          @click="togglePreview"
          class="preview-btn"
          :class="{ active: showPreview }"
        >
          {{ showPreview ? 'Show Template' : 'Preview Merged' }}
        </button>
      </div>
      
      <!-- Email Body -->
      <div class="body-field">
        <label class="field-label">Message:</label>
        <div class="editor-container">
          <textarea
            v-model="emailData.body"
            class="email-editor"
            :class="{ 'preview-mode': showPreview }"
            placeholder="Type your message here..."
            rows="10"
            @input="processMergeFields"
          ></textarea>
          
          <!-- Preview Overlay -->
          <div v-if="showPreview" class="preview-overlay" v-html="mergedContent"></div>
        </div>
      </div>
      
      <!-- Attachments Section -->
      <div class="attachments-section" v-if="content.enableAttachments">
        <div class="attachments-header">
          <label class="field-label">Attachments:</label>
          <button @click="showAttachmentPanel = true" class="attach-btn">
            📎 Add Attachment
          </button>
        </div>
        
        <!-- Attachment List -->
        <div class="attachment-list" v-if="emailData.attachments?.length">
          <div 
            v-for="(attachment, index) in emailData.attachments" 
            :key="index"
            class="attachment-item"
          >
            <span class="attachment-name">{{ attachment.name }}</span>
            <span class="attachment-size">({{ formatFileSize(attachment.size) }})</span>
            <button @click="removeAttachment(index)" class="remove-btn">×</button>
          </div>
        </div>
      </div>
      
      <!-- Send Button -->
      <div class="send-section">
        <button 
          @click="sendEmail" 
          class="send-btn"
          :disabled="!canSend"
          :class="{ disabled: !canSend }"
        >
          Send Email
        </button>
      </div>
    </div>
    
    <!-- Slide Panels -->
    <SlidePanel
      v-if="showCreatePanel"
      :visible="showCreatePanel"
      title="Create New Recipient"
      @close="showCreatePanel = false"
      @save="saveNewRecipient"
    >
      <CreateRecipientForm
        :fields="content.createRecipientFields"
        v-model="newRecipientData"
      />
    </SlidePanel>
    
    <SlidePanel
      v-if="showAttachmentPanel"
      :visible="showAttachmentPanel"
      title="Manage Attachments"
      @close="showAttachmentPanel = false"
      @save="handleAttachmentsSave"
    >
      <AttachmentManager
        v-model="emailData.attachments"
        :max-size="content.maxAttachmentSize"
        :allowed-types="content.allowedFileTypes"
      />
    </SlidePanel>
  </div>
</template>

<script>
import RecipientInput from './components/RecipientInput.vue'
import SlidePanel from './components/SlidePanel.vue'
import CreateRecipientForm from './components/CreateRecipientForm.vue'
import AttachmentManager from './components/AttachmentManager.vue'

export default {
  name: 'WwEmailComposer',
  components: {
    RecipientInput,
    SlidePanel,
    CreateRecipientForm,
    AttachmentManager
  },
  props: {
    content: { type: Object, required: true },
    uid: { type: String, required: true },
    wwFrontState: { type: Object, required: true },
    wwElementState: { type: Object, required: true }
  },
  data() {
    return {
      emailData: {
        to: [],
        cc: [],
        bcc: [],
        subject: '',
        body: '',
        attachments: [],
        linkedRecords: {}
      },
      selectedTemplate: null,
      showCcBcc: false,
      showPreview: false,
      showCreatePanel: false,  
      showAttachmentPanel: false,
      newRecipientData: {},
      mergedContent: ''
    }
  },
  computed: {
    componentStyles() {
      return {
        '--primary-color': this.content.primaryColor || '#3B82F6',
        '--border-radius': this.content.borderRadius || '8px'
      }
    },
    recipientsList() {
      return this.wwLib.resolveValue(this.content.recipientDataSource) || []
    },
    templatesList() {
      return this.wwLib.resolveValue(this.content.templatesDataSource) || []
    },
    canSend() {
      return this.emailData.to.length > 0 && 
             this.emailData.subject.trim() && 
             this.emailData.body.trim()
    }
  },
  methods: {
    // Recipient Management
    handleCreateRecipient(recipientData) {
      this.newRecipientData = recipientData
      this.showCreatePanel = true
    },
    
    saveNewRecipient(recipientData) {
      // Emit event for parent to handle recipient creation
      this.$emit('trigger-event', {
        name: 'recipient:create',
        event: { recipient: recipientData }
      })
      
      // Add to current recipients list temporarily
      this.emailData.to.push({
        ...recipientData,
        id: Date.now() // Temporary ID
      })
      
      this.showCreatePanel = false
      this.newRecipientData = {}
    },
    
    // Template Management
    applyTemplate() {
      if (this.selectedTemplate) {
        this.emailData.subject = this.getTemplateField(this.selectedTemplate, 'subject')
        this.emailData.body = this.getTemplateField(this.selectedTemplate, 'body')
        this.processMergeFields()
      }
    },
    
    togglePreview() {
      this.showPreview = !this.showPreview
      if (this.showPreview) {
        this.processMergeFields()
      }
    },
    
    // Merge Fields Processing
    processMergeFields() {
      if (!this.content.enableMergeFields) return
      
      let mergedSubject = this.emailData.subject
      let mergedBody = this.emailData.body
      
      // Process each linked record
      Object.entries(this.emailData.linkedRecords).forEach(([key, record]) => {
        if (record) {
          const dataSource = this.content.mergeFieldsDataSources.find(ds => ds.name === key)
          if (dataSource) {
            const prefix = dataSource.prefix || key
            Object.entries(record).forEach(([field, value]) => {
              const placeholder = `{{${prefix}.${field}}}`
              mergedSubject = mergedSubject.replace(new RegExp(placeholder, 'g'), value || '')
              mergedBody = mergedBody.replace(new RegExp(placeholder, 'g'), value || '')
            })
          }
        }
      })
      
      // Process recipient merge fields
      if (this.emailData.to.length > 0) {
        const recipient = this.emailData.to[0] // Use first recipient for preview
        Object.entries(recipient).forEach(([field, value]) => {
          const placeholder = `{{recipient.${field}}}`
          mergedSubject = mergedSubject.replace(new RegExp(placeholder, 'g'), value || '')
          mergedBody = mergedBody.replace(new RegExp(placeholder, 'g'), value || '')
        })
      }
      
      this.mergedContent = mergedBody.replace(/\n/g, '<br>')
    },
    
    // Attachment Management
    removeAttachment(index) {
      this.emailData.attachments.splice(index, 1)
    },
    
    handleAttachmentsSave() {
      this.showAttachmentPanel = false
    },
    
    // Email Sending
    sendEmail() {
      if (!this.canSend) return
      
      const emailPayload = {
        ...this.emailData,
        from: {
          email: this.content.fromEmail,
          name: this.content.fromName
        }
      }
      
      this.$emit('trigger-event', {
        name: 'email:send', 
        event: emailPayload
      })
    },
    
    // Panel Management
    handleSlidePanel(type, data) {
      if (type === 'create') {
        this.handleCreateRecipient(data)
      }
    },
    
    // Utility Methods
    getDataSourceItems(dataSource) {
      return this.wwLib.resolveValue(dataSource) || []
    },
    
    getItemId(item) {
      return item[this.content.recipientIdField] || item.id
    },
    
    getItemLabel(item) {
      const name = item[this.content.recipientNameField] || item.name || ''
      const email = item[this.content.recipientEmailField] || item.email || ''
      return `${name} <${email}>`
    },
    
    getTemplateId(template) {
      return template.id || template[this.content.recipientIdField]
    },
    
    getTemplateLabel(template) {
      return template[this.content.templateNameField] || template.name
    },
    
    getTemplateField(template, field) {
      const fieldName = this.content[`template${field.charAt(0).toUpperCase() + field.slice(1)}Field`]
      return template[fieldName] || template[field] || ''
    },
    
    formatFileSize(bytes) {
      if (bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }
  },
  
  watch: {
    'emailData.linkedRecords': {
      handler() {
        this.processMergeFields()
      },
      deep: true
    }
  }
}
</script>

<style lang="scss" scoped>
.ww-email-composer {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  max-width: 100%;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: var(--border-radius);
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  
  .email-form {
    padding: 24px;
    
    &.compact {
      padding: 16px;
      
      .field-label {
        font-size: 14px;
      }
      
      .recipient-field, .subject-field, .body-field {
        margin-bottom: 16px;
      }
    }
  }
  
  .field-label {
    display: block;
    font-weight: 600;
    color: #374151;
    margin-bottom: 8px;
    font-size: 14px;
  }
  
  .recipients-section {
    margin-bottom: 24px;
  }
  
  .recipient-field {
    display: flex;
    align-items: flex-start;
    margin-bottom: 16px;
    gap: 12px;
    
    .field-label {
      min-width: 60px;
      margin-bottom: 0;
      padding-top: 8px;
    }
  }
  
  .cc-bcc-toggle {
    margin-left: 72px;
    margin-bottom: 16px;
    
    .toggle-btn {
      background: none;
      border: none;
      color: var(--primary-color);
      cursor: pointer;
      font-size: 14px;
      margin-right: 16px;
      text-decoration: underline;
      
      &:hover {
        opacity: 0.8;
      }
    }
  }
  
  .related-objects {
    margin-bottom: 24px;
    padding: 16px;
    background: #f9fafb;
    border-radius: var(--border-radius);
    
    > div {
      margin-bottom: 16px;
      
      &:last-child {
        margin-bottom: 0;
      }
    }
    
    .related-select {
      width: 100%;
      padding: 8px 12px;
      border: 1px solid #d1d5db;
      border-radius: var(--border-radius);
      font-size: 14px;
      
      &:focus {
        outline: none;
        border-color: var(--primary-color);
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
      }
    }
  }
  
  .subject-field {
    margin-bottom: 24px;
    
    .subject-input {
      width: 100%;
      padding: 12px;
      border: 1px solid #d1d5db;
      border-radius: var(--border-radius);
      font-size: 16px;
      
      &:focus {
        outline: none;
        border-color: var(--primary-color);
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
      }
    }
  }
  
  .template-section {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 24px;
    flex-wrap: wrap;
    
    .template-select {
      flex: 1;
      min-width: 200px;
      padding: 8px 12px;
      border: 1px solid #d1d5db;
      border-radius: var(--border-radius);
      font-size: 14px;
      
      &:focus {
        outline: none;
        border-color: var(--primary-color);
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
      }
    }
    
    .preview-btn {
      padding: 8px 16px;
      background: #f3f4f6;
      border: 1px solid #d1d5db;
      border-radius: var(--border-radius);
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s;
      
      &:hover {
        background: #e5e7eb;
      }
      
      &.active {
        background: var(--primary-color);
        color: white;
        border-color: var(--primary-color);
      }
    }
  }
  
  .body-field {
    margin-bottom: 24px;
    
    .editor-container {
      position: relative;
      
      .email-editor {
        width: 100%;
        padding: 12px;
        border: 1px solid #d1d5db;
        border-radius: var(--border-radius);
        font-size: 14px;
        font-family: inherit;
        resize: vertical;
        min-height: 200px;
        
        &:focus {
          outline: none;
          border-color: var(--primary-color);
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        
        &.preview-mode {
          opacity: 0.3;
        }
      }
      
      .preview-overlay {
        position: absolute;
        top: 12px;
        left: 12px;
        right: 12px;
        bottom: 12px;
        background: rgba(255, 255, 255, 0.95);
        padding: 12px;
        border-radius: calc(var(--border-radius) - 1px);
        font-size: 14px;
        line-height: 1.5;
        overflow-y: auto;
        pointer-events: none;
      }
    }
  }
  
  .attachments-section {
    margin-bottom: 24px;
    
    .attachments-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      
      .attach-btn {
        padding: 8px 16px;
        background: #f3f4f6;
        border: 1px solid #d1d5db;
        border-radius: var(--border-radius);
        font-size: 14px;
        cursor: pointer;
        transition: all 0.2s;
        
        &:hover {
          background: #e5e7eb;
        }
      }
    }
    
    .attachment-list {
      border: 1px solid #e5e7eb;
      border-radius: var(--border-radius);
      max-height: 120px;
      overflow-y: auto;
      
      .attachment-item {
        display: flex;
        align-items: center;
        padding: 12px;
        border-bottom: 1px solid #f3f4f6;
        
        &:last-child {
          border-bottom: none;
        }
        
        .attachment-name {
          flex: 1;
          font-size: 14px;
          color: #374151;
        }
        
        .attachment-size {
          font-size: 12px;
          color: #6b7280;
          margin-right: 12px;
        }
        
        .remove-btn {
          background: #fee2e2;
          border: none;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          color: #dc2626;
          cursor: pointer;
          font-size: 16px;
          line-height: 1;
          transition: all 0.2s;
          
          &:hover {
            background: #fecaca;
          }
        }
      }
    }
  }
  
  .send-section {
    display: flex;
    justify-content: flex-end;
    padding-top: 16px;
    border-top: 1px solid #e5e7eb;
    
    .send-btn {
      padding: 12px 24px;
      background: var(--primary-color);
      color: white;
      border: none;
      border-radius: var(--border-radius);
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      
      &:hover:not(.disabled) {
        opacity: 0.9;
        transform: translateY(-1px);
      }
      
      &.disabled {
        background: #d1d5db;
        cursor: not-allowed;
      }
    }
  }
}

// Responsive Design
@media (max-width: 768px) {
  .ww-email-composer {
    .recipient-field {
      flex-direction: column;
      align-items: stretch;
      
      .field-label {
        min-width: auto;
        padding-top: 0;
        margin-bottom: 8px;
      }
    }
    
    .cc-bcc-toggle {
      margin-left: 0;
    }
    
    .template-section {
      flex-direction: column;
      align-items: stretch;
      
      .template-select {
        min-width: auto;
      }
    }
  }
}
</style>