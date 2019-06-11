<template>
    <div style="display: flex; justify-content:center; min-width:480px; overflow: hidden;">
        <div>
            <router-view></router-view>
            <div v-if="false" style="display: flex; justify-content:space-around;">
                <router-link to="/photo">photo</router-link>
                <router-link to="/camera">camera</router-link>
                <router-link to="/upload">upload</router-link>
            </div>
        </div>
    </div>
</template>
<script>
/* eslint-disable */
export default {
    name: 'app'
}
</script>
<style>
</style>