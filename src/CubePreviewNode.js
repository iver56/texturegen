(function(TextureGen, THREE) {
  'use strict';

  function makeMapBundle() {
    var bundle = {};
    bundle.canvas = document.createElement('canvas');
    bundle.canvas.width = 512;
    bundle.canvas.height = 512;
    bundle.ctx = bundle.canvas.getContext('2d');
    bundle.texture = new THREE.Texture(bundle.canvas);
    bundle.texture.wrapS = THREE.RepeatWrapping;
    bundle.texture.wrapT = THREE.RepeatWrapping;
    bundle.texture.repeat.set(1, 1);
    bundle.texture.needsUpdate = true;
    return bundle;
  }

  function updateMapBundle(bundle, input, repeat) {
    if(!input) {
      return;
    }
    bundle.ctx.putImageData(input, 0, 0);
    bundle.texture.repeat.set(repeat, repeat);
    bundle.texture.needsUpdate = true;
    return bundle.texture;
  }

  class CubePreviewNode extends TextureGen.CanvasNode {
    constructor(id) {
      super(id, 'CubePreview', [
        'map',
        'lightmap',
        'aomap',
        'emissivemap',
        'bumpmap',
        'displacementmap',
        'roughnessmap',
        'metalnessmap',
        'alphamap',
        'repeat'
      ]);

      this.map = makeMapBundle();
      this.lightMap = makeMapBundle();
      this.aoMap = makeMapBundle();
      this.emissiveMap = makeMapBundle();
      this.bumpMap = makeMapBundle();
      this.displacementMap = makeMapBundle();
      this.roughnessMap = makeMapBundle();
      this.metalnessMap = makeMapBundle();
      this.alphaMap = makeMapBundle();
      this.renderer = new THREE.WebGLRenderer({
        preserveDrawingBuffer: true  
      });
      this.renderer.setSize(512, 512);
      this.scene = new THREE.Scene();
      this.camera = new THREE.PerspectiveCamera(45, 1, 1, 10000);
      this.camera.position.z = 500;
      this.cube = new THREE.Mesh(
          new THREE.BoxGeometry(200, 200, 200),
          new THREE.MeshStandardMaterial());
      this.scene.add(this.cube);
      var light = new THREE.SpotLight(0xFFFFFF, 1);
      light.position.set(500, 500, 500);
      light.lookAt(new THREE.Vector3(0, 0, 0));
      this.scene.add(light);
      var sun = new THREE.DirectionalLight(0xFFFFFF, 0.5);
      sun.position.set(0, 1, 1);
      this.scene.add(sun);
      this.scene.add(new THREE.AmbientLight(0x222222));
      this.cube.rotation.set(1, 1, 1);

      var that = this;
      function internalRenderLoop() {
          requestAnimationFrame(internalRenderLoop);
          that.cube.rotation.x += 0.01;
          that.cube.rotation.y += 0.02;
          that.renderer.render(that.scene, that.camera);
          that.ctx.drawImage(that.renderer.domElement, 0, 0);
      }
      internalRenderLoop();
    }

    render() {
      if(!this.dirty) {
        return;
      }
      var material = new THREE.MeshStandardMaterial({color: 0xFFFFFF});
      var repeat = this.getInput('repeat') || 1;
      material.map = updateMapBundle(
          this.map, this.getInput('map'), repeat);
      material.lightMap = updateMapBundle(
          this.lightMap, this.getInput('lightmap'), repeat);
      material.aoMap = updateMapBundle(
          this.aoMap, this.getInput('aomap'), repeat);
      material.emissiveMap = updateMapBundle(
          this.emissiveMap, this.getInput('emissivemap'), repeat);
      material.bumpMap = updateMapBundle(
          this.bumpMap, this.getInput('bumpmap'), repeat);
      material.displacementMap = updateMapBundle(
          this.displacementMap, this.getInput('displacementmap'), repeat);
      material.roughnessMap = updateMapBundle(
          this.roughnessMap, this.getInput('roughnessmap'), repeat);
      material.metalnessMap = updateMapBundle(
          this.metalnessMap, this.getInput('metalnessmap'), repeat);
      material.alphaMap = updateMapBundle(
          this.alphaMap, this.getInput('alphamap'), repeat);

      this.cube.material = material;

      this.ctx.drawImage(this.renderer.domElement, 0, 0);
      this.imageData = this.ctx.getImageData(0, 0, 512, 512);
      this.dirty = false;

      for(var key in this.outputs) {
        this.outputs[key].dirty = true;
        this.outputs[key].render();
      }
    }
  }

  TextureGen.CubePreviewNode = CubePreviewNode;
})(TextureGen, THREE);
