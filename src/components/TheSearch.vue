<script setup>
import { ref } from 'vue'
import axios from 'axios';

defineProps({
  msg: String
})

const search_query = ref("")

const search_disabled = ref(false)

const result = ref([])

const stack_overflow_items = ref([])

const SERVER_URL = import.meta.env.VITE_SERVER_URL + "/api/v1/search?q="

function doSearch() {
  search_disabled.value = true;
  result.value = [];
  stack_overflow_items.value = [];

  if (search_query.value.trim() == "") return;

  axios.get(`${SERVER_URL}${search_query.value}`)
    .then(response => {
      search_disabled.value = false;

      console.log(response.data);

      for (let item of response.data.crawler_items) {
        item.display_title = handleText(search_query.value, item.title, 100)
        item.body_content = handleText(search_query.value, item.body_content, 200)

        result.value.push(item);
      }

      for (let item of response.data.stack_overflow_items) {
        item.display_title = handleText(search_query.value, item.title, 100)
        item.body_content = handleText(search_query.value, item.body_content, 200)

        stack_overflow_items.value.push(item);
      }
    })
    .catch(e => {
      search_disabled.value = false;
      console.error(e)
    })
}

function handleText(search_term, text, truncate_limit) {
  //const term_position = text.search(`\\b${search_term}\\b`)

  /*const regExp = new RegExp(`\\b${search_term}\\b`, 'gi');

  return text.replace(regExp, match => {
    return '<span class="bg-blue-100">' + match + '</span>';
  });*/

  // let result = text.substr(0, 100);

  let result = text.length > (truncate_limit + 3) ? `${text.substring(0, truncate_limit)}...` : text;

  let s_term = search_term.trim().replace(/\s\s+/g, ' ');

  for (let term of s_term.split(' ')) {

    const regExp = new RegExp(`\\b${term}\\b`, 'gi');

    result = result.replace(regExp, match => {
      return '<span class="bg-blue-100">' + match + '</span>';
    });
  }

  return result;

}
</script>

<template>
<div class="flex-col" >
  <div class="my-10">
    <h1 class="text-center text-2xl font-bold">Bitcoin Dev Search</h1>
  </div>
  <div class="text-center">
    <span class="group relative" >
            <svg 
              width="20" 
              height="20" 
              fill="currentColor" 
              class="absolute left-5 top-1/2 -mt-2.5 text-slate-400 pointer-events-none group-focus-within:text-blue-500" 
              aria-hidden="true">
              <path 
                fill-rule="evenodd" 
                clip-rule="evenodd" 
                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" />
            </svg>
            <input 
              placeholder="Search"
              v-model="search_query" 
              v-on:keydown.enter.prevent="doSearch"
              :disabled="search_disabled"
              class="focus:ring-2 w-full ml-3 mr-3 md:w-1/3 focus:ring-blue-500 focus:outline-none appearance-none text-sm leading-6 
                text-slate-900 placeholder-slate-400 rounded-md py-2 pl-10 ring-1 ring-slate-200 shadow-sm disabled:bg-slate-200 
                disabled:text-slate-600 disabled:border-slate-200 disabled:shadow-none"/>
          </span>
    <button 
      @click="doSearch"
      :disabled="search_disabled"
      class="focus:ring-2 focus:ring-blue-500 focus:outline-none appearance-none leading-6 text-slate-900 rounded-md mt-2 p-3 ml-3 ring-1 
        ring-slate-200 shadow-sm disabled:bg-slate-200 disabled:text-slate-600 disabled:border-slate-200 disabled:shadow-none">
        Search
      </button>
  </div>
  <div class="text-left w-full md:w-5/6 xl:w-4/6 p-10">
    <ul id="result-1">
      <li v-for="item in result" :key="item.id">
        <p class="text-sm text-gray-600">
          {{ item.domain.substring(0, 200) }}
        </p>
        <p class="mt-1 text-base">
          <a 
            class="text-blue-700 hover:text-blue-900 visited:text-purple-900" 
            :href="item.url">
            <span v-html="item.display_title"></span>
          </a>
        </p>
        <p class="mt-1 text-sm">
          <span v-html="item.body_content"></span>
        </p>

        <div v-if="item.is_email_thread" class="group relative mt-1">
            <svg 
              class="absolute left-1 top-1/2 -mt-2.5 h-4 w-4 text-slate-400 pointer-events-none group-focus-within:text-blue-500" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor">
              <path 
                stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
            </svg>
            <span class="ml-6 text-sm " >
              <!-- <a 
                class="text-blue-700 hover:text-blue-900 visited:text-purple-900" 
                href="#">Show email thread</a> -->
              <router-link
                :to="{name: 'MailThread', query: { subject: item.title, q: search_query }}"
                class="text-blue-700 hover:text-blue-900 visited:text-purple-900" >
                Show email thread
              </router-link>
            </span>
        </div>
        
        <br />
      </li>
      
      <li v-for="item in stack_overflow_items" :key="item.id">
        <p class="text-sm text-gray-600">
          {{ item.domain }}
        </p>
        <p class="mt-1 text-base">
          <a 
            class="text-blue-700 hover:text-blue-900 visited:text-purple-900" 
            :href="item.url">
            <span v-html="item.display_title"></span>
          </a>
        </p>
        <p class="mt-1 text-sm">
          <span v-html="item.body_content"></span>
        </p>
        <br />
      </li>
    </ul>

  </div>

</div>


</template>


