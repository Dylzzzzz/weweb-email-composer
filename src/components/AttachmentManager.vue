<template>
    <div class="attachment-manager">
      <!-- Upload Dropzone -->
      <div 
        class="dropzone"
        :class="{ 
          'dragover': isDragOver,
          'error': uploadError 
        }"
        @drop="handleDrop"
        @dragover.prevent="handleDragOver"
        @dragleave="handleDragLeave"
        @click="triggerFileInput"
      >
        <input
          ref="fileInput"
          type="file"
          multiple
          :accept="acceptedFileTypes"
          @change="handleFileSelect"
          style="display: none"
        />
        
        <div class="dropzone-content">
          <div class="upload-icon">📁</div>
          <p class="upload-text">
            <span v-if="!isDragOver">
              Drop files here or <strong>click to browse</strong>
            </span>
            <span v-else class="drag-text">
              Drop files to upload
            </span>
          </p>
          <p class="upload-info">
            Max size: {{ maxSize }}MB • 
            Allowed: {{ allowedTypesText }}
          </p>
        </div>
      </div>
  
      <!-- Upload Error -->
      <div v-if="uploadError" class="error-message">
        {{ uploadError }}
      </div>
  
      <!-- File List -->
      <div v-if="attachments.length > 0" class="file-list">
        <h4>Attached Files ({{ attachments.length }})</h4>
        
        <div class="file-items">
          <div 
            v-for="(file, index) in attachments" 
            :key="file.id || index"
            class="file-item"
            :class="{ 'uploading': file.uploading }"
          >
            <!-- File Icon -->
            <div class="file-icon">
              {{ getFileIcon(file.type || file.name) }}
            </div>
            
            <!-- File Info -->
            <div class="file-info">
              <div class="file-name">{{ file.name }}</div>
              <div class="file-meta">
                {{ formatFileSize(file.size) }}
                <span v-if="file.type"> • {{ file.type }}</span>
              </div>
            </div>
            
            <!-- Upload Progress -->
            <div v-if="file.uploading" class="upload-progress">
              <div class="progress-bar">
                <div 
                  class="progress-fill" 
                  :style="{ width: file.progress + '%' }"
                ></div>
              </div>
              <span class="progress-text">{{ file.progress }}%</span>
            </div>
            
            <!-- File Actions -->
            <div class="file-actions">
              <button 
                v-if="!file.uploading"
                @click="previewFile(file)" 
                class="action-btn preview-btn"
                title="Preview"
              >
                👁️
              </button>
              <button 
                @click="removeFile(index)" 
                class="action-btn remove-btn"
                title="Remove"
              >
                🗑️
              </button>
            </div>
          </div>
        </div>
      </div>
  
      <!-- File Preview Modal -->
      <div v-if="previewFile" class="preview-modal" @click="closePreview">
        <div class="preview-content" @click.stop>
          <div class="preview-header">
            <h4>{{ previewFile.name }}</h4>
            <button @click="closePreview" class="close-btn">×</button>
          </div>
          
          <!-- Image Preview -->
          <div v-if="isImageFile(previewFile)" class="image-preview">
            <img :src="previewFile.url || previewFile.dataUrl" :alt="previewFile.name" />
          </div>
          
          <!-- Text/Code Preview -->
          <div v-else-if="isTextFile(previewFile)" class="text-preview">
            <pre>{{ previewFile.content || 'Preview not available' }}</pre>
          </div>
          
          <!-- Generic File Info -->
          <div v-else class="file-details">
            <div class="detail-row">
              <strong>Name:</strong> {{ previewFile.name }}
            </div>
            <div class="detail-row">
              <strong>Size:</strong> {{ formatFileSize(previewFile.size) }}
            </div>
            <div class="detail-row">
              <strong>Type:</strong> {{ previewFile.type || 'Unknown' }}
            </div>
            <div class="detail-row">
              <strong>Last Modified:</strong> {{ formatDate(previewFile.lastModified) }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'AttachmentManager',
    props: {
      modelValue: {
        type: Array,
        default: () => []
      },
      maxSize: {
        type: Number,
        default: 25 // MB
      },
      allowedTypes: {
        type: Array,
        default: () => ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.jpg', '.png', '.gif']
      }
    },
    emits: ['update:modelValue'],
    data() {
      return {
        isDragOver: false,
        uploadError: null,
        previewFileData: null
      }
    },
    computed: {
      attachments: {
        get() {
          return this.modelValue || []
        },
        set(value) {
          this.$emit('update:modelValue', value)
        }
      },
      acceptedFileTypes() {
        return this.allowedTypes.join(',')
      },
      allowedTypesText() {
        return this.allowedTypes.map(type => type.replace('.', '')).join(', ').toUpperCase()
      }
    },
    methods: {
      // Drag and Drop Handlers
      handleDragOver(e) {
        e.preventDefault()
        this.isDragOver = true
      },
      
      handleDragLeave() {
        this.isDragOver = false
      },
      
      handleDrop(e) {
        e.preventDefault()
        this.isDragOver = false
        const files = Array.from(e.dataTransfer.files)
        this.processFiles(files)
      },
      
      // File Input Handlers
      triggerFileInput() {
        this.$refs.fileInput.click()
      },
      
      handleFileSelect(e) {
        const files = Array.from(e.target.files)
        this.processFiles(files)
        // Clear input for reselection
        e.target.value = ''
      },
      
      // File Processing
      processFiles(files) {
        this.uploadError = null
        
        files.forEach(file => {
          if (this.validateFile(file)) {
            this.addFile(file)
          }
        })
      },
      
      validateFile(file) {
        // Check file size
        if (file.size > this.maxSize * 1024 * 1024) {
          this.uploadError = `File "${file.name}" exceeds maximum size of ${this.maxSize}MB`
          return false
        }
        
        // Check file type
        const fileExtension = '.' + file.name.split('.').pop().toLowerCase()
        if (!this.allowedTypes.includes(fileExtension)) {
          this.uploadError = `File type "${fileExtension}" is not allowed`
          return false
        }
        
        // Check for duplicates
        if (this.attachments.some(existing => existing.name === file.name && existing.size === file.size)) {
          this.uploadError = `File "${file.name}" is already attached`
          return false
        }
        
        return true
      },
      
      addFile(file) {
        const fileObj = {
          id: Date.now() + Math.random(),
          name: file.name,
          size: file.size,
          type: file.type,
          lastModified: file.lastModified,
          file: file, // Keep reference to original File object
          uploading: false,
          progress: 0
        }
        
        // Generate preview for images
        if (this.isImageFile(fileObj)) {
          this.generateImagePreview(file, fileObj)
        }
        
        this.attachments = [...this.attachments, fileObj]
      },
      
      generateImagePreview(file, fileObj) {
        const reader = new FileReader()
        reader.onload = (e) => {
          fileObj.dataUrl = e.target.result
        }
        reader.readAsDataURL(file)
      },
      
      removeFile(index) {
        const newAttachments = [...this.attachments]
        newAttachments.splice(index, 1)
        this.attachments = newAttachments
      },
      
      // File Preview
      previewFile(file) {
        this.previewFileData = file
        
        // Load text content for text files
        if (this.isTextFile(file) && !file.content) {
          const reader = new FileReader()
          reader.onload = (e) => {
            file.content = e.target.result
          }
          reader.readAsText(file.file)
        }
      },
      
      closePreview() {
        this.previewFileData = null
      },
      
      // File Type Helpers
      getFileIcon(fileType) {
        const type = fileType.toLowerCase()
        
        if (type.includes('image')) return '🖼️'
        if (type.includes('pdf')) return '📄'
        if (type.includes('word') || type.includes('doc')) return '📝'
        if (type.includes('excel') || type.includes('sheet')) return '📊'
        if (type.includes('powerpoint') || type.includes('presentation')) return '📽️'
        if (type.includes('video')) return '🎥'
        if (type.includes('audio')) return '🎵'
        if (type.includes('zip') || type.includes('rar')) return '📦'
        if (type.includes('text') || type.includes('code')) return '📄'
        
        return '📎'
      },
      
      isImageFile(file) {
        return file.type?.startsWith('image/') || 
               /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(file.name)
      },
      
      isTextFile(file) {
        return file.type?.startsWith('text/') || 
               /\.(txt|json|xml|css|js|html|md)$/i.test(file.name)
      },
      
      // Utility Methods
      formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes'
        const k = 1024
        const sizes = ['Bytes', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
      },
      
      formatDate(timestamp) {
        return new Date(timestamp).toLocaleDateString() + ' ' + 
               new Date(timestamp).toLocaleTimeString()
      }
    }
  }
  </script>
  
  <style scoped>
  .attachment-manager {
    padding: 20px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }
  
  .dropzone {
    border: 2px dashed #d1d5db;
    border-radius: 8px;
    padding: 40px 20px;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s ease;
    background: #f9fafb;
  }
  
  .dropzone:hover,
  .dropzone.dragover {
    border-color: #3b82f6;
    background: #eff6ff;
  }
  
  .dropzone.error {
    border-color: #ef4444;
    background: #fef2f2;
  }
  
  .upload-icon {
    font-size: 48px;
    margin-bottom: 16px;
  }
  
  .upload-text {
    font-size: 16px;
    margin-bottom: 8px;
    color: #374151;
  }
  
  .drag-text {
    color: #3b82f6;
    font-weight: 600;
  }
  
  .upload-info {
    font-size: 14px;
    color: #6b7280;
    margin: 0;
  }
  
  .error-message {
    background: #fef2f2;
    border: 1px solid #fecaca;
    color: #dc2626;
    padding: 12px;
    border-radius: 6px;
    margin-top: 16px;
  }
  
  .file-list {
    margin-top: 24px;
  }
  
  .file-list h4 {
    margin: 0 0 16px 0;
    color: #374151;
  }
  
  .file-items {
    space-y: 8px;
  }
  
  .file-item {
    display: flex;
    align-items: center;
    padding: 12px;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    background: #fff;
    margin-bottom: 8px;
  }
  
  .file-item.uploading {
    background: #f0f9ff;
    border-color: #3b82f6;
  }
  
  .file-icon {
    font-size: 24px;
    margin-right: 12px;
    flex-shrink: 0;
  }
  
  .file-info {
    flex: 1;
    min-width: 0;
  }
  
  .file-name {
    font-weight: 500;
    color: #374151;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .file-meta {
    font-size: 14px;
    color: #6b7280;
    margin-top: 2px;
  }
  
  .upload-progress {
    display: flex;
    align-items: center;
    margin: 0 16px;
    min-width: 120px;
  }
  
  .progress-bar {
    flex: 1;
    height: 6px;
    background: #e5e7eb;
    border-radius: 3px;
    overflow: hidden;
    margin-right: 8px;
  }
  
  .progress-fill {
    height: 100%;
    background: #3b82f6;
    transition: width 0.3s ease;
  }
  
  .progress-text {
    font-size: 12px;
    color: #3b82f6;
    font-weight: 500;
  }
  
  .file-actions {
    display: flex;
    gap: 8px;
  }
  
  .action-btn {
    background: none;
    border: none;
    font-size: 16px;
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
    transition: background 0.2s;
  }
  
  .action-btn:hover {
    background: #f3f4f6;
  }
  
  .remove-btn:hover {
    background: #fef2f2;
  }
  
  .preview-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.75);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }
  
  .preview-content {
    background: #fff;
    border-radius: 8px;
    max-width: 90vw;
    max-height: 90vh;
    overflow: auto;
  }
  
  .preview-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid #e5e7eb;
  }
  
  .preview-header h4 {
    margin: 0;
    color: #374151;
  }
  
  .close-btn {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #6b7280;
    padding: 0;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
  }
  
  .close-btn:hover {
    background: #f3f4f6;
  }
  
  .image-preview {
    padding: 20px;
    text-align: center;
  }
  
  .image-preview img {
    max-width: 100%;
    max-height: 70vh;
    border-radius: 4px;
  }
  
  .text-preview {
    padding: 20px;
    max-height: 70vh;
    overflow: auto;
  }
  
  .text-preview pre {
    margin: 0;
    white-space: pre-wrap;
    font-family: 'Monaco', 'Menlo', monospace;
    font-size: 14px;
    line-height: 1.5;
  }
  
  .file-details {
    padding: 20px;
  }
  
  .detail-row {
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 1px solid #f3f4f6;
  }
  
  .detail-row:last-child {
    border-bottom: none;
    margin-bottom: 0;
  }
  </style>