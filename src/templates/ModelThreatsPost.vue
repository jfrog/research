<template>
  <Layout>
    <div class="container mt-posts pt-5 pb-10">
      <g-link class="hover:text-jfrog-green transition-all" to="/model-threats/">
        < Back
      </g-link>
      <div class="mt-posts-details">
        <div class="title" id="main-title">{{ $page.modelThreatsPost.title }}</div>
        <div class="description mb-3">{{ $page.modelThreatsPost.description }}</div>
        <button class="modal-btn" @click="showPopup">
          <span>
          Explore more info
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9.61158 8.00418L5.48844 4.12549C5.39748 4.04009 5.34893 3.93527 5.34278 3.81104C5.33647 3.68697 5.38502 3.57636 5.48844 3.47923C5.5917 3.38195 5.7062 3.33331 5.83196 3.33331C5.95771 3.33331 6.07221 3.38195 6.17547 3.47923L10.437 7.48763C10.5216 7.5674 10.5811 7.64885 10.6154 7.73197C10.6496 7.81509 10.6666 7.90583 10.6666 8.00418C10.6666 8.10252 10.6496 8.19326 10.6154 8.27638C10.5811 8.3595 10.5216 8.44095 10.437 8.52073L6.17547 12.5291C6.08467 12.6147 5.97325 12.6603 5.84118 12.6661C5.70928 12.6721 5.5917 12.6264 5.48844 12.5291C5.38502 12.432 5.33331 12.3243 5.33331 12.206C5.33331 12.0877 5.38502 11.98 5.48844 11.8829L9.61158 8.00418Z" fill="#3EB065"/>
          </svg>
            </span>
        </button>

      </div>
      <div class="mt-posts-content">
        <PostContentMenu :content="$page.modelThreatsPost.content"/>
        <PostContent :content="$page.modelThreatsPost.content"/>
      </div>
      <button class="modal-btn mt-5" @click="showPopup">
          <span>
          Explore more info
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9.61158 8.00418L5.48844 4.12549C5.39748 4.04009 5.34893 3.93527 5.34278 3.81104C5.33647 3.68697 5.38502 3.57636 5.48844 3.47923C5.5917 3.38195 5.7062 3.33331 5.83196 3.33331C5.95771 3.33331 6.07221 3.38195 6.17547 3.47923L10.437 7.48763C10.5216 7.5674 10.5811 7.64885 10.6154 7.73197C10.6496 7.81509 10.6666 7.90583 10.6666 8.00418C10.6666 8.10252 10.6496 8.19326 10.6154 8.27638C10.5811 8.3595 10.5216 8.44095 10.437 8.52073L6.17547 12.5291C6.08467 12.6147 5.97325 12.6603 5.84118 12.6661C5.70928 12.6721 5.5917 12.6264 5.48844 12.5291C5.38502 12.432 5.33331 12.3243 5.33331 12.206C5.33331 12.0877 5.38502 11.98 5.48844 11.8829L9.61158 8.00418Z" fill="#3EB065"/>
          </svg>
            </span>
      </button>
    </div>
    <Modal ref="popup">
      <h2 class="modal-title">Explore even more malicious packages</h2>
      <div class="modal-container">
        <div class="modal-left">
        <h3 class="modal-sub-title">Platform Tour</h3>
          <div>
            <ul>
              <li>No setup required </li>
              <li>Populated with sample data</li>
              <li>Optional self-guided tours</li>
              <li>Explore vulnerabilities, malicious packages and leaked secrets</li>

            </ul>

            <p class="modal-note">For viewing JFrog functionality in action with minimal upfront investment.</p>
          </div>
        </div>
        <div class="modal-hr"></div>
        <div class="modal-right">
          <h3 class="modal-sub-title">Request a Free Trial</h3>
          <div>
            <ul>
              <li>Get access to additional in-depth information on each malicious model </li>
              <li>Scan for malicious activity in local model files</li>
              <li>Identify malicious packages in other software repositories, such as npm, Python and NuGet</li>
            </ul>

          </div>
          <div>
             <form id="mktoForm_6946"></form>
            <div id="mktoForm_6946_ty">
              <div class="modal-sub-title" > Thank you ! </div>

            </div>
          </div>
        </div>
      </div>

    </Modal>
  </Layout>

</template>

<script>
import PostContent from '~/components/post/ModelThreatsPostContent.vue';
import PostContentMenu from '~/components/post/ModelThreatsPostContentMenu.vue';
import Modal from '~/components/Modal.vue';

export default {
  name: "ModelThreatsPost",
  components: {
    PostContent,
    PostContentMenu,
    Modal,

  },
  metaInfo() {
    const post = this.$page.modelThreatsPost;
    return {
      title: post.title,
      meta: [
        {name: "title", content: post.title},
        {name: "description", content: post.description},
      ],
    };
  },

  methods: {
    showPopup() {
      this.$refs.popup.open();
      this.initializeForm();
    },
    hidePopup() {
      this.$refs.popup.close();
    },
    loadMarketoForm() {
      // Check if MktoForms2 is already loaded to prevent reloading
      if (window.MktoForms2) {
        this.initializeForm();
      } else {
        this.addMktoScript();
      }
    },
    addMktoScript() {
      const script = document.createElement('script');
      script.src = "//leap.jfrog.com/js/forms2/js/forms2.min.js"; // Update this URL if needed
      script.async = true; // Load script asynchronously
      script.onload = this.initializeForm; // Initialize form after script loads
      document.body.appendChild(script);
    },
    initializeForm() {
      window.MktoForms2.loadForm("//leap.jfrog.com", "256-FNZ-187", 6946,
          function (form)  {
        form.onSuccess(() => {
          // Push data to the data layer
          if (typeof dataLayer !== 'undefined') {
            dataLayer.push({
              'formName': 'Research',
              'event': 'book a demo'
            });
          }

          // Reset the form
          document.getElementById("mktoForm_6946").reset();

          // Change button text
          const button = document.getElementById("mktoForm_6946").getElementsByClassName('mktoButton')[0];
          if (button) {
            button.innerText = 'Submit';
          }

          document.getElementById("mktoForm_6946_ty").style.display="flex";
          document.getElementById("mktoForm_6946").style.display='none';
          return false; // Prevent normal form submission
        });
      }
      );
    }

  },
  mounted() {
    this.loadMarketoForm();
  },

};
</script>

<page-query>
query modelThreatsPost($id: ID!) {
modelThreatsPost(id: $id) {
title
path
content
description
}
}
</page-query>

<static-query>
query {
metadata {
baseURL
}
}
</static-query>

<style lang="scss">
@import './../assets/style/variables';

.mt-posts-details {
  display: flex;
  justify-content: flex-start;
  flex-direction: column;
  text-align: left;
  color: black;
  width: 100%;
  border-bottom: 1px solid black;
  padding-left: 232px;
  @media (max-width: #{$sm}) {

    max-width: 100%;
  }
  .title {
    font-size: 36px;
    font-weight: bold;
  }


  .description {
    font-size: 16px;
    font-weight: normal;
  }
}
.modal-btn{
  width: 173px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1.5px solid #3EB065;
  border-radius: 4px;
  color: #3EB065;
  font-size: 14px;
  font-weight: 600;
  line-height: 1;
  margin-bottom: 48px;
  position: relative;

  span{
    display: flex;
    transition: all 200ms ease-in-out;


  }
  &:hover span{
    transform: translateX(-2px);
    transition: all 200ms ease-in-out;


  }
}
.mt-posts-content {
  display: grid;
  grid-template-columns: 187px 1fr;
  gap: 42px;
  position: relative;
  @media (max-width: #{$md}) {
    display: flex;
    max-width: 100%;
  }

}

.modal-container{
  display: flex;

  .modal-right{
    width: 543px;
  }
  .modal-left{
    width: 390px;
  }

  .modal-sub-title{
    color: #40BE46;
    font-size: 36px;
    font-weight: bold;
    margin-bottom: 24px;
  }

  .modal-hr{
    height: 100%;
    background-color: #5E6D81;
    position: relative;
    min-height: 590px;
    width: 1px;
    margin: 0px 64px;

    &:after{

      content: "OR";
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #5E6D81;
      border-radius: 50px;
      height: 54px;
      width: 50px;
      text-align: center;
      position: absolute;
      top:203px;
      left:50%;
      transform: translateX(-50%);
    }
  }


  ul {
    list-style-type: none; /* Remove default bullets */
    padding: 0;
  }
  li {
    position: relative;
    padding-left: 30px;
    margin-bottom: 10px;
  }

  li::after {
    content: '';
    background-image: url('data:image/svg+xml;charset=utf-8,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22M18.1389%205.46433L16.065%203.5L7.40388%2012.0775L4.26321%207.58282L1.86108%209.15814L6.98985%2016.5L6.99358%2016.4964L6.99607%2016.5L18.1389%205.46433Z%22%20fill%3D%22%2340BE46%22/%3E%3C/svg%3E'); /* Data URL here */
    background-size: 20px 20px;
    background-repeat: no-repeat;
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 20px;
    height: 20px;
  }

  .modal-note{
    color: #0C1D37;
    font-size: 14px;
    font-style: italic;
    max-width: 286px;
    text-align: center;
    margin-top: 24px;
    justify-self: center;
  }

}

.modal-title{

  color: #0C1D37;
  font-size: 27px;
  font-weight: bold;
  line-height: 1.4;
  text-align: center;
  margin-bottom: 56px;

}

#mktoForm_6946_ty{
  display: none;
  min-height: 276px;
  justify-content: center;
  align-items: center;
}

#mktoForm_6946{

  width: 100% !important;
  padding: 0 !important;
  margin: 0 !important;
  display: flex;
  margin-left: 34px !important;
  min-height: 276px;
  flex-wrap: wrap;
  align-items: center;
  max-width: 460px;
  position: relative;
  justify-content: space-between;
  background-color: transparent;
  overflow: hidden;
  .mktoFormRow:nth-child(5),
  .mktoFormRow:nth-child(3),
  .mktoFormRow:nth-child(1),
  .mktoFormRow:nth-child(2) .mktoFormCol,
  .mktoFormRow:nth-child(0) {
    max-width: 48.107%;
  }
  .mktoFormRow{
    order: 0;
  }


  .mktoFormRow:nth-child(2){
    display: flex;
    order: 0;
    justify-content: space-between;
    align-items: center;
  }
  .mktoFormRow:nth-child(3){
    order: 1;
  }
  .mktoFormRow:nth-child(4){
    order: 3;
  }
  .mktoFormRow:nth-child(5){
    order: 2;
  }
  .mktoFormRow:nth-child(8){
    order: 4;
  }

  .mktoButtonRow {
    order: 34;
  }

  .mktoError {
    left: 0;
    bottom: -15px !important;
    width: 100%;
  }

  .mktoErrorMsg {
    background-color: transparent !important;
    color: red;
    background-image: unset;
    text-shadow: unset;
    border: none;
    box-shadow: none;
    margin: 0;
    padding: 0;
    font-size: 11px;
  }

  .mktoErrorArrow {
    display: none !important;
  }

  .mktoFormRow .mktoError {
    left: 0;
  }

  .mktoError div {
    max-width: unset;
    width: 200%;
    display: flex;
  }

   .mktoFormCol {
    width: 100% !important;
    margin-top: 6px;
  }

  .mktoFieldWrap {
    width: 100%;
  }

   #isBlank {
    min-width: 0% !important;
    max-width: 0%;
  }

   .mktoOffset,
   .mktoGutter,
   .mktoClear {
    height: 0 !important;
    overflow: hidden;
     display: none;
  }
  .mktoHtmlText{
    width: 100% !important;
  }



   a {
    color: #40BE46 !important;
    text-decoration: none;
  }

   input[type="text"],
   input[type="email"],
   textarea.mktoField,
   select.mktoField {
    border-radius: 4px !important;
    box-shadow: unset;
    padding-left: .5rem !important;
    width: 100% !important;
    border: 1px solid #C9D0E3 !important;
    background-color: transparent !important;
    height: 34px !important;
    font-size: 14px !important;
    outline-color: #C9D0E3 !important;
    outline-width: 1px !important;
    color: black !important;
  }
  textarea.mktoField{
    height: 106px !important;
    padding: 12px;
  }
   label {

    font-size: 14px !important;
    font-weight: 600 !important;
    margin-bottom: 3px !important;
    width: 100% !important;
    line-height: 22px !important;
    color: #556274 !important;
     display: flex;
     gap: 3px;
  }


 .mktoRequiredField .mktoAsterix{
    display: inline-block ;
    color: #556274;
    font-size: 14px;
  }
  input::placeholder{
    color: #5E6D81;
  }
   input:focus {
    color: #C1C1C1;
    border: 1px solid #5B5B5B !important;
    outline-color: #5B5B5B !important;
  }




   button.mktoButton {
    background: #3EB065 !important;
    margin-top: 25px;
    width: 100%;
     min-width: 100px;
    font-weight: 600 !important;
    font-size: 14px;
    height: 40px;
    letter-spacing: 0.02em;
     text-transform: capitalize !important;
    border-radius: 4px !important;

  }

   button.mktoButton:after {
     content:  url('data:image/svg+xml;charset=UTF-8,%3Csvg width%3D%226%22 height%3D%2210%22 viewBox%3D%220 0 6 10%22 fill%3D%22none%22 xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath d%3D%22M4.61152 5.00421L0.48838 1.12552C0.397424 1.04012 0.34887 0.935299 0.34272 0.811071C0.336408 0.686996 0.384962 0.576393 0.48838 0.479264C0.591637 0.381983 0.706141 0.333344 0.831894 0.333344C0.957647 0.333344 1.07215 0.381983 1.17541 0.479264L5.43693 4.48766C5.52157 4.56743 5.58105 4.64888 5.61536 4.732C5.64951 4.81513 5.66659 4.90586 5.66659 5.00421C5.66659 5.10255 5.64951 5.19329 5.61536 5.27641C5.58105 5.35953 5.52157 5.44098 5.43693 5.52076L1.17541 9.52915C1.08461 9.61471 0.973184 9.66038 0.841119 9.66617C0.709216 9.6721 0.591637 9.62643 0.48838 9.52915C0.384962 9.43202 0.333252 9.32431 0.333252 9.20602C0.333252 9.08773 0.384962 8.98002 0.48838 8.88289L4.61152 5.00421Z%22 fill%3D%22white%22/%3E%3C/svg%3E');     transition: all .25s ease-in-out;
     width: 30px;
     padding-left: 5px;
    position: relative;
   }

   button.mktoButton:not(:disabled):hover:after {
    padding-left: 8px;
     transition: all ease-in-out 200ms;

  }

   button.mktoButton:disabled:after {
    content: '';
     background-image: none;
  }

   .mktoFormRow {
    width: 100%;
  }



  @media (min-width: 768px) {
    max-height: 1000px;
    position: relative;
    margin-bottom: 50px !important;

    .mktoFormRow {
      max-width: 100%;
    }

    .mktoButtonRow {
      position: relative;
      width: 100%;
      max-width: 47.107%;
      display: flex !important;
      justify-content: flex-end;
      margin-left: auto !important;
    }


  }

  @media (max-width: 767px) {
    display: flex;
    flex-direction: column;
    justify-content: center;
    max-width: 100%;
    margin-top: 0px !important;
    overflow: hidden;
    padding-bottom: 40px !important;
    max-height: unset !important;

    .mktoError {
      left: 0;
    }

    .mktoErrorArrowWrap {
      display: none;
    }

    .mktoErrorMsg {
      background-color: transparent !important;
      color: red;
      background-image: unset;
      text-shadow: unset;
      border: none;
      box-shadow: none;
      margin: 0;
      padding: 0;
      font-size: 10px;
    }



    .mktoCheckboxList {
      width: 100% !important;
    }

    .mktoForm .mktoButtonRow {
      display: flex;
      width: 100%;
      justify-content: center;
    }

     input[type="text"],
     input[type="email"],
     textarea.mktoField,
     select.mktoField {
      font-size: 14px !important;
      height: 40px !important;
    }

     button.mktoButton {
      height: 42px;
    }

     a {
      padding: 0;
    }
  }

}



</style>