<template>
  <div class="modal" v-if="isVisible">
    <div class="modal-content">
      <span class="close-button" @click="close">
             <g-image
             alt="close"
             src="~/assets/img/icons/close.svg"
             class="object-contain"
             height="15"
             width="15"
         />

      </span>
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      isVisible: false,
    };
  },
  methods: {
    open() {
      this.isVisible = true;
    },
    close() {
      this.isVisible = false;
    },
  },
};
</script>

<style lang="scss">

@import './../assets/style/variables';

.modal {
  display: flex;
  justify-content: center;
  align-items: center;
  position: fixed;
  flex-direction: column;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);

}
.modal-content {
  background-color: white;
  padding: 40px 70px ;
  border-radius: 5px;
  position: relative;
  max-width: 90%;
  align-self: center;
  justify-self: center;
  @media (max-width: #{$md}) {

    overflow: scroll;
    align-self: center;
    justify-self: center;
    padding: 40px 60px 40px 35px ;
    max-height: 100vh;
  }
}
.close-button {
  position: absolute;
  top: 10px;
  right: 10px;
  cursor: pointer;
}
</style>