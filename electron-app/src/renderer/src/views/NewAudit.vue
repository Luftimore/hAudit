<template>
    <div>
        <h2>Norms and Norm Points</h2>
        <div>
            <button @click="addNorm">Add Norm</button>
        </div>
        <div v-for="(norm, index) in norms" :key="index">
            <input type="text" :value="norm.name" @input="updateNormName($event, index)" placeholder="Enter Norm Name">
            <button @click="addNormPoint(index)">Add Norm Point</button>
            <ul>
                <li v-for="(point, pointIndex) in norm.points" :key="pointIndex">
                <input type="text" :value="point" @input="updateNormPoint($event, index, pointIndex)" placeholder="Enter Norm Point">
                <button @click="removeNormPoint(index, pointIndex)">Remove</button>
                </li>
            </ul>
            <button @click="removeNorm(index)">Remove Norm</button>
        </div>
    </div>
</template>
  
  
<script>
  export default {
    data() {
      return {
        norms: []
      };
    },
    methods: {
      addNorm() {
        this.norms.push({ name: '', points: [] });
      },
      removeNorm(index) {
        this.norms.splice(index, 1);
      },
      addNormPoint(normIndex) {
        this.norms[normIndex].points.push('');
      },
      removeNormPoint(normIndex, pointIndex) {
        this.norms[normIndex].points.splice(pointIndex, 1);
      },
      updateNormName(event, index) {
        this.norms[index].name = event.target.value;
      },
        updateNormPoint(event, normIndex, pointIndex) {
        this.norms[normIndex].points[pointIndex] = event.target.value;
      }
    }
  };
</script>