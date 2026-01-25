<template>
  <div>
    <div id="layer"></div>
    <div id="layer2"></div>
    <!-- <transition name="fade">
      <side-menu v-if="showMenu"></side-menu>
    </transition> -->
    <!-- <canvas ref="canvas"></canvas> -->
    <!-- <full-page id="fullpage" ref="fullpage" :options="options"> -->
    <name />
    <div>
      <about />
      <projects />
      <contact />
      <vpns />
    </div>
    <!-- </full-page> -->
  </div>
</template>

<script>
import Name from "./Name.vue";
import Projects from "./Projects.vue";
import About from "./About.vue";
import Contact from "./Contact.vue";
import Vpns from "./Vpns.vue";
export default {
  data() {
    return {
      canvas: "",
      noiseData: [],
      frame: 0,
      showMenu: false,
      showSections: false,
      options: {
        menu: "#menu",
        anchors: ["", "about", "projects", "contact"],
        autoScrolling: false,
        fitToSection: false,
        verticalCentered: true,
        scrollingSpeed: 600,
        sectionsColor: ["", "", "", ""],
      },
    };
  },
  components: { Name, About, Projects, Contact, Vpns },
  methods: {
    generateNoise() {
      this.noise = document.createElement("canvas");
      this.noise.height = window.innerHeight * 2;
      this.noise.width = window.innerWidth * 2;
      let noiseContext = this.noise.getContext("2d");
      let noiseData = noiseContext.createImageData(
        this.noise.width,
        this.noise.height
      );
      let buffer32 = new Uint32Array(noiseData.data.buffer);
      let len = buffer32.length - 1;
      while (len--) {
        buffer32[len] = Math.random() < 0.5 ? 0 : -1 >> 0;
      }
      noiseContext.putImageData(noiseData, 0, 0);
    },
    moveNoise() {
      let canvas = this.$refs.canvas;
      let context = canvas.getContext("2d");
      let x = Math.random() * canvas.width;
      let y = Math.random() * canvas.height;
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(this.noise, -x, -y);
      requestAnimationFrame(this.moveNoise);
    },
    showMenuFunction() {
      setTimeout(() => {
        this.showMenu = true;
        this.showSections = true;
      }, 5000);
    },
  },
  mounted() {
    // this.$refs.canvas.height = window.innerHeight;
    // this.$refs.canvas.width = window.innerWidth;
    this.generateNoise();
    requestAnimationFrame(this.moveNoise);
    this.showMenuFunction();
    let layer1 = document.getElementById("layer");
    let layer2 = document.getElementById("layer2");
    setTimeout(() => (layer1.style.transform = "translateX(-100%)"), 1);
    setTimeout(() => (layer2.style.transform = "translateX(-100%)"), 1);
  },
};
</script>
