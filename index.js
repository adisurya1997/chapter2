const express = require('express')

const app = express()
const port = 8000


app.set('view engine', 'hbs')

app.use('/assets', express.static(__dirname + '/assets')) 
app.use(express.urlencoded({extended: false}))
let isLogin = true
app.get('/', function(request, response){
    response.render('index',{isLogin})
})

app.get('/contact', function(request, response){
    response.render('contact',{isLogin})
})

app.get('/addproject', function(request, response){
    response.render('addproject')
})

app.post('/addproject', function(request, response){
    // console.log(request);
    console.log(request.body);
    // console.log(request.body.inputTitle);

    response.redirect('/addproject')
})

app.get('/project-detail/:id', function(request, response){
    let id = request.params.id

    response.render('project-detail',{
        isLogin,
        blog: {
            id,
            title: 'Selamat datang',
            content: 'Lorem ipsum dolor, sit amet consectetur adipisicing elit. Quibusdam dignissimos eveniet explicabo, provident animi porro deleniti velit facilis omnis illo, eligendi quaerat atque dicta qui dolor tenetur, vero minus magnam!',
            author: 'adi surya basri',
            postAt: '16 Juni 2022 10:24 WIB'
        }
    })
})

app.listen(port, function(){
    console.log(`Server running on port ${port}`);
})