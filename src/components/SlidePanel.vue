<template>
    <transition name="slide-panel">
      <div v-if="visible" class="slide-panel-overlay" @click="handleOverlayClick">
        <div class="slide-panel" :class="{ 'slide-in': visible }" @click.stop>
          <!-- Header -->
          <div class="panel-header">
            <h3 class="panel-title">{{ title }}</h3>
            <button @click="$emit('close')" class="close-btn">×</button>
          </div>
          
          <!-- Content -->
          <div class="panel-content">
            <slot></slot>
          </div>
          
          <!-- Footer -->
          <div class="panel-footer" v-if="showFooter">
            <button @click="$emit('close')" class="cancel-btn">
              {{ cancelText }}
            </button>
            <button @click="handleSave" class="save-btn" :disabled="!canSave">
              {{ saveText }}
            </button>
          </div>
        </div>
      </div>
    </transition>
  </template>
  
  <script>
  export default {
    name: 'SlidePanel',
    props: {
      visible: {
        type: Boolean,
        default: false
      },
      title: {
        type: String,
        default: 'Panel'
      },
      showFooter: {
        type: Boolean,
        default: true
      },
      saveText: {
        type: String,
        default: 'Save'
      },
      cancelText: {
        type: String,
        default: 'Cancel'
      },
      canSave: {
        type: Boolean,
        default: true
      },
      closeOnOverlay: {
        type: Boolean,
        default: true
      }
    },
    emits: ['close', 'save'],
    methods: {
      handleOverlayClick() {
        if (this.closeOnOverlay) {
          this.$emit('close')
        }
      },
      
      handleSave() {
        this.$emit('save')
      },
      
      handleEscape(event) {
        if (event.key === 'Escape' && this.visible) {
          this.$emit('close')
        }
      }
    },
    
    mounted() {
      document.addEventListener('keydown', this.handleEscape)
    },
    
    beforeUnmount() {
      document.removeEventListener('keydown', this.handleEscape)
    }
  }
  </script>
  
  <style lang="scss" scoped>
  .slide-panel-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: flex-end;
    z-index: 1000;
  }
  
  .slide-panel {
    width: 500px;
    max-width: 90vw;
    height: 100vh;
    background: white;
    display: flex;
    flex-direction: column;
    box-shadow: -4px 0 10px rgba(0, 0, 0, 0.1);
    transform: translateX(100%);
    transition: transform 0.3s ease-in-out;
    
    &.slide-in {
      transform: translateX(0);
    }
    
    .panel-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px 24px;
      border-bottom: 1px solid #e5e7eb;
      background: #f9fafb;
      
      .panel-title {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
        color: #111827;
      }
      
      .close-btn {
        background: none;
        border: none;
        font-size: 24px;
        color: #6b7280;
        cursor: pointer;
        padding: 4px;
        line-height: 1;
        border-radius: 4px;
        
        &:hover {
          background: #e5e7eb;
          color: #374151;
        }
      }
    }
    
    .panel-content {
      flex: 1;
      padding: 24px;
      overflow-y: auto;
    }
    
    .panel-footer {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding: 20px 24px;
      border-top: 1px solid #e5e7eb;
      background: #f9fafb;
      
      .cancel-btn {
        padding: 10px 20px;
        background: white;
        border: 1px solid #d1d5db;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 500;
        color: #374151;
        cursor: pointer;
        transition: all 0.2s;
        
        &:hover {
          background: #f9fafb;
          border-color: #9ca3af;
        }
      }
      
      .save-btn {
        padding: 10px 20px;
        background: #3b82f6;
        border: 1px solid #3b82f6;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 500;
        color: white;
        cursor: pointer;
        transition: all 0.2s;
        
        &:hover:not(:disabled) {
          background: #2563eb;
          border-color: #2563eb;
        }
        
        &:disabled {
          background: #d1d5db;
          border-color: #d1d5db;
          cursor: not-allowed;
        }
      }
    }
  }
  
  // Transition animations
  .slide-panel-enter-active,
  .slide-panel-leave-active {
    transition: opacity 0.3s ease-in-out;
  }
  
  .slide-panel-enter-from,
  .slide-panel-leave-to {
    opacity: 0;
  }
  
  // Responsive design
  @media (max-width: 768px) {
    .slide-panel {
      width: 100vw;
      max-width: 100vw;
    }
  }
  </style>