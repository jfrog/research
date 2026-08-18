<template>
  <div class="container mx-auto px-2">
    <section
      id="homeHero"
      class="home-hero flex flex-col sm:flex-row py-10 md:pt-0 md:pb-0  gap-8"
    >
    
      <div class="content w-full sm:w-7/12 text-center sm:text-left">
        <h1>
          Cutting Edge Security Research to Protect the Modern Software Supply&nbsp;Chain
        </h1>
        <p class="hidden sm:block pb-1">
          {{par}}
        </p>
      </div>

      <div class="hero-form w-full px-2 text-center flex-col items-center justify-center">
       <h2 class="font-bold text-jfrog-green dark:text-gray-200" style=" font-size: 22px">Get Critical Security Alerts First</h2>
        <div class="text-black dark:text-gray-200" style="font-size: 11px; margin-top: 12px; margin-bottom: 12px;">Be the first to know when we uncover zero-days,<br>critical CVEs, and supply chain threats.</div>
        <form id="mktoForm_7922"></form>
        <div class="hero-form-content w-full">
          <ul>
            <li>Powered by JFrog Security Research team </li>
            <li>Critical security alerts only</li>
            <li>No spam. Unsubscribe anytime.</li>
          </ul>

        </div>
        <form class="g4-hidden-fields">
          <input type="hidden" name="ga4_form_name" value=""/>
          <input type="hidden" name="ga4_resource_type" value=""/>
          <input type="hidden" name="ga4_type" value=""/>
          <input type="hidden" name="ga4_description" value=""/>
          <input type="hidden" name="ga4_deployment_environment" value=""/>
          <input type="hidden" name="ga4_product" value="event registration"/>
          <input type="hidden" name="ga4_method" value="email"/>
          <input type="hidden" name="ga4_provider" value=""/>
          <input type="hidden" name="ga4_plan" value=""/>
        </form>
        <div id="mktoForm_7922_ty">
          <div class="modal-sub-title" > Thank you ! </div>

        </div>

      </div>


    </section>
  </div>
</template>



<script>
import LottieAnimation from "lottie-vuejs/src/LottieAnimation.vue";

import Button from '~/components/Button.vue'
export default {
  data() {
    return {
      par: 'Our dedicated team of security engineers and researchers are committed to advancing software security through discovery, analysis, and exposure of new vulnerabilities and attack methods.'
    }
  },
  methods: {
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
      script.src = "https://leap.jfrog.com/js/forms2/js/forms2.min.js"; // Update this URL if needed
      script.async = true; // Load script asynchronously
      script.onload = this.initializeForm; // Initialize form after script loads
      document.body.appendChild(script);
    },
    g4EventListenerFirstInteraction(){
      let formFields = document.querySelectorAll(".g4-event input, .g4-event textarea");
      for (let i = 0; i < formFields.length; i++) {
        formFields[i].addEventListener('focus', this.g4FieldsFocus);
        formFields[i].addEventListener('click', this.g4FieldsFocus);
      }
    },
    g4FieldsFocus(event){
      let form = event.currentTarget.closest('.g4-event'); //Zone of all fields
      if (!form) {
        return;
      }
      let currentFormFields = form.querySelectorAll("input, textarea");
      let form_name = form.querySelector('[name=ga4_form_name]').value;
      let resource_type = form.querySelector('[name=ga4_resource_type]').value;
      let form_type = form.querySelector('[name=ga4_type]').value;
      let form_description = form.querySelector('[name=ga4_description]').value;
      let form_deployment_environment = form.querySelector('[name=ga4_deployment_environment]').value;
      let form_product = form.querySelector('[name=ga4_product]').value;
      let form_method = form.querySelector('[name=ga4_method]').value;
      let form_provider = form.querySelector('[name=ga4_provider]').value;
      let form_plan = form.querySelector('[name=ga4_plan]').value;

      for (let i = 0; i < currentFormFields.length; i++) {
        currentFormFields[i].removeEventListener('focus', this.g4FieldsFocus);
        currentFormFields[i].removeEventListener('click', this.g4FieldsFocus);
      }
      if (typeof dataLayer !== 'undefined') {
        dataLayer.push({
              'event': 'fireEvent',
              'event_name': 'form_start',
              'form_name': form_name || undefined,
              'resource_type': resource_type ? resource_type.toLowerCase() : undefined,
              'type': form_type ? form_type.toLowerCase() : undefined,
              'description': form_description ? form_description.toLowerCase() : undefined,
              'deployment_environment': form_deployment_environment ? form_deployment_environment.toLowerCase() : undefined,
              'product': form_product ? form_product.toLowerCase() : undefined,
              'method': form_method ? form_method.toLowerCase() : 'email',
              'provider': form_provider ? form_provider.toLowerCase() : undefined,
              'plan': form_plan ? form_plan.toLowerCase() : undefined,
            }
        );
      }
    },
    ga4SubmitDataLayer(formData) {
      let ga4_form_name = document.querySelector('[name="ga4_form_name"]');
      let ga4_resource_type = document.querySelector('[name="ga4_resource_type"]');
      let ga4_type = document.querySelector('[name="ga4_type"]');
      let ga4_method = document.querySelector('[name="ga4_method"]');
      let form_description = formData.get('ga4_description');
      let environment = formData.get('ga4_deployment_environment');
      let country = formData.get('Country');

      if (typeof dataLayer !== 'undefined') {
        dataLayer.push({
          'event': 'fireEvent',
          'event_name': 'form_submit',
          'form_name': ga4_form_name ? ga4_form_name.value.toLowerCase() : undefined,
          'resource_type': ga4_resource_type ? ga4_resource_type.value.toLowerCase() : undefined,
          'type': ga4_type ? ga4_type.value.toLowerCase() : undefined,
          'description': form_description ? form_description.toLowerCase() : undefined,
          'method': ga4_method ? ga4_method.value.toLowerCase() : 'email',
          'deployment_environment': environment && environment != 'undefined' ? environment.toLowerCase().replaceAll(' ', '-') : undefined,

          'idnt_email': formData.get('Email') ? formData.get('Email').toLowerCase() : undefined,
          'idnt_phone_number': formData.get('Phone') ? formData.get('Phone').toLowerCase() : undefined,
          'idnt_first_name': formData.get('FirstName') ? formData.get('FirstName').toLowerCase() : undefined,
          'idnt_last_name': formData.get('LastName') ? formData.get('LastName').toLowerCase() : undefined,
          'idnt_street': formData.get('street_address') ? formData.get('street_address').toLowerCase() : undefined,
          'idnt_city': formData.get('city') ? formData.get('city').toLowerCase() : undefined,
          'idnt_region': formData.get('region') ? formData.get('region').toLowerCase() : undefined,
          'idnt_postal_code': formData.get('postal_code') ? formData.get('postal_code').toLowerCase() : undefined,
          'idnt_country': country && country != 'null' ? country.toLowerCase() : undefined
        });
      }
    },
    initializeForm() {
      window.MktoForms2.loadForm("https://leap.jfrog.com", "256-FNZ-187", 7922,
           (form)=> {
            const button = document.getElementById("mktoForm_7922")?.getElementsByClassName('mktoButton')[0];
            if (button) {
              button.innerText = 'Subscribe to Security Alerts';
            }

            this.setupGa4Fields();

            form.onSuccess(() => {
              const htmlForm = document.getElementById("mktoForm_7922");

              // Capture the submitted values before the form is reset
              const formData = new FormData(htmlForm);

              if (typeof dataLayer !== 'undefined') {
                dataLayer.push({
                  'formName': 'Research',
                  'event': 'book a demo'
                });
              }
              this.ga4SubmitDataLayer(formData);

              htmlForm.reset();

              const submitButton = htmlForm.getElementsByClassName('mktoButton')[0];
              if (submitButton) {
                submitButton.innerText = 'Subscribe to Security Alerts';
              }

              document.getElementById("mktoForm_7922_ty").style.display = "flex";
              htmlForm.style.display = 'none';
              document.getElementsByClassName("hero-form-content")[0].style.display = "none";
              return false; // Stay on the page instead of following Marketo's thank-you redirect
            });
          }
      );
    },
    setupGa4Fields() {
      const formNameField = document.querySelector('[name="ga4_form_name"]');
      const formTypeField = document.querySelector('[name="ga4_type"]');
      if (formNameField) {
        formNameField.value = 'Research';
      }
      if (formTypeField) {
        formTypeField.value = 'Get Critical Security Alerts First';
      }

      this.g4EventListenerFirstInteraction();
    },



},
  mounted() {
    this.loadMarketoForm();
  },
  components: {
    Button,
    LottieAnimation,
  },
}

</script>


<style lang="scss">
  @import './../../assets/style/variables';

  .home-hero {
    margin-top: 113px;
    margin-bottom: 100px;
    .content {
      // width: 55%;
      h1 {
        width: 514px;
        max-width: 100%;
      }
      p {
        width: 404px;
        max-width: 100%;
      }
    }
  }
  .cls-banner {
    height: calc(100vw - 30px) !important;
    @media screen and (min-width: 640px) {
      height: 221.5px !important;
    }
    @media screen and (min-width: 1024px) {
      height: 100% !important;
    }
  }
  #mktoForm_7922_ty{
    display: none;
    min-height: 276px;
    justify-content: center;
    align-items: center;
  }

  .hero-form{
    max-width: 430px;
    border-radius: 15.64px;
    border: 1px solid #40BE46;
    padding: 25px;
    display: flex;
    flex-direction: column;


    input, select{
      border-radius: 3px !important;
      border: 1px solid #40BE46 !important;
      padding: 14px 12px !important;
      color: black  ;
      font-size: 12px !important;
      background-color: transparent;
      @apply dark:text-gray-200;

      &::placeholder {
        color: #2A3032 !important;
      }

    }


    .mktoFormRow:has(.mktoPlaceholder), .mktoFormRow:has(input[type="hidden"]){
      height: 0;
      width: 0 !important;
      position: static;


    }
    #mktoForm_7922{
    min-height: 120px;
    }
    form.mktoForm button.mktoButton{
      border-radius: 1000px !important;
      background: #36A13B !important;
      font-weight: 500;
      font-size: 16px !important;
      line-height: 1.4;
      border: none !important;
      padding: 12px 0 !important;


    }
    .mktoHtmlText{
      color: black;
      div {
        text-align: left !important;
        @apply dark:text-gray-200;

        span{
          font-size: 10px !important;
        }
      }
    }

    ul {
      list-style-type: disc; /* Remove default bullets */
      padding-left: 20px;
      margin-top: 12px;
      margin-bottom: 12px;
    }
    li {
      position: relative;
      margin-bottom: 5px;
      font-size: 10px;
      color: #000;
      text-align: left;
      @apply dark:text-gray-200;
    }


    #mktoForm_7922:has(.mktoFormRow){
      display: contents;
    }
    .mktoButtonRow{
      order: 2;
    }
 
    .mktoFormRow:nth-child(5){
      order: 1;

    }
    .mktoFormRow:nth-child(6){
      order: 1;

    }

  }
  .dark input::placeholder, .dark select {
    --tw-text-opacity: 1;
    color: rgba(229, 231, 235, var(--tw-text-opacity)) !important;
  }
</style>
