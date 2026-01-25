<template>
  <nav class="side-menu" id="menu">
    <ul>
      <li data-menuanchor="about"><a href="#about">About Me</a></li>
      <li data-menuanchor="projects"><a href="#projects">Projects</a></li>
      <li data-menuanchor="contact"><a href="#contact">Contact Me</a></li>
      <li data-menuanchor="vpns"><a href="#vpns">Vpns</a></li>
    </ul>
  </nav>
</template>

<script>
export default {
  computed: {
    test() {
      return window;
    },
  },
  watch: {
    test(val) {
      console.log(val);
      this.isInViewport("test");
    },
  },
  // created () {
  //   window.addEventListener('scroll', this.isInViewport('test'));
  // },
  methods: {
    isInViewport(elem) {
      var bounding = document.querySelector(elem).getBoundingClientRect();
      return (
        bounding.top >= 0 &&
        bounding.left >= 0 &&
        bounding.bottom <=
          (window.innerHeight || document.documentElement.clientHeight) &&
        bounding.right <=
          (window.innerWidth || document.documentElement.clientWidth)
      );
    },
  },
};
</script>
