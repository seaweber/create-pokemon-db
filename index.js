const fs = require('fs');

// Helpful method that Node doesn't support yet, so this is someone's unofficial implementation of it
// Converts [ ['foo', 'bar'], ['cash', 'money'] ] into { foo: 'bar', cash: 'money' }
const fromEntries = require('object.fromentries');

// 493 requests (for each pokemon) all at once will break, this helper class maintains a queue of a limited number of requests at once,
// and they will all come in *eventually*
const instance = require('./api').api;

async function getPokemonList() {

    try {
        // returns an array of objects containing endpoints for specific pokemon
        /* EXAMPLE
            {
              "name": "bulbasaur",
              "url": "https://pokeapi.co/api/v2/pokemon/1/"
            },
            {
              "name": "ivysaur",
              "url": "https://pokeapi.co/api/v2/pokemon/2/"
            },
            {
              "name": "venusaur",
              "url": "https://pokeapi.co/api/v2/pokemon/3/"
            }
         */
        const response = await instance.get('pokemon/?limit=493');

        // Iterate over this list and retrieve data for each individual pokemon
        return response.data.results.map( pokemon => {
            return instance.get(`pokemon/${ pokemon.name }`);
        });


    } catch (error) {
        console.error(error);
    }
}

const start = async () => {

    // getPokemonList() is async and thus returns a list of Promises. Promises will automatically resolve into data once that data comes in from the internet.
    // Promise.all() will pause code execution until all of the promises resolve
    Promise.all(await getPokemonList())
        // data is the array of responses ONCE THEY'VE ALL COME IN, and each promise has resolved
        .then( responses => {

            const formattedData = responses.map( response => {

                const data = response.data;
                // Given the response data, take the data we need and structure how we want
                return {
                    id: data.id,
                    name: data.name,
                    sprite: {
                        front: data.sprites["front_default"],
                        back: data.sprites["back_default"]
                    },
                    stats: fromEntries(data.stats.map( stat => [stat.stat.name, stat.base_stat] )),
                    types: data.types.map( type => type.type.name )
                }
        // Since responses came in asynchronously, they'll probably be out of order in the array so sort them by ID
        }).sort(( {id: a}, {id: b} ) => a - b );

        // Write results to .json file
        fs.writeFile("pokemon.json", JSON.stringify(formattedData), function(err) {
            if (err) {
                console.log(err);
            }
        });
    });

};

start();
