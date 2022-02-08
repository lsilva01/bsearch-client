<script setup>
import axios from 'axios';
import { useRoute } from 'vue-router'
import { onMounted, ref } from 'vue'

const SERVER_URL = import.meta.env.VITE_SERVER_URL + "/api/v1/search_title?q="

const result = ref([])

const route = useRoute()
const title = ref(route.query.subject || "")
const search_query = ref(route.query.q || "")

function getMatchIndices(term, str) {
   let result = [];
   let match;
   const regExp = new RegExp(`\\b${term}\\b`, 'gi');
   while (match = regExp.exec(str))
      result.push(match.index);
   return result;
}


function getHighlightIndices(search_term, text) {
    const indexes = getMatchIndices(search_term, text);

    let snippets = [];

    while (indexes.length > 4) {
        // indexes.splice(Math.floor(Math.random()*indexes.length), 1);
        (Math.random() >= 0.5) ? indexes.shift() : indexes.pop()
    }

    while (indexes.length > 0) {
        let start_index = 0;
        let end_index = 0;

        start_index = indexes.shift();

        if (snippets.length > 0) {

            let last_snippet = snippets[snippets.length - 1];

            if (last_snippet.end_index + 50 >= start_index) {
                // previous item joins the new one
                last_snippet.end_index = start_index;
            } else { 
                // new item will be created
                end_index = start_index + 200;

                snippets.push({
                    start_index: start_index - 30,
                    end_index
                })
            }

        } else {
            // first item
            if (start_index - 50 >= 0) {
                start_index = start_index - 50;
            }

            end_index = start_index + 200;

            snippets.push({
                start_index,
                end_index
            })
        }
    }

    return snippets;
}

function handleText(search_term, text) {
    
    let indices = getHighlightIndices(search_term, text);

    let final_text = "";

    if (!indices) {
        final_text = text.substring(0, 200);
    }

    let texts = [];

    //for (let index of indices) {
    for (const [i, index] of indices.entries()) {
        
        let subtext =  text.substring(index.start_index, index.end_index);

        if (i == 0 && index.start_index > 4) {
            subtext = "..." + subtext;
        }

        if (i == indices.length - 1 && index.end_index < text.length - 4) {
            subtext = subtext + "...";
        }

        
        texts.push(subtext);
        
    }
    
   final_text = texts.join(' [...] ');

   let s_term = search_term.trim().replace(/\s\s+/g, ' ');

    for (let term of s_term.split(' ')) {

        const regExp = new RegExp(`\\b${term}\\b`, 'gi');

        final_text = final_text.replace(regExp, match => {
        return '<span class="bg-blue-100">' + match + '</span>';
        });
    }

  return final_text;
}

onMounted(async () => {

    if (!title.value) return;

    result.value = [];


    await axios
      .get(`${SERVER_URL}${title.value}`)
      .then(response => {
        for (let item of response.data) {
            item.display_text = handleText(search_query.value, item.body_content)
            item.display_title = handleTitle(search_query.value, item.title, 100)
            result.value.push(item)
        }
        
      })
      .catch(e => {
        console.error(e)
      })
})

function handleTitle(search_term, text, truncate_limit) {

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
            <h1 class="text-center text-2xl font-bold">E-mail Thread</h1>
            <h2 class="text-center font-bold">Title: {{title}}</h2>
        </div>
    </div>
    <div class="text-center w-full" v-if="!result.length">Searching e-mails ...</div>
    <div class="text-left w-full md:w-5/6 xl:w-4/6 p-10">
        <ul id="result-1">
            <li v-for="item in result" :key="item.id">
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
                <span v-html="item.display_text"></span>
                </p>
                <br />
            </li>
        </ul>
    </div>
  
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  /*text-align: center;
  color: #2c3e50;
  margin-top: 60px;*/
}
</style>