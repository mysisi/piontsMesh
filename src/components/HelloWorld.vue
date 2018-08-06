<template>
  <div ref="points" class="full">
  </div>
</template>

<script>
import PointsMesh from '../lib/pointsMesh.js'

export default {
  name: 'HelloWorld',
  data () {
    return {
      msg: 'Welcome to Your Vue.js App'
    }
  },
  mounted () {
    let pm = new PointsMesh(this.$refs.points)
    // console.log('points', this.$refs.points)
    // let p = new Points(this.$refs.points, [
    //   'Sisi',
    //   'love',
    //   'MY',
    //   'love'
    // ])
  }
}
</script>
<style>

</style>
