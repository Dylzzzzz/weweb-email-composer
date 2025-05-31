<template>
    <div class="recipient-input-container">
      <!-- Selected Recipients -->
      <div class="selected-recipients" v-if="modelValue?.length">
        <div 
          v-for="(recipient, index) in modelValue" 
          :key="getRecipientKey(recipient, index)"
          class="recipient-chip"
        >
          <span class="recipient-text">
            {{ formatRecipientDisplay(recipient) }}
          </span>
          <button @click="removeRecipient(index)" class="remove-chip">×</button>
        </div>
      </div>
      
      <!-- Input Field -->
      <div class="input-container">
        <input
          ref="inputField"
          v-model="inputValue"
          type="text"
          class="recipient-input"
          :placeholder="placeholder"
          @input="handleInput"
          @keydown="handleKeydown"
          @focus="showDropdown = true"
          @blur="handleBlur"
          @paste="handlePaste"
        />
        
        <!-- Dropdown -->
        <div v-if="showDropdown && (filteredRecipients.length || allowCreate)" class="dropdown">
          <!-- Create Option -->
          <div 
            v-if="allowCreate && inputValue.trim()" 
            class="dropdown-item create-item"
            @mousedown.prevent="handleCreateNew"
          >
            <span class="create-icon">+</span>
            Create "{{ getCreateDisplayText() }}"
          </div>
          
          <!-- Existing Recipients -->
          <div
            v-for="(recipient, index) in filteredRecipients"
            :key="getRecipientKey(recipient, index)"
            class="dropdown-item"
            :class="{ highlighted: highlightedIndex === (allowCreate ? index + 1 : index) }"
            @mousedown.prevent="selectRecipient(recipient)"
          >
            <div class="recipient-info">
              <div class="recipient-name">{{ getRecipientName(recipient) }}</div>
              <div class="recipient-email">{{ getRecipientEmail(recipient) }}</div>
            </div>
          </div>
          
          <!-- No Results -->
          <div v-if="!filteredRecipients.length && !allowCreate" class="dropdown-item no-results">
            No recipients found
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'RecipientInput',
    props: {
      modelValue: {
        type: Array,
        default: () => []
      },
      recipientsData: {
        type: Array,
        default: () => []
      },
      allowCreate: {
        type: Boolean,
        default: true
      },
      createFields: {
        type: Array,
        default: () => []
      },
      placeholder: {
        type: String,
        default: 'Enter email address or name...'
      }
    },
    emits: ['update:modelValue', 'create-recipient', 'slide-panel'],
    data() {
      return {
        inputValue: '',
        showDropdown: false,
        highlightedIndex: -1,
        blurTimeout: null
      }
    },
    computed: {
      filteredRecipients() {
        if (!this.inputValue.trim()) {
          return this.recipientsData.slice(0, 10) // Show first 10 when no filter
        }
        
        const searchTerm = this.inputValue.toLowerCase()
        return this.recipientsData.filter(recipient => {
          const name = this.getRecipientName(recipient).toLowerCase()
          const email = this.getRecipientEmail(recipient).toLowerCase()
          return name.includes(searchTerm) || email.includes(searchTerm)
        }).slice(0, 10)
      }
    },
    methods: {
      handleInput() {
        this.showDropdown = true
        this.highlightedIndex = -1
      },
      
      handleKeydown(event) {
        if (!this.showDropdown) return
        
        const totalItems = this.filteredRecipients.length + (this.allowCreate && this.inputValue.trim() ? 1 : 0)
        
        switch (event.key) {
          case 'ArrowDown':
            event.preventDefault()
            this.highlightedIndex = Math.min(this.highlightedIndex + 1, totalItems - 1)
            break
            
          case 'ArrowUp':
            event.preventDefault()
            this.highlightedIndex = Math.max(this.highlightedIndex - 1, -1)
            break
            
          case 'Enter':
            event.preventDefault()
            if (this.highlightedIndex === 0 && this.allowCreate && this.inputValue.trim()) {
              this.handleCreateNew()
            } else if (this.highlightedIndex >= 0) {
              const adjustedIndex = this.allowCreate && this.inputValue.trim() ? this.highlightedIndex - 1 : this.highlightedIndex
              if (adjustedIndex >= 0 && adjustedIndex < this.filteredRecipients.length) {
                this.selectRecipient(this.filteredRecipients[adjustedIndex])
              }
            } else if (this.inputValue.includes('@')) {
              // Try to parse as email
              this.handleEmailInput()
            }
            break
            
          case 'Escape':
            this.showDropdown = false
            this.highlightedIndex = -1
            break
            
          case ',':
          case ';':
            event.preventDefault()
            if (this.inputValue.includes('@')) {
              this.handleEmailInput()
            }
            break
        }
      },
      
      handleBlur() {
        // Delay hiding dropdown to allow for click events
        this.blurTimeout = setTimeout(() => {
          this.showDropdown = false
          this.highlightedIndex = -1
          
          // Try to process input if it looks like an email
          if (this.inputValue.includes('@')) {
            this.handleEmailInput()
          }
        }, 150)
      },
      
      handlePaste(event) {
        // Handle pasted content like "Dylan Halliday <dylan@test.com>"
        event.preventDefault()
        const pastedText = event.clipboardData.getData('text')
        
        if (pastedText.includes('<') && pastedText.includes('>')) {
          this.parseNameEmail(pastedText)
        } else if (pastedText.includes('@')) {
          this.inputValue = pastedText
          setTimeout(() => this.handleEmailInput(), 0)
        } else {
          this.inputValue = pastedText
        }
      },
      
      parseNameEmail(text) {
        // Parse "Dylan Halliday <dylan@test.com>" format
        const match = text.match(/^(.+?)\s*<(.+?)>$/)
        if (match) {
          const [, fullName, email] = match
          const nameParts = fullName.trim().split(' ')
          const firstName = nameParts[0] || ''
          const lastName = nameParts.slice(1).join(' ') || ''
          
          const recipient = {
            name: fullName.trim(),
            firstName,
            lastName,
            email: email.trim(),
            id: Date.now() // Temporary ID
          }
          
          this.addRecipient(recipient)
          this.inputValue = ''
        } else {
          this.inputValue = text
        }
      },
      
      handleEmailInput() {
        const email = this.inputValue.trim()
        if (this.isValidEmail(email)) {
          // Check if recipient already exists
          const existing = this.recipientsData.find(r => 
            this.getRecipientEmail(r).toLowerCase() === email.toLowerCase()
          )
          
          if (existing) {
            this.selectRecipient(existing)
          } else {
            // Create basic recipient object
            const recipient = {
              name: email.split('@')[0],
              email: email,
              id: Date.now()
            }
            this.addRecipient(recipient)
            this.inputValue = ''
          }
        }
      },
      
      handleCreateNew() {
        const inputText = this.inputValue.trim()
        let recipientData = {}
        
        if (inputText.includes('<') && inputText.includes('>')) {
          // Parse "Name <email>" format
          const match = inputText.match(/^(.+?)\s*<(.+?)>$/)
          if (match) {
            const [, name, email] = match
            const nameParts = name.trim().split(' ')
            recipientData = {
              firstName: nameParts[0] || '',
              lastName: nameParts.slice(1).join(' ') || '',
              email: email.trim()
            }
          }
        } else if (inputText.includes('@')) {
          // Just email
          recipientData = {
            firstName: inputText.split('@')[0],
            email: inputText
          }
        } else {
          // Just name
          const nameParts = inputText.split(' ')
          recipientData = {
            firstName: nameParts[0] || '',
            lastName: nameParts.slice(1).join(' ') || ''
          }
        }
        
        this.$emit('create-recipient', recipientData)
        this.$emit('slide-panel', 'create', recipientData)
        this.inputValue = ''
        this.showDropdown = false
      },
      
      selectRecipient(recipient) {
        this.addRecipient(recipient)
        this.inputValue = ''
        this.showDropdown = false
      },
      
      addRecipient(recipient) {
        // Check if already selected
        const isAlreadySelected = this.modelValue.some(r => 
          this.getRecipientId(r) === this.getRecipientId(recipient) ||
          this.getRecipientEmail(r).toLowerCase() === this.getRecipientEmail(recipient).toLowerCase()
        )
        
        if (!isAlreadySelected) {
          this.$emit('update:modelValue', [...this.modelValue, recipient])
        }
      },
      
      removeRecipient(index) {
        const newValue = [...this.modelValue]
        newValue.splice(index, 1)
        this.$emit('update:modelValue', newValue)
      },
      
      // Utility Methods
      getRecipientKey(recipient, index) {
        return this.getRecipientId(recipient) || `recipient-${index}`
      },
      
      getRecipientId(recipient) {
        return recipient.id || recipient._id
      },
      
      getRecipientName(recipient) {
        return recipient.name || 
               `${recipient.firstName || ''} ${recipient.lastName || ''}`.trim() ||
               recipient.email?.split('@')[0] || 
               'Unknown'
      },
      
      getRecipientEmail(recipient) {
        return recipient.email || ''
      },
      
      formatRecipientDisplay(recipient) {
        const name = this.getRecipientName(recipient)
        const email = this.getRecipientEmail(recipient)
        return email ? `${name} <${email}>` : name
      },
      
      getCreateDisplayText() {
        const text = this.inputValue.trim()
        if (text.includes('<') && text.includes('>')) {
          return text
        } else if (text.includes('@')) {
          return text
        } else {
          return text
        }
      },
      
      isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return emailRegex.test(email)
      }
    },
    
    beforeUnmount() {
      if (this.blurTimeout) {
        clearTimeout(this.blurTimeout)
      }
    }
  }
  </script>
  
  <style lang="scss" scoped>
  .recipient-input-container {
    position: relative;
    flex: 1;
    
    .selected-recipients {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 8px;
      
      .recipient-chip {
        display: flex;
        align-items: center;
        background: #e0e7ff;
        color: #3730a3;
        padding: 4px 8px;
        border-radius: 16px;
        font-size: 14px;
        gap: 6px;
        
        .recipient-text {
          max-width: 200px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        
        .remove-chip {
          background: none;
          border: none;
          color: #6366f1;
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
            background: rgba(99, 102, 241, 0.2);
          }
        }
      }
    }
    
    .input-container {
      position: relative;
      
      .recipient-input {
        width: 100%;
        padding: 12px;
        border: 1px solid #d1d5db;
        border-radius: 6px;
        font-size: 16px;
        
        &:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
      }
      
      .dropdown {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: white;
        border: 1px solid #d1d5db;
        border-top: none;
        border-radius: 0 0 6px 6px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        max-height: 200px;
        overflow-y: auto;
        z-index: 1000;
        
        .dropdown-item {
          padding: 12px;
          cursor: pointer;
          border-bottom: 1px solid #f3f4f6;
          
          &:last-child {
            border-bottom: none;
          }
          
          &:hover,
          &.highlighted {
            background: #f9fafb;
          }
          
          &.create-item {
            color: #059669;
            font-weight: 500;
            background: #ecfdf5;
            
            &:hover,
            &.highlighted {
              background: #d1fae5;
            }
            
            .create-icon {
              font-weight: bold;
              margin-right: 8px;
              font-size: 16px;
            }
          }
          
          &.no-results {
            color: #6b7280;
            font-style: italic;
            cursor: default;
            
            &:hover {
              background: transparent;
            }
          }
          
          .recipient-info {
            .recipient-name {
              font-weight: 500;
              color: #374151;
            }
            
            .recipient-email {
              font-size: 14px;
              color: #6b7280;
              margin-top: 2px;
            }
          }
        }
      }
    }
  }
  </style>