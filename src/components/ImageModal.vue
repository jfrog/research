<template>
  <div v-if="visible" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <button class="modal-close-button" @click="$emit('close')">
        &times;
      </button>
      <img :srcset="imageUrl" alt="Full Preview" class="modal-image"/>
    </div>
  </div>
</template>

<script>
// No imports needed for standard Options API features

export default {
  // 1. Define component name
  name: 'ImageModal',

  // 2. Define props
  props: {
    visible: {
      type: Boolean,
      required: true
    },
    imageUrl: {
      type: String,
      default: ''
    }
  },

  // 3. Define emitted events (Optional, but good practice in Vue 2)
  emits: ['close'],

};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.9); /* Dark, semi-transparent background */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999; /* Ensure it's on top of everything */
}

.modal-content {
  position: relative;
  max-width: 90%;
  max-height: 90%;
}

.modal-image {
  max-width: 100%;
  max-height: 80vh; /* Viewport height for a better fit */
  display: block;
}

.modal-close-button {
  position: absolute;
  top: 0px;
  right: 0px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  border-radius: 50%;
  font-size: 1.5rem;
  padding: 0 1rem;
  cursor: pointer;
  z-index: 10000;
  width: 30px;
  height: 30px;
  display: flex
;
  justify-content: center;
  align-items: center;
}
</style>