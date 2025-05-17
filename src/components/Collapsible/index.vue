<template>
    <div class="collapsible">
      <div 
        class="header"
        @click="$emit('click',id)" 
      >
      <!-- key is the id of current component, id may be used as external id -->
      <slot name="title">
        <!-- Fallback content if no title slot is provided -->
        <span class="default-title">{{ title }}</span>
      </slot>
      </div>
      <div
        ref="content"
        class="collapsible-content"
        :style="contentStyle"
      >
      <div class="content">
        <!-- Main content slot -->
        <slot></slot>
      </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'Collapsible',
    props: {
      id: {
        // type: [String, Number],
        required: true
      },
      title: {
        // type: String,
        // required: true
      },
      expanded: {
        // type: Number,
        // validator: value => [0, 1].includes(value),
        required: true
      }
    },
    data() {
      return {
        contentHeight: 0
      };
    },
    computed: {
      contentStyle() {
        return {
          'max-height': this.expanded ? `${this.contentHeight}px` : '0'
        };
      }
    },
    mounted() {
      this.updateHeight();
    },
    updated() {
      this.updateHeight();
    },
    methods: {
      updateHeight() {
        this.contentHeight = this.$refs.content.scrollHeight;
      }
    }
  };
  </script>
  
  <style scoped>
.collapsible {
  display: flex;
  flex-direction: column;
  height: min-content; /* Crucial for grid layout */
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  overflow: hidden; /* Contains the expanding content */
}
  
  .header {
    padding: 1rem;
    cursor: pointer;
    background-color: #f8f9fa;
    transition: background-color 0.2s;
  }
  
  .header:hover {
    background-color: #e9ecef;
  }
  
  .collapsible-content {
  overflow: hidden;
  transition: max-height 0.3s ease-out;
  background: white;
  z-index: 1; /* Ensures content appears above other grid items */
  position: relative;
}
  .content {
    padding: 1rem;
    border-top: 1px solid #e0e0e0;
  }
  </style>