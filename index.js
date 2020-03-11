const axios = require('axios');

const instance = axios.create({
    baseURL: 'https://pokeapi.co/api/v2/',
    timeout: 50000
});

// Want to use async/await? Add the `async` keyword to your outer function/method.
async function getPokemonList() {

    try {
        const response = await instance.get('pokemon/?limit=493');
        // console.log(response.data.results);

        const list = response.data.results.map( async pokemon => {
            const response = await instance.get(`pokemon/${ pokemon.name }`);
            // console.log(response);
            return {
                id: response.data.id,
                name: response.data.name,
                sprite: {
                    front: response.data.sprites["front_default"],
                    back: response.data.sprites["back_default"]
                },
                stats: response.data.stats.map( stat => { return { [stat.stat.name]: stat.base_stat} }  ),
                types: response.data.types.map( type => type.type.name )
            }

        });

        return Promise.all(list);

    } catch (error) {
        console.error(error);
    }
}

const start = async () => {
    const fs = require('fs');
    const data = await getPokemonList();

    fs.writeFile("pokemon.json", data, function(err) {
        if (err) {
            console.log(err);
        }
    });
    //console.log(bigData);
};

start();

// .then( response => {
//     response.data.results.forEach( async pokemon => {
//         return await instance.get(`pokemon/${ pokemon.name }`).then( response => {
//             console.log({
//                 id: response.id,
//                 name: response.name,
//                 sprite: {
//                     front: response.sprites["front_default"],
//                     back: response.sprites["back_default"]
//                 },
//                 stats: response.stats.map( stat => { return { [stat.stat.name]: stat.base_stat} }  ),
//                 types: response.types.map( type => type.type.name )
//             });
//             //console.log(bigData);
//         });
//
//     });
// });
