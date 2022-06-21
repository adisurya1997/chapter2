const express = require('express')

const app = express()
const port = 8000

const db = require('./connection/db')

app.set('view engine', 'hbs')

app.use('/assets', express.static(__dirname + '/assets')) 
app.use(express.urlencoded({extended: false}))
let isLogin = true



app.get('/', function(request, response){

    db.connect(function(err, client, done){
        if (err) throw err // menampilkan error koneksi database

        client.query('SELECT * FROM tb_properties', function(err, result){
            if (err) throw err
            console.log(result.rows);
            let data = result.rows

            let dataBlog = data.map(function(item){
                return {
                    ...item,
                    duration: getDuration(item.start_date,item.end_date),
                    isLogin
                }
            })

            response.render('index',{isLogin, blogs: dataBlog})
        })
    })

})

app.get('/contact', function(request, response){
    response.render('contact',{isLogin})
})

app.get('/addproject', function(request, response){
    response.render('addproject',{isLogin})
})

app.post('/addproject', function(request, response){

    let data = request.body
    
    data = {
        title: data.inputtitle,
        content: data.inputmessage,
        startDate: data.inputprojectstartdate,
        endDate: data.inputprojectenddate,
        nodejs: data.nodejs,
        reactjs: data.reactjs,
        android: data.android,
        javascript: data.javascript,

    }

    dataBlog.push(data)
    response.redirect('/')
})

app.get('/updateproject/:index',function(request,response){
    let index = request.params.index
    dataBlog.splice(index, 1)

    response.redirect('/')
})

app.get('/deleteproject/:index',function(request,response){
    let index = request.params.index
    dataBlog.splice(index, 1)

    response.redirect('/')
})



app.get('/project-detail/:index', function(request, response){
    let id = request.params.id

    let index = request.params.index
    console.log(index);

    let blog = dataBlog[index]

    console.log(blog);

    response.render('project-detail', blog)
})

function geticonr(reactjs){
    let r = reactjs;

    if (r == "true"){
        return "true"
    }else{
        return "false"
    }
}
function geticona(android){
    let a = android;

    if (a == "true"){
        return "true"
    }else{
        return "false"
    }
}
function geticonn(nodejs){
    let n = nodejs;

    if (n == "true"){
        return "true"
    }else{
        return "false"
    }
}
function geticonj(javascript){
    let j = javascript;

    if (j == "true"){
        return "true"
    }else{
        return "false"
    }
}
function getDuration(startDate, endDate) {
    let start = new Date(startDate);
    let end = new Date(endDate);
    let duration = end.getTime() - start.getTime();
    let month = Math.round(duration / (1000 * 3600 * 24 * 30));
    if (month < 1) {
      return "< 1";
    }else {
      return month;
    }
}
app.listen(port, function(){
    console.log(`Server running on port ${port}`);
})