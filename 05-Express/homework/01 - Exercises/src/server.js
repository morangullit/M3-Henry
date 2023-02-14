const express = require("express");

let publications = [];
const STATUS_ERROR = 400
const STATUS_OK = 200
let index = 1;

const server = express();

server.use(express.json());

server.post('/posts', (req, res) => {
    const { author, title, contents} = req.body;
    if(!author || !title || !contents) return res.status(STATUS_ERROR).json( {error: "No se recibieron los parámetros necesarios para crear la publicación"});
    const post = {
        id: index++,
        author: author,
        title: title,
        contents: contents
    };
    publications.push(post);
    res.status(STATUS_OK).json(post);
});

server.get("/posts", (req, res) => {
    const { term, author, title } = req.query;
    if(term){
        const filterPosts = publications.filter((post) =>{
            return post.title.includes(term) || post.contents.includes(term)
        });
        filterPosts.length > 0 ?
         res.status(STATUS_OK).json(filterPosts)
        : res.status(STATUS_OK).json(publications);
    } else if(author && title){
        const filterPosts = publications.filter((post) =>{
            return post.title === title && post.author === author
        });
        filterPosts.length > 0 ?
        res.status(STATUS_OK).json(filterPosts)
       : res.status(STATUS_ERROR).json( {error: "No existe ninguna publicación con dicho título y autor indicado"} );

    } else {
        res.status(STATUS_OK).json(publications);

    }
 
});
        
        server.get( '/posts/:author', (req, res)=>{
            const {author} = req.params;
            if(author) {
                const filterPosts = publications.filter((post) =>{
                    return post.author === author
                });
                filterPosts.length > 0
                ? res.status(STATUS_OK).json(filterPosts)
                : res.status(STATUS_ERROR).json({error: "No existe ningun post del autor indicado"})
        }
        })

        server.put("/posts/:id", (req, res) => {
            const {id} = req.params;
            const {title, contents} = req.body;
            if(!title || !contents){
                return res.status(STATUS_ERROR).json({error: "No se recibió el id de la publicación a eliminar"})
                } 
                const postIndex = publications.findIndex((post) => 
                    post.id === Number(id))
                    if(postIndex === -1 ){
                       return res.status(STATUS_ERROR).json({error: "No se recibió el id correcto necesario para modificar la publicación"});
                    }
                    const post = {...publications[postIndex], title, contents}
                    publications[postIndex] = post
                    res.status(STATUS_OK).json(post)
                });
              
    server.delete("/posts/:id", (req, res) => {
    const { id } = req.params;
    if (!id) {
      return res
        .status(STATUS_ERROR)
        .json({ error: "No se recibió el id de la publicación a eliminar" });
    }
    const postIndex = publications.findIndex((post) => post.id === Number(id)); // 2
    if (postIndex === -1) {
      return res
        .status(STATUS_ERROR)
        .json({
          error:
            "No se recibió el id correcto necesario para eliminar la publicación",
        });
    }
    publications = publications.filter((e) => e.id !== Number(id));
    return res.status(STATUS_OK).json({ success: true });
  });


server.delete('/author/:name', (req, res) => {
    const { name } = req.params; 
    if(!name) { 
        return res.status(STATUS_ERROR).json( {error:  "No se recibió el nombre del autor"}) 
    }
        const postIndex = publications.findIndex((post) => 
                    post.author === name)
                    if(postIndex === -1 ){
                       return res.status(STATUS_ERROR).json({error:  "No se recibió el nombre correcto necesario para eliminar las publicaciones del autor"});
                    }
                    const post = publications.filter((e) => e.author === name )
                    publications = publications.filter((e) => e.author !== name );
                    return res.status(STATUS_OK).json(post);

    });

//NO MODIFICAR EL CODIGO DE ABAJO. SE USA PARA EXPORTAR EL SERVIDOR Y CORRER LOS TESTS
module.exports = { publications, server };
