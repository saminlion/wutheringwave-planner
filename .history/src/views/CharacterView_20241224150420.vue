<template>
  <div>
    <h1>Character Selection</h1>
    <ul>
      <li v-for="(character, key) in characters" :key="key" @click="selectCharacter(character)">
        <img :src="character.icon" :alt="character.display_name" width="50" />
        <span>{{ character.display_name }}</span>
      </li>
    </ul>
    <div v-if="selectedCharacter">
      <h2>Selected Character: {{ selectedCharacter.display_name }}</h2>
      <img :src="selectedCharacter.icon" :alt="selectedCharacter.display_name" width="100" />
      <p>Weapon: {{ selectedCharacter.weapon }}</p>
    </div>
  </div>
</template>

<script>
import { usePlannerStore } from '../store/planner';
import { computed } from 'vue';
import characterData from '/mnt/data/characterData.json';

export default {
  name: 'CharacterView',
  setup() {
    const plannerStore = usePlannerStore();

    const selectedCharacter = computed(() => plannerStore.selectedCharacter);

    const characters = characterData;

    const selectCharacter = (character) => {
      plannerStore.selectCharacter(character);
    };

    return {
      characters,
      selectedCharacter,
      selectCharacter,
    };
  },
};
</script>

<style>
li {
  cursor: pointer;
  margin: 10px 0;
  display: flex;
  align-items: center;
}

li img {
  margin-right: 10px;
  border-radius: 5px;
}
</style>