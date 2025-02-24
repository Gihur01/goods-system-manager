<template>
    <div class="collapsible" @click="handleClick" role="button" :aria-expanded="isExpanded">
      <!-- Header displays the title -->
      <div class="header">
        {{ title }}
      </div>
      <!-- Transition wrapper for smooth expand/collapse animation -->
      <transition name="collapse">
        <!-- Content area; uses v-show so it toggles visibility -->
        <div class="content" v-show="isExpanded">
          <slot></slot>
        </div>
      </transition>
    </div>
  </template>
  
  <script>
  export default {
    name: 'Collapsible',
    props: {
      id: {
        type: [String, Number],
        required: true
      },
      title: {
        type: String,
        required: true
      },
      // Using Number (0 for collapsed, 1 for expanded) as specified.
      expanded: {
        type: Number,
        default: 0
      }
    },
    data() {
      return {
        // Convert the prop to a Boolean for internal use.
        isExpanded: this.expanded === 1
      }
    },
    methods: {
      handleClick() {
        // Emit the id when the element is clicked
        this.$emit('click', this.id);
        // Toggle the expansion state
        this.isExpanded = !this.isExpanded;
      }
    },
    watch: {
      // Optional: If you need to update the internal state when the prop changes externally.
      expanded(newVal) {
        this.isExpanded = newVal === 1;
      }
    }
  }
  </script>
  
  <style scoped>
  /* Transition classes for the collapse animation */
  .collapse-enter-active,
  .collapse-leave-active {
    transition: max-height 0.5s ease;
    overflow: hidden;
  }
  .collapse-enter,
  .collapse-leave-to {
    max-height: 0;
  }
  
  /* When expanded, we set a high max-height to accommodate content.
     Note: This is a simple trick. For variable/dynamic heights, you might need a JS-based approach. */
  .content {
    max-height: 500px;
  }
  .header {
    cursor: pointer;
    /* Additional styling as desired */
    user-select: none;
    padding: 0.5em;
    background: #eee;
  }
  .collapsible {
    border: 1px solid #ddd;
    margin-bottom: 1em;
  }
  </style>
  