<template>
  <nav class="post-content-menu">

    <ul>
      <li v-for="heading in headings" :key="heading.id" :class="{ active: isActive(heading.id) }">
        <a :href="'#' + heading.id">{{ heading.text }}</a>
      </li>
    </ul>
  </nav>
</template>

<script>
export default {
  props: {
    content: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      headings: [],
      activeId: '', // To keep track of the active section

    };
  },
  mounted() {
    this.extractHeadings();
    this.setupIntersectionObserver(); // Initialize the observer

  },
  methods: {
    extractHeadings() {
      // Create a temporary DOM element to parse the HTML content
      const parser = new DOMParser();
      const doc = parser.parseFromString(this.content, 'text/html');

      // Select all h2 and h3 elements (or any heading level you need)
      const headingElements = doc.querySelectorAll('h2, h3');

      this.headings = Array.from(headingElements).map(element => {
        const text = element.innerText.trim();  // Get the heading text
        const id = text.toLowerCase()
            .replace(/\s+/g, '-')               // Replace spaces with hyphens
            .replace(/[^\w-]+/g, '');           // Remove invalid characters

        return {id, text};
      });
    },
    // Set up Intersection Observer to track active headings
    setupIntersectionObserver() {
      const observerOptions = {
        root: null, // Use the viewport as the root
        rootMargin: '0px 0px -60% 0px', // Margin from the bottom to trigger early
        threshold: 0.1, // Trigger when 10% of the element is visible
      };

      const observer = new IntersectionObserver((entries) => {
        // To avoid flickering, track the last active ID
        let currentActiveId = this.activeId;

        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            // Update currentActiveId to the currently intersecting element's id
            currentActiveId = id;
          }
        });

        // Only update activeId if the current active ID changed
        if (currentActiveId !== this.activeId) {
          this.activeId = currentActiveId;
        }
      }, observerOptions);

      // Observe all headings
      this.headings.forEach(heading => {
        const element = document.getElementById(heading.id);
        if (element) {
          observer.observe(element);
        }
      });

      // Also observe the main title
      const mainTitleElement = document.getElementById(this.titleId);
      if (mainTitleElement) {
        observer.observe(mainTitleElement);
      }
    },
    isActive(id) {
      return this.activeId === id; // Check if this ID is the currently active one
    }
  },
};
</script>

<style lang="scss">
@import '~/assets/style/variables';
.post-content-menu {
  width: 187px !important; /* Adjust for your layout */
  box-shadow: 6px 0px 10px 2px #708CB226;
  padding: 0px 16px 52px;
  color: #7E8194;
  font-size: 16px;
  position: relative;
  @media (max-width: #{$sm}) {
    display: none;
  }
  ul {
    position: sticky;
    top: 0;
    padding-top: 52px;
  }

}

.post-content-menu h3 {
  margin-bottom: 10px;

}

.post-content-menu ul {
  list-style-type: none;
  padding-left: 0;
}

.post-content-menu li {
  margin-bottom: 24px;
}

.post-content-menu li.active a {
  color: black; /* Change to your desired active color */
  font-weight: bold; /* Optional: highlight the active item */
  position: relative;
}

.post-content-menu li.active a:before {
  content: "";
  height: 100%;
  width: 2px;
  background-color: black;
  position: absolute;
  left: -8px;

}
</style>