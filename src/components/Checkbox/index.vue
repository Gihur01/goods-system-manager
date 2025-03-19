
<template>
  <input 
    type="checkbox" 
    :id="checkboxId" 
    :checked="checked" 
    @change="emitChange" 
  />
</template>

<script>
export default {
  props: ['id', 'checked'],
  data(){
    return {
        checkboxId:null,
    }
  },
  methods: {
    emitChange(newValue) {
      this.$emit('change', { id: this.id, value: newValue });
    }
  }
};
</script>